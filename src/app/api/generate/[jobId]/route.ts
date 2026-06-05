import { NextResponse } from 'next/server';
import { getJobRecord } from '@/lib/queue/generationService';

/**
 * GET /api/generate/[jobId]
 *
 * Polls the status of a generation job.
 *
 * Response:
 * {
 *   jobId: string,
 *   status: 'QUEUED' | 'PROCESSING' | 'COMPLETE' | 'FAILED' | 'CANCELLED',
 *   progress: number,          // 0-100
 *   queuePosition: number | null,
 *   estimatedWaitSeconds: number | null,
 *   result: GenerationJobResult | null,
 *   errorMessage: string | null,
 *   enqueuedAt: string,
 *   startedAt: string | null,
 *   completedAt: string | null,
 * }
 */
export async function GET(_request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const resolvedParams = await params;
  const { jobId } = resolvedParams;
  if (!jobId) {
    return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
  }

  const record = getJobRecord(jobId);
  if (!record) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  return NextResponse.json(record);
}
