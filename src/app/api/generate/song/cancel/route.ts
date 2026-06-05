import { NextResponse } from 'next/server';
import { cancelGenerationJob, getGenerationJobStatus } from '@/lib/platform/generationQueue';

export async function POST(request: Request) {
  const body = await request.json();
  const jobId = typeof body?.jobId === 'string' ? body.jobId.trim() : '';
  if (!jobId) {
    return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
  }

  const job = await getGenerationJobStatus(jobId);
  if (!job) {
    return NextResponse.json({ error: 'Generation job not found' }, { status: 404 });
  }

  const cancelled = await cancelGenerationJob(jobId);
  if (!cancelled) {
    return NextResponse.json({ error: 'Generation job cannot be cancelled in current state' }, { status: 409 });
  }

  return NextResponse.json({ success: true, message: 'Generation cancelled', jobId });
}
