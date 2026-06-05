import { Queue, Worker } from 'bullmq';
import { createGeneratedDraft, recordGenerationCost } from './platformStore';
import { executeGpuGenerationWithFailover, getGpuProviderHealth, GpuProviderHealth } from './gpuProvider';
import { GenerationInput, GenerationStatus } from './generationProvider';
import { GPU_WORKER_CONFIG, estimateQueueEtaSeconds } from './gpuWorkerConfig';

type QueueBackend = 'bullmq' | 'in_memory';

type QueueJobData = {
  userId: string;
  input: GenerationInput;
  canExportStems: boolean;
  plan: string;
  creditBalance: number;
};

type QueueJobState = {
  id: string;
  status: GenerationStatus;
  progress: number;
  queuePosition: number;
  etaSeconds: number;
  message: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  result?: {
    audioUrl: string;
    wavUrl: string;
    stemsUrls?: Partial<Record<'vocals' | 'drums' | 'bass' | 'melody' | 'instrumental' | 'fullMix', string>>;
    masteredAudioUrl?: string;
    provider: string;
    providerAttempts?: string[];
    healthChecks: GpuProviderHealth[];
    costUsd: number;
    songDraft: ReturnType<typeof createGeneratedDraft>;
  };
  error?: string;
};

const redisUrl = process.env.REDIS_URL;
const useBullMq = Boolean(redisUrl);
const inMemoryJobs = new Map<string, QueueJobState>();
const inMemoryOrder: string[] = [];

const buildRedisConnection = (url: string) => {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: Number(parsed.port || 6379),
    username: parsed.username || undefined,
    password: parsed.password || undefined,
    tls: parsed.protocol === 'rediss:' ? {} : undefined,
    maxRetriesPerRequest: null as null,
  };
};

const redisConnection = useBullMq ? buildRedisConnection(redisUrl!) : null;

const generationQueue = useBullMq
  ? new Queue<QueueJobData>(GPU_WORKER_CONFIG.queueName, {
      connection: redisConnection!,
      defaultJobOptions: {
        attempts: GPU_WORKER_CONFIG.retries,
        backoff: {
          type: 'exponential',
          delay: GPU_WORKER_CONFIG.backoffMs,
        },
        removeOnComplete: GPU_WORKER_CONFIG.removeOnComplete,
        removeOnFail: GPU_WORKER_CONFIG.removeOnFail,
      },
    })
  : null;

let generationWorker: Worker<QueueJobData> | null = null;
let inMemoryProcessing = false;

const nowIso = () => new Date().toISOString();

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  const timeoutPromise = new Promise<T>((_, reject) => {
    const timer = setTimeout(() => {
      clearTimeout(timer);
      reject(new Error(`Generation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]);
};

const executeGenerationJob = async (jobData: QueueJobData) => {
  const generation = await withTimeout(executeGpuGenerationWithFailover(jobData.input), GPU_WORKER_CONFIG.generationTimeoutMs);
  const stemsPayload = jobData.canExportStems ? generation.result.stemsUrls : undefined;
  const songDraft = createGeneratedDraft({
    prompt: jobData.input.prompt,
    lyrics: jobData.input.lyrics,
    genre: jobData.input.genre,
    mood: jobData.input.mood,
    language: jobData.input.language,
    bpm: jobData.input.bpm,
    vocalStyle: jobData.input.vocalStyle,
    instrumentalOnly: jobData.input.instrumentalOnly,
    originalSongId: (jobData.input as any).originalSongId,
    audioUrl: generation.result.audioUrl,
    wavUrl: generation.result.wavUrl,
    stemsUrls: stemsPayload,
    coverUrl: generation.result.coverUrl,
    videoUrl: generation.result.videoUrl,
    masteredAudioUrl: generation.result.masteredAudioUrl,
    generationStatus: generation.result.status,
  });

  return {
    audioUrl: generation.result.audioUrl,
    wavUrl: generation.result.wavUrl,
    stemsUrls: stemsPayload,
    masteredAudioUrl: generation.result.masteredAudioUrl,
    provider: generation.result.provider,
    providerAttempts: generation.providerAttempts,
    healthChecks: generation.healthChecks,
    costUsd: generation.result.costUsd ?? 0,
    songDraft,
  };
};

const attachWorker = () => {
  if (!useBullMq || !generationQueue || generationWorker) return;

  generationWorker = new Worker<QueueJobData>(
    GPU_WORKER_CONFIG.queueName,
    async (job) => {
      const jobId = job.id ?? '';
      if (!jobId) throw new Error('Generation job id missing');
      const existing = inMemoryJobs.get(jobId);
      if (existing) {
        existing.status = 'PROCESSING';
        existing.progress = 25;
        existing.updatedAt = nowIso();
        existing.message = 'Generation processing on GPU provider';
      }

      const result = await executeGenerationJob(job.data);
      recordGenerationCost({
        userId: job.data.userId,
        provider: result.provider,
        jobId,
        amountUsd: result.costUsd,
        prompt: job.data.input.prompt,
      });

      const finalized = inMemoryJobs.get(jobId);
      if (finalized) {
        finalized.status = 'COMPLETE';
        finalized.progress = 100;
        finalized.updatedAt = nowIso();
        finalized.message = 'Generation complete';
        finalized.result = result;
      }

      return result;
    },
    { connection: redisConnection!, concurrency: GPU_WORKER_CONFIG.concurrency },
  );

  generationWorker.on('failed', (job, error) => {
    if (!job?.id) return;
    const existing = inMemoryJobs.get(job.id);
    if (!existing) return;
    existing.status = 'FAILED';
    existing.progress = 100;
    existing.updatedAt = nowIso();
    existing.error = error.message;
    existing.message = 'Generation failed';
  });
};

const processInMemoryQueue = async () => {
  if (inMemoryProcessing) return;
  inMemoryProcessing = true;

  while (true) {
    const nextJobId = inMemoryOrder.find((id) => {
      const state = inMemoryJobs.get(id);
      return state?.status === 'QUEUED';
    });

    if (!nextJobId) break;

    const state = inMemoryJobs.get(nextJobId);
    if (!state) continue;

    state.status = 'PROCESSING';
    state.progress = 30;
    state.queuePosition = 0;
    state.etaSeconds = 0;
    state.updatedAt = nowIso();
    state.message = 'Generation processing on in-memory worker';

    try {
      const payload = await executeGenerationJob({
        userId: state.userId,
        input: (state as any).input,
        canExportStems: (state as any).canExportStems,
        plan: (state as any).plan,
        creditBalance: (state as any).creditBalance,
      });
      recordGenerationCost({
        userId: state.userId,
        provider: payload.provider,
        jobId: nextJobId,
        amountUsd: payload.costUsd,
        prompt: ((state as any).input as GenerationInput).prompt,
      });

      state.result = payload;
      state.status = 'COMPLETE';
      state.progress = 100;
      state.updatedAt = nowIso();
      state.message = 'Generation complete';
    } catch (error: any) {
      state.status = 'FAILED';
      state.progress = 100;
      state.updatedAt = nowIso();
      state.error = error.message ?? 'Unknown generation failure';
      state.message = 'Generation failed';
    }
  }

  inMemoryProcessing = false;
};

export const enqueueGenerationJob = async (data: QueueJobData & { priority: number }) => {
  attachWorker();

  const jobId = `gen-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const queuePosition = inMemoryOrder.filter((id) => {
    const job = inMemoryJobs.get(id);
    return job?.status === 'QUEUED';
  }).length + 1;

  const state: QueueJobState = {
    id: jobId,
    status: 'QUEUED',
    progress: 5,
    queuePosition,
    etaSeconds: estimateQueueEtaSeconds(queuePosition),
    message: 'Generation job queued',
    createdAt: nowIso(),
    updatedAt: nowIso(),
    userId: data.userId,
  };

  (state as any).input = data.input;
  (state as any).canExportStems = data.canExportStems;
  (state as any).plan = data.plan;
  (state as any).creditBalance = data.creditBalance;

  inMemoryJobs.set(jobId, state);
  inMemoryOrder.push(jobId);

  if (useBullMq && generationQueue) {
    await generationQueue.add('generate-song', data, {
      jobId,
      priority: data.priority,
    });
  } else {
    setTimeout(() => {
      void processInMemoryQueue();
    }, 0);
  }

  return {
    ...state,
    backend: (useBullMq ? 'bullmq' : 'in_memory') as QueueBackend,
  };
};

export const getGenerationJobStatus = async (jobId: string) => {
  const tracked = inMemoryJobs.get(jobId);
  if (!tracked) return null;

  if (useBullMq && generationQueue) {
    const job = await generationQueue.getJob(jobId);
    if (job && tracked.status !== 'COMPLETE' && tracked.status !== 'FAILED') {
      const state = await job.getState();
      tracked.status = state === 'active' ? 'PROCESSING' : tracked.status;
      tracked.updatedAt = nowIso();
      tracked.queuePosition = Math.max(0, tracked.queuePosition - 1);
      if (tracked.status === 'PROCESSING') tracked.progress = Math.max(tracked.progress, 25);
    }
  } else {
    const queuedAhead = inMemoryOrder.filter((id) => {
      if (id === jobId) return false;
      const state = inMemoryJobs.get(id);
      return state?.status === 'QUEUED';
    }).length;
    tracked.queuePosition = tracked.status === 'QUEUED' ? queuedAhead + 1 : 0;
    tracked.etaSeconds = estimateQueueEtaSeconds(tracked.queuePosition);
  }

  return tracked;
};

export const cancelGenerationJob = async (jobId: string) => {
  const tracked = inMemoryJobs.get(jobId);
  if (!tracked) return false;

  if (tracked.status === 'COMPLETE' || tracked.status === 'FAILED') return false;

  tracked.status = 'FAILED';
  tracked.progress = 100;
  tracked.updatedAt = nowIso();
  tracked.error = 'Generation cancelled by user';
  tracked.message = 'Generation cancelled';

  if (useBullMq && generationQueue) {
    const job = await generationQueue.getJob(jobId);
    await job?.remove();
  }

  return true;
};

export const getGenerationQueueHealth = async () => {
  const providerHealth = await getGpuProviderHealth();
  return {
    backend: (useBullMq ? 'bullmq' : 'in_memory') as QueueBackend,
    queueName: GPU_WORKER_CONFIG.queueName,
    pendingJobs: [...inMemoryJobs.values()].filter((job) => job.status === 'QUEUED').length,
    activeJobs: [...inMemoryJobs.values()].filter((job) => job.status === 'PROCESSING').length,
    providerHealth,
  };
};
