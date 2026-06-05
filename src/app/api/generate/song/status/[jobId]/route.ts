import { NextResponse } from 'next/server';
import { getGenerationJobStatus } from '@/lib/platform/generationQueue';

export async function GET(_request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId: rawJobId } = await params;
  const jobId = rawJobId?.trim();
  if (!jobId) {
    return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
  }

  const job = await getGenerationJobStatus(jobId);
  if (!job) {
    return NextResponse.json({ error: 'Generation job not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, job });
}
