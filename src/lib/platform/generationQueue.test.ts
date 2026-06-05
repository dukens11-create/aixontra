import { describe, expect, it } from 'vitest';
import { enqueueGenerationJob, getGenerationJobStatus, cancelGenerationJob } from './generationQueue';

describe('generationQueue', () => {
  it('queues and completes a generation job', async () => {
    const queued = await enqueueGenerationJob({
      userId: 'queue-test-user',
      input: { prompt: 'Lo-fi kompa with cinematic pads' },
      canExportStems: true,
      plan: 'PRO',
      creditBalance: 100,
      priority: 1,
    });

    expect(queued.status).toBe('QUEUED');
    expect(queued.id).toContain('gen-');

    let finalStatus = queued.status;
    for (let i = 0; i < 40; i += 1) {
      const state = await getGenerationJobStatus(queued.id);
      if (!state) break;
      finalStatus = state.status;
      if (state.status === 'COMPLETE' || state.status === 'FAILED') {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 60));
    }

    const done = await getGenerationJobStatus(queued.id);
    expect(finalStatus).toBe('COMPLETE');
    expect(done?.result?.provider).toBeTruthy();
    expect(done?.result?.costUsd).toBeGreaterThan(0);
  });

  it('cancels queued generation jobs', async () => {
    const queued = await enqueueGenerationJob({
      userId: 'queue-test-user-cancel',
      input: { prompt: 'Cancel test prompt' },
      canExportStems: false,
      plan: 'FREE',
      creditBalance: 10,
      priority: 10,
    });

    const cancelled = await cancelGenerationJob(queued.id);
    expect(cancelled).toBe(true);

    const state = await getGenerationJobStatus(queued.id);
    expect(state?.status).toBe('FAILED');
    expect(state?.error).toContain('cancelled');
  });
});
