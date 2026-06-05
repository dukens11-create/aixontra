import { NextResponse } from 'next/server';
import { enqueueGeneration } from '@/lib/queue/generationService';
import { getUserGenerationContext } from '@/lib/platform/platformStore';
import type { GenerationJobData } from '@/lib/queue/types';

/**
 * POST /api/generate
 *
 * Enqueues a new AI music generation job.
 * Pro/Studio users receive priority queue placement.
 *
 * Request body:
 * {
 *   userId: string,
 *   prompt: string,
 *   lyrics?: string,
 *   genre?: string,
 *   mood?: string,
 *   language?: string,
 *   bpm?: number,
 *   vocalStyle?: string,
 *   instrumentalOnly?: boolean,
 *   targetDurationSeconds?: number,
 *   masteringPreset?: 'LOUDNESS_NORMALIZATION' | 'CLEAN_MIX' | 'RADIO_READY',
 *   mode?: 'generate' | 'regenerate' | 'extend',
 * }
 *
 * Response:
 * {
 *   jobId: string,
 *   status: 'QUEUED',
 *   queuePosition: number | null,
 *   estimatedWaitSeconds: number | null,
 * }
 */
export async function POST(request: Request) {
  const body = await request.json();

  if (!body.prompt?.trim()) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }
  if (typeof body.userId !== 'string' || !body.userId.trim()) {
    return NextResponse.json({ error: 'Authentication required: userId is missing.' }, { status: 401 });
  }

  const userId = body.userId.trim();
  const userContext = getUserGenerationContext(userId);
  const requestedDuration = typeof body.targetDurationSeconds === 'number' ? body.targetDurationSeconds : 120;

  if (requestedDuration > userContext.capabilities.maxSongLengthSeconds) {
    return NextResponse.json(
      { error: `Your ${userContext.plan} plan supports up to ${userContext.capabilities.maxSongLengthSeconds} seconds per song.` },
      { status: 403 },
    );
  }

  const isPriority = userContext.capabilities.priorityQueue;

  const jobData: GenerationJobData = {
    userId,
    prompt: body.prompt.trim(),
    lyrics: body.lyrics,
    genre: body.genre,
    mood: body.mood,
    language: body.language,
    bpm: body.bpm,
    vocalStyle: body.vocalStyle,
    instrumentalOnly: body.instrumentalOnly,
    targetDurationSeconds: requestedDuration,
    masteringPreset: body.masteringPreset,
    mode: body.mode ?? 'generate',
    isPriority,
    enqueuedAt: new Date().toISOString(),
  };

  const record = await enqueueGeneration(jobData);

  return NextResponse.json({
    jobId: record.jobId,
    status: record.status,
    queuePosition: record.queuePosition,
    estimatedWaitSeconds: record.estimatedWaitSeconds,
    isPriority,
    plan: userContext.plan,
    creditBalance: userContext.creditBalance,
  });
}
