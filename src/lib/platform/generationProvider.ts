import { DEMO_AUDIO_URL } from './demoData';
import { GPU_WORKER_CONFIG, type GpuProviderKey } from './gpuWorkerConfig';

export type GenerationStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETE' | 'FAILED';

export type GenerationInput = {
  prompt: string;
  lyrics?: string;
  genre?: string;
  mood?: string;
  language?: string;
  bpm?: number;
  vocalStyle?: string;
  instrumentalOnly?: boolean;
  targetDurationSeconds?: number;
  masteringPreset?: 'LOUDNESS_NORMALIZATION' | 'CLEAN_MIX' | 'RADIO_READY';
  timeoutMs?: number;
};

export type GenerationResult = {
  audioUrl: string;
  wavUrl: string;
  stemsUrls: Record<'vocals' | 'drums' | 'bass' | 'melody' | 'instrumental' | 'fullMix', string>;
  coverUrl?: string;
  videoUrl?: string;
  masteredAudioUrl?: string;
  provider: string;
  status: GenerationStatus;
  message: 'Generation complete';
  estimatedCostUsd?: number;
  failoverAttempts?: number;
  generatedAt?: string;
};

export interface AiMusicProvider {
  name: string;
  key: GpuProviderKey;
  generate(input: GenerationInput): Promise<GenerationResult>;
  healthCheck(): Promise<ProviderHealthStatus>;
  estimateCost(input: GenerationInput): number;
}

class DemoMusicProvider implements AiMusicProvider {
  name = 'demo-provider';
  key: GpuProviderKey = 'demo';

  async generate(_input: GenerationInput): Promise<GenerationResult> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const stemsUrls = {
      vocals: `${DEMO_AUDIO_URL}&stem=vocals`,
      drums: `${DEMO_AUDIO_URL}&stem=drums`,
      bass: `${DEMO_AUDIO_URL}&stem=bass`,
      melody: `${DEMO_AUDIO_URL}&stem=melody`,
      instrumental: `${DEMO_AUDIO_URL}&stem=instrumental`,
      fullMix: `${DEMO_AUDIO_URL}&stem=full_mix`,
    };
    return {
      audioUrl: DEMO_AUDIO_URL,
      wavUrl: `${DEMO_AUDIO_URL}&format=wav`,
      stemsUrls,
      coverUrl: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?auto=format&fit=crop&w=900&q=80',
      videoUrl: 'https://example.com/visualizer/placeholder.mp4',
      masteredAudioUrl: `${DEMO_AUDIO_URL}&mastered=true`,
      provider: this.name,
      status: 'COMPLETE',
      message: 'Generation complete',
      estimatedCostUsd: 0,
      generatedAt: new Date().toISOString(),
    };
  }

  async healthCheck(): Promise<ProviderHealthStatus> {
    return {
      provider: this.key,
      healthy: true,
      latencyMs: 20,
      checkedAt: new Date().toISOString(),
    };
  }

  estimateCost(): number {
    return 0;
  }
}

class ExternalGpuPlaceholderProvider implements AiMusicProvider {
  constructor(
    public key: GpuProviderKey,
    public name: string,
    private latencyMs: number,
    private baseCostUsd: number,
  ) {}

  async generate(input: GenerationInput): Promise<GenerationResult> {
    await new Promise((resolve) => setTimeout(resolve, this.latencyMs));
    const suffix = `provider=${this.key}&prompt=${encodeURIComponent(input.prompt.slice(0, 24))}`;
    return {
      audioUrl: `${DEMO_AUDIO_URL}&${suffix}`,
      wavUrl: `${DEMO_AUDIO_URL}&format=wav&${suffix}`,
      stemsUrls: {
        vocals: `${DEMO_AUDIO_URL}&stem=vocals&${suffix}`,
        drums: `${DEMO_AUDIO_URL}&stem=drums&${suffix}`,
        bass: `${DEMO_AUDIO_URL}&stem=bass&${suffix}`,
        melody: `${DEMO_AUDIO_URL}&stem=melody&${suffix}`,
        instrumental: `${DEMO_AUDIO_URL}&stem=instrumental&${suffix}`,
        fullMix: `${DEMO_AUDIO_URL}&stem=full_mix&${suffix}`,
      },
      coverUrl: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?auto=format&fit=crop&w=900&q=80',
      videoUrl: 'https://example.com/visualizer/placeholder.mp4',
      masteredAudioUrl: `${DEMO_AUDIO_URL}&mastered=true&${suffix}`,
      provider: this.name,
      status: 'COMPLETE',
      message: 'Generation complete',
      estimatedCostUsd: this.estimateCost(input),
      generatedAt: new Date().toISOString(),
    };
  }

  async healthCheck(): Promise<ProviderHealthStatus> {
    const unhealthyProviders = (process.env.AIXENTRA_UNHEALTHY_GPU_PROVIDERS ?? '')
      .split(',')
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean);
    const healthy = !unhealthyProviders.includes(this.key.toLowerCase());
    return {
      provider: this.key,
      healthy,
      latencyMs: this.latencyMs,
      message: healthy ? 'Provider healthy' : 'Provider marked unhealthy by environment',
      checkedAt: new Date().toISOString(),
    };
  }

  estimateCost(input: GenerationInput): number {
    const durationFactor = Math.max(0.5, (input.targetDurationSeconds ?? 120) / 120);
    return Number((this.baseCostUsd * durationFactor).toFixed(4));
  }
}

export type ProviderHealthStatus = {
  provider: GpuProviderKey;
  healthy: boolean;
  latencyMs: number;
  checkedAt: string;
  message?: string;
};

export const providerRegistry: Record<GpuProviderKey, AiMusicProvider> = {
  demo: new DemoMusicProvider(),
  runpod: new ExternalGpuPlaceholderProvider('runpod', 'runpod-provider', 180, 0.09),
  replicate: new ExternalGpuPlaceholderProvider('replicate', 'replicate-provider', 220, 0.11),
  modal: new ExternalGpuPlaceholderProvider('modal', 'modal-provider', 140, 0.08),
  lambdaLabs: new ExternalGpuPlaceholderProvider('lambdaLabs', 'lambdalabs-provider', 160, 0.1),
};

export const getMusicProvider = (providerKey = process.env.AI_MUSIC_PROVIDER ?? GPU_WORKER_CONFIG.defaultProvider) => {
  return providerRegistry[providerKey as GpuProviderKey] ?? providerRegistry.demo;
};

export const getRegisteredProviders = () => Object.keys(providerRegistry) as GpuProviderKey[];

export const getProviderHealth = async () => {
  const entries = await Promise.all(
    getRegisteredProviders().map(async (provider) => providerRegistry[provider].healthCheck()),
  );
  return entries.sort((a, b) => Number(b.healthy) - Number(a.healthy) || a.latencyMs - b.latencyMs);
};

export const generateWithFailover = async (
  input: GenerationInput,
  preferredProvider?: GpuProviderKey,
  options?: { timeoutMs?: number; failoverEnabled?: boolean },
) => {
  const timeoutMs = options?.timeoutMs ?? input.timeoutMs ?? GPU_WORKER_CONFIG.generationTimeoutMs;
  const failoverEnabled = options?.failoverEnabled ?? GPU_WORKER_CONFIG.failoverEnabled;
  const providers = getRegisteredProviders();
  const orderedProviders = preferredProvider
    ? [preferredProvider, ...providers.filter((provider) => provider !== preferredProvider)]
    : providers;

  let attempts = 0;
  let lastError: Error | null = null;

  for (const providerKey of orderedProviders) {
    const provider = providerRegistry[providerKey];
    attempts += 1;
    const health = await provider.healthCheck();
    if (!health.healthy) {
      lastError = new Error(`Provider ${providerKey} is unhealthy`);
      if (!failoverEnabled) break;
      continue;
    }

    try {
      const result = await Promise.race<GenerationResult>([
        provider.generate(input),
        new Promise<GenerationResult>((_, reject) => {
          setTimeout(() => reject(new Error(`Provider ${providerKey} timed out after ${timeoutMs}ms`)), timeoutMs);
        }),
      ]);
      return {
        ...result,
        estimatedCostUsd: result.estimatedCostUsd ?? provider.estimateCost(input),
        failoverAttempts: attempts - 1,
      };
    } catch (error: any) {
      lastError = error instanceof Error ? error : new Error('Generation failed');
      if (!failoverEnabled) break;
    }
  }

  throw lastError ?? new Error('All providers failed');
};
