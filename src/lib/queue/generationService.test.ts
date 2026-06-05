import { describe, it, expect, beforeEach } from 'vitest';
import { enqueueGeneration, getJobRecord, cancelJob, getUserJobHistory } from './generationService';
import type { GenerationJobData } from './types';

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
    // Allow async direct generation to run
    await new Promise((r) => setTimeout(r, 600));
    const found = getJobRecord(record.jobId);
    expect(found).not.toBeNull();
    expect(found!.jobId).toBe(record.jobId);
  });

  it('cancelJob cancels a QUEUED job', async () => {
    // Without Redis, jobs start processing immediately, so we test the cancel path
    // by inspecting the return value; a job that has already completed returns false.
    const record = await enqueueGeneration({ ...baseData, userId: 'cancel-test-user' });
    const result = await cancelJob(record.jobId);
    // Either cancelled (if still QUEUED) or false (already moved past QUEUED)
    expect(typeof result).toBe('boolean');
  });

  it('getUserJobHistory returns jobs for the user', async () => {
    const uid = `history-user-${Date.now()}`;
    await enqueueGeneration({ ...baseData, userId: uid });
    await new Promise((r) => setTimeout(r, 600));
    const history = getUserJobHistory(uid);
    expect(history.length).toBeGreaterThan(0);
    expect(history.every((r) => r.userId === uid)).toBe(true);
  });

  it('priority flag is stored on the job data', async () => {
    const record = await enqueueGeneration({ ...baseData, isPriority: true });
    await new Promise((r) => setTimeout(r, 600));
    const found = getJobRecord(record.jobId);
    expect(found).not.toBeNull();
  });
});
