import { describe, expect, it } from 'vitest';
import { generateWithFailover, getMusicProvider, getProviderHealth, getRegisteredProviders } from './generationProvider';

describe('getMusicProvider', () => {
  it('returns demo provider by default', async () => {
    const provider = getMusicProvider('unknown-provider');
    const result = await provider.generate({ prompt: 'test prompt' });

    expect(provider.name).toBe('demo-provider');
    expect(result.status).toBe('COMPLETE');
    expect(result.message).toBe('Generation complete');
    expect(result.audioUrl).toContain('http');
    expect(result.wavUrl).toContain('http');
    expect(result.stemsUrls.vocals).toContain('http');
  });

  it('registers external GPU providers', () => {
    expect(getRegisteredProviders()).toEqual(expect.arrayContaining(['demo', 'runpod', 'replicate', 'modal', 'lambdaLabs']));
  });

  it('fails over when requested provider is unhealthy', async () => {
    process.env.AIXENTRA_UNHEALTHY_GPU_PROVIDERS = 'runpod';
    const result = await generateWithFailover({ prompt: 'test prompt' }, 'runpod');
    expect(result.provider).not.toBe('runpod-provider');
    expect(result.failoverAttempts).toBeGreaterThanOrEqual(1);
    delete process.env.AIXENTRA_UNHEALTHY_GPU_PROVIDERS;
  });

  it('returns provider health checks', async () => {
    const health = await getProviderHealth();
    expect(health.length).toBeGreaterThanOrEqual(5);
    expect(health[0]).toHaveProperty('provider');
    expect(health[0]).toHaveProperty('healthy');
  });
});
