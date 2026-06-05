import { JobsOptions } from 'bullmq';
import { createGeneratedDraft, getUserGenerationContext, reserveGenerationCredits } from '@/lib/platform/platformStore';
import { getMusicProvider } from '@/lib/platform/generationProvider';
import { getGenerationQueue } from './client';
import type { GenerationJobData, GenerationJobRecord, GenerationJobResult, GenerationJobStatus } from './types';

/**
 * Estimated processing time (in seconds) per job position in the queue.
 * Based on the demo provider's ~400ms generation time; tune this constant
 * when real AI providers are connected (typical range: 10–60 seconds).
 */
const SECONDS_PER_SLOT = 15;

// ---------------------------------------------------------------------------
// In-memory job history (survives within a single server process lifetime).
// Replace with a database-backed store for multi-instance deployments.
// Note: This map grows unbounded — add TTL cleanup or size limits in production.
// ---------------------------------------------------------------------------
const jobHistory = new Map<string, GenerationJobRecord>();

const generateJobId = () => `job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function createRecord(jobId: string, data: GenerationJobData, queuePosition: number | null): GenerationJobRecord {
  return {
    jobId,
    userId: data.userId,
    status: 'QUEUED',
    progress: 0,
    queuePosition,
    estimatedWaitSeconds: queuePosition !== null ? queuePosition * SECONDS_PER_SLOT : null,
    result: null,
    errorMessage: null,
    enqueuedAt: data.enqueuedAt,
    startedAt: null,
    completedAt: null,
  };
}

export function updateJobProgress(jobId: string, progress: number, status: GenerationJobStatus = 'PROCESSING') {
  const record = jobHistory.get(jobId);
  if (!record) return;
  record.progress = progress;
  record.status = status;
  if (status === 'PROCESSING' && !record.startedAt) {
    record.startedAt = new Date().toISOString();
    record.queuePosition = null;
    record.estimatedWaitSeconds = null;
  }
}

export function completeJob(jobId: string, result: GenerationJobResult) {
  const record = jobHistory.get(jobId);
  if (!record) return;
  record.status = 'COMPLETE';
  record.progress = 100;
  record.result = result;
  record.completedAt = new Date().toISOString();
  record.queuePosition = null;
  record.estimatedWaitSeconds = null;
}

export function failJob(jobId: string, errorMessage: string) {
  const record = jobHistory.get(jobId);
  if (!record) return;
  record.status = 'FAILED';
  record.errorMessage = errorMessage;
  record.completedAt = new Date().toISOString();
  record.queuePosition = null;
  record.estimatedWaitSeconds = null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function enqueueGeneration(data: GenerationJobData): Promise<GenerationJobRecord> {
  const jobId = generateJobId();
  const queue = getGenerationQueue();

  if (queue) {
    // BullMQ path: queue the job for the worker to process.
    const opts: JobsOptions = {
      jobId,
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      priority: data.isPriority ? 1 : 10,
      removeOnComplete: { age: 3600 },
      removeOnFail: { age: 86400 },
    };
    await queue.add('generate', data, opts);
    const waitingCount = await queue.getWaitingCount();
    const record = createRecord(jobId, data, waitingCount);
    jobHistory.set(jobId, record);
    return record;
  }

  // Fallback: run synchronously (no Redis), update history inline.
  const record = createRecord(jobId, data, null);
  jobHistory.set(jobId, record);
  runDirectGeneration(jobId, data).catch((err: unknown) => {
    const message = err instanceof Error ? err.message : 'Generation failed unexpectedly';
    console.error('[generationService] Direct generation error:', message);
    failJob(jobId, message);
  });
  return record;
}

/**
 * Executes a generation job directly (without a queue worker).
 * Used when Redis is unavailable.
 */
export async function runDirectGeneration(jobId: string, data: GenerationJobData): Promise<void> {
  updateJobProgress(jobId, 10, 'PROCESSING');
  try {
    const userContext = getUserGenerationContext(data.userId);
    const debit = reserveGenerationCredits(data.userId, userContext.generationCost);
    if (!debit.ok) {
      failJob(jobId, debit.message);
      return;
    }
    updateJobProgress(jobId, 30);
    const provider = getMusicProvider();
    updateJobProgress(jobId, 50);
    const generation = await provider.generate(data);
    updateJobProgress(jobId, 80);
    const stemsPayload = userContext.capabilities.stemsExport ? generation.stemsUrls : undefined;
    const songDraft = createGeneratedDraft({
      prompt: data.prompt,
      lyrics: data.lyrics,
      genre: data.genre,
      mood: data.mood,
      language: data.language,
      bpm: data.bpm,
      vocalStyle: data.vocalStyle,
      instrumentalOnly: data.instrumentalOnly,
      audioUrl: generation.audioUrl,
      wavUrl: generation.wavUrl,
      stemsUrls: stemsPayload,
      coverUrl: generation.coverUrl,
      videoUrl: generation.videoUrl,
      masteredAudioUrl: generation.masteredAudioUrl,
      generationStatus: generation.status,
    });
    completeJob(jobId, {
      audioUrl: generation.audioUrl,
      wavUrl: generation.wavUrl,
      stemsUrls: stemsPayload,
      masteredAudioUrl: generation.masteredAudioUrl,
      coverUrl: generation.coverUrl,
      videoUrl: generation.videoUrl,
      provider: generation.provider,
      songDraftId: songDraft.id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Generation failed';
    failJob(jobId, message);
  }
}

export function getJobRecord(jobId: string): GenerationJobRecord | null {
  return jobHistory.get(jobId) ?? null;
}

export async function cancelJob(jobId: string): Promise<boolean> {
  const record = jobHistory.get(jobId);
  if (!record) return false;
  if (record.status !== 'QUEUED') return false;

  const queue = getGenerationQueue();
  if (queue) {
    const job = await queue.getJob(jobId);
    if (job) await job.remove();
  }

  record.status = 'CANCELLED';
  record.completedAt = new Date().toISOString();
  record.queuePosition = null;
  record.estimatedWaitSeconds = null;
  return true;
}

export function getUserJobHistory(userId: string): GenerationJobRecord[] {
  return [...jobHistory.values()]
    .filter((r) => r.userId === userId)
    .sort((a, b) => b.enqueuedAt.localeCompare(a.enqueuedAt));
}
