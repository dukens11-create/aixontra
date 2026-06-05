import { Worker, Job } from 'bullmq';
import { getConnectionConfig, GENERATION_QUEUE_NAME } from './client';
import { runDirectGeneration, updateJobProgress } from './generationService';
import type { GenerationJobData } from './types';

export function startGenerationWorker() {
  const conn = getConnectionConfig();
  if (!conn) {
    console.warn('[worker] Redis not configured — generation worker not started.');
    return null;
  }

  const worker = new Worker<GenerationJobData>(
    GENERATION_QUEUE_NAME,
    async (job: Job<GenerationJobData>) => {
      const { id: jobId, data } = job;
      if (!jobId) return;

      await job.updateProgress(5);
      updateJobProgress(jobId, 5, 'PROCESSING');

      await job.updateProgress(10);
      await runDirectGeneration(jobId, data);
      await job.updateProgress(100);
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      connection: conn as any,
      concurrency: Number(process.env.GENERATION_WORKER_CONCURRENCY ?? 2),
      limiter: { max: 10, duration: 60_000 },
    },
  );

  worker.on('completed', (job) => {
    console.info(`[worker] Job ${job.id} completed.`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[worker] Job ${job?.id} failed:`, err.message);
  });

  worker.on('progress', (job, progress) => {
    console.debug(`[worker] Job ${job.id} progress: ${progress}%`);
  });

  return worker;
}

// Auto-start when run directly.
if (require.main === module) {
  startGenerationWorker();
}
