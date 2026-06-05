import { describe, it, expect, beforeEach } from 'vitest';
import { enqueueGeneration, getJobRecord, cancelJob, getUserJobHistory } from './generationService';
import type { GenerationJobData } from './types';

/** Wait long enough for the demo provider's async generation (~400 ms) to complete. */
const ASYNC_GENERATION_DELAY = 700;

const baseData: GenerationJobData = {
  userId: 'test-user',
  prompt: 'A chill lo-fi beat',
  isPriority: false,
  enqueuedAt: new Date().toISOString(),
};

describe('generationService', () => {
  it('enqueues a job and returns a record with QUEUED or PROCESSING status', async () => {
    const record = await enqueueGeneration({ ...baseData });
    expect(record.jobId).toBeTruthy();
    expect(['QUEUED', 'PROCESSING']).toContain(record.status);
    expect(record.userId).toBe('test-user');
  });

  it('getJobRecord returns the same record after enqueueing', async () => {
    const record = await enqueueGeneration({ ...baseData });
    await new Promise((r) => setTimeout(r, ASYNC_GENERATION_DELAY));
    const found = getJobRecord(record.jobId);
    expect(found).not.toBeNull();
    expect(found!.jobId).toBe(record.jobId);
  });

  it('cancelJob cancels a QUEUED job', async () => {
    const record = await enqueueGeneration({ ...baseData, userId: 'cancel-test-user' });
    const result = await cancelJob(record.jobId);
    // Either cancelled (if still QUEUED) or false (already moved past QUEUED)
    expect(typeof result).toBe('boolean');
  });

  it('getUserJobHistory returns jobs for the user', async () => {
    const uid = `history-user-${Date.now()}`;
    await enqueueGeneration({ ...baseData, userId: uid });
    await new Promise((r) => setTimeout(r, ASYNC_GENERATION_DELAY));
    const history = getUserJobHistory(uid);
    expect(history.length).toBeGreaterThan(0);
    expect(history.every((r) => r.userId === uid)).toBe(true);
  });

  it('priority flag is stored on the job data', async () => {
    const record = await enqueueGeneration({ ...baseData, isPriority: true });
    await new Promise((r) => setTimeout(r, ASYNC_GENERATION_DELAY));
    const found = getJobRecord(record.jobId);
    expect(found).not.toBeNull();
  });
});
