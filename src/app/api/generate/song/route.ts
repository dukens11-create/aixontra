import { NextResponse } from 'next/server';
import { getCreditPacks, getUserGenerationContext, reserveGenerationCredits } from '@/lib/platform/platformStore';
import { enqueueGenerationJob, getGenerationQueueHealth } from '@/lib/platform/generationQueue';

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.prompt?.trim()) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  if (typeof body.userId !== 'string' || !body.userId.trim()) {
    return NextResponse.json({ error: 'Authentication required: userId is missing.' }, { status: 401 });
  }
  const userId = body.userId.trim();
  const requestedDuration = typeof body.targetDurationSeconds === 'number' ? body.targetDurationSeconds : 120;
  const userContext = getUserGenerationContext(userId);
  if (requestedDuration > userContext.capabilities.maxSongLengthSeconds) {
    return NextResponse.json(
      {
        error: `Your ${userContext.plan} plan supports up to ${userContext.capabilities.maxSongLengthSeconds} seconds per song.`,
      },
      { status: 403 },
    );
  }

  const debit = reserveGenerationCredits(userId, userContext.generationCost);
  if (!debit.ok) {
    return NextResponse.json(
      { error: debit.message, creditBalance: userContext.creditBalance, packs: getCreditPacks() },
      { status: 402 },
    );
  }

  const queuedJob = await enqueueGenerationJob({
    userId,
    input: body,
    canExportStems: userContext.capabilities.stemsExport,
    plan: userContext.plan,
    creditBalance: debit.balance,
    priority: userContext.capabilities.priorityQueue ? 1 : 10,
  });

  return NextResponse.json({
    success: true,
    jobId: queuedJob.id,
    generationStatus: queuedJob.status,
    queuePosition: queuedJob.queuePosition,
    etaSeconds: queuedJob.etaSeconds,
    progress: queuedJob.progress,
    queueBackend: queuedJob.backend,
    plan: userContext.plan,
    creditBalance: debit.balance,
    capabilities: userContext.capabilities,
    message: queuedJob.message,
  });
}

export async function GET() {
  const health = await getGenerationQueueHealth();
  return NextResponse.json({ success: true, health });
}
