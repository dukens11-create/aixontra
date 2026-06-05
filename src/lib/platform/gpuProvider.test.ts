import { describe, expect, it } from 'vitest';
import { executeGpuGenerationWithFailover, getGpuProviderHealth } from './gpuProvider';

describe('GPU provider failover', () => {
  it('falls back to next provider when primary fails', async () => {
    process.env.SIMULATE_GPU_PROVIDER_FAILURE = 'runpod';

    const execution = await executeGpuGenerationWithFailover({
      prompt: 'A cinematic electronic score',
      targetDurationSeconds: 90,
    });

    expect(execution.providerAttempts[0]).toBe('runpod');
    expect(execution.selectedProvider).toBe('replicate');
    expect(execution.result.provider).toBe('replicate');
    expect(execution.result.costUsd).toBeGreaterThan(0);

    delete process.env.SIMULATE_GPU_PROVIDER_FAILURE;
  });

  it('reports provider health', async () => {
    const health = await getGpuProviderHealth();
    expect(health.length).toBeGreaterThanOrEqual(4);
    expect(health.every((entry) => typeof entry.healthy === 'boolean')).toBe(true);
  });
});
