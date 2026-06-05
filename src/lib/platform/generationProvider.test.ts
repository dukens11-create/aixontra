import { describe, expect, it } from 'vitest';
import { getMusicProvider } from './generationProvider';

describe('getMusicProvider', () => {
  it('returns demo provider by default', async () => {
    const provider = getMusicProvider('unknown-provider');
    const result = await provider.generate({ prompt: 'test prompt' });

    expect(provider.name).toBe('demo-provider');
    expect(result.status).toBe('complete');
    expect(result.message).toBe('Generation complete');
    expect(result.audioUrl).toContain('http');
  });
});
