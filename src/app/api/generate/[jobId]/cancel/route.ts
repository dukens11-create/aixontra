import { NextResponse } from 'next/server';
import { cancelJob } from '@/lib/queue/generationService';

/**
 * POST /api/generate/[jobId]/cancel
 *
 * Cancels a queued (not yet processing) generation job.
 * Jobs that are already PROCESSING, COMPLETE, or FAILED cannot be cancelled.
 *
 * Response:
 * { success: true, jobId: string }  — job was cancelled
 * { error: string }                 — job not found or cannot be cancelled
 */
export async function POST(_request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  if (!jobId) {
    return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
  }

  const cancelled = await cancelJob(jobId);
  if (!cancelled) {
    return NextResponse.json(
      { error: 'Job not found or cannot be cancelled (only QUEUED jobs can be cancelled).' },
      { status: 409 },
    );
  }

  return NextResponse.json({ success: true, jobId });
}
