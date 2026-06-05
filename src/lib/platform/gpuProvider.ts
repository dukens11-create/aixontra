import { DEMO_AUDIO_URL } from './demoData';
import { GenerationInput, GenerationResult } from './generationProvider';

export type GpuProviderKey = 'runpod' | 'replicate' | 'modal' | 'lambda_labs';

export type GpuProviderHealth = {
  provider: GpuProviderKey;
  healthy: boolean;
  latencyMs: number;
  checkedAt: string;
  message?: string;
};

export type GpuGenerationProvider = {
  key: GpuProviderKey;
  timeoutMs: number;
  costPerSecondUsd: number;
  enabled: boolean;
  generate(input: GenerationInput): Promise<GenerationResult>;
  healthCheck(): Promise<GpuProviderHealth>;
};

export type GpuGenerationExecution = {
  result: GenerationResult;
  providerAttempts: GpuProviderKey[];
  healthChecks: GpuProviderHealth[];
  selectedProvider: GpuProviderKey;
};

const GPU_GENERATION_TIMEOUT_MS = Number(process.env.GPU_GENERATION_TIMEOUT_MS ?? 120_000);

const GPU_PROVIDER_SETTINGS: Record<GpuProviderKey, { enabled: boolean; timeoutMs: number; costPerSecondUsd: number }> = {
  runpod: {
    enabled: process.env.RUNPOD_ENABLED !== 'false',
    timeoutMs: Number(process.env.RUNPOD_TIMEOUT_MS ?? GPU_GENERATION_TIMEOUT_MS),
    costPerSecondUsd: Number(process.env.RUNPOD_COST_PER_SECOND_USD ?? 0.0018),
  },
  replicate: {
    enabled: process.env.REPLICATE_ENABLED !== 'false',
    timeoutMs: Number(process.env.REPLICATE_TIMEOUT_MS ?? GPU_GENERATION_TIMEOUT_MS),
    costPerSecondUsd: Number(process.env.REPLICATE_COST_PER_SECOND_USD ?? 0.002),
  },
  modal: {
    enabled: process.env.MODAL_ENABLED !== 'false',
    timeoutMs: Number(process.env.MODAL_TIMEOUT_MS ?? GPU_GENERATION_TIMEOUT_MS),
    costPerSecondUsd: Number(process.env.MODAL_COST_PER_SECOND_USD ?? 0.0016),
  },
  lambda_labs: {
    enabled: process.env.LAMBDA_LABS_ENABLED !== 'false',
    timeoutMs: Number(process.env.LAMBDA_LABS_TIMEOUT_MS ?? GPU_GENERATION_TIMEOUT_MS),
    costPerSecondUsd: Number(process.env.LAMBDA_LABS_COST_PER_SECOND_USD ?? 0.0017),
  },
};

const createPlaceholderResult = (provider: GpuProviderKey, input: GenerationInput): GenerationResult => {
  const duration = Math.max(30, Math.min(480, input.targetDurationSeconds ?? 120));
  const quotedPrompt = encodeURIComponent(input.prompt.slice(0, 42));
  const stemsUrls = {
    vocals: `${DEMO_AUDIO_URL}&provider=${provider}&stem=vocals`,
    drums: `${DEMO_AUDIO_URL}&provider=${provider}&stem=drums`,
    bass: `${DEMO_AUDIO_URL}&provider=${provider}&stem=bass`,
    melody: `${DEMO_AUDIO_URL}&provider=${provider}&stem=melody`,
    instrumental: `${DEMO_AUDIO_URL}&provider=${provider}&stem=instrumental`,
    fullMix: `${DEMO_AUDIO_URL}&provider=${provider}&stem=full_mix`,
  };

  return {
    audioUrl: `${DEMO_AUDIO_URL}&provider=${provider}&prompt=${quotedPrompt}`,
    wavUrl: `${DEMO_AUDIO_URL}&provider=${provider}&format=wav`,
    stemsUrls,
    coverUrl: `https://images.unsplash.com/photo-1571330735066-03aaa9429d89?auto=format&fit=crop&w=900&q=80&provider=${provider}`,
    masteredAudioUrl: `${DEMO_AUDIO_URL}&provider=${provider}&mastered=true`,
    provider,
    status: 'COMPLETE',
    message: 'Generation complete',
    costUsd: Number((duration * GPU_PROVIDER_SETTINGS[provider].costPerSecondUsd).toFixed(4)),
  };
};

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

class PlaceholderGpuProvider implements GpuGenerationProvider {
  key: GpuProviderKey;
  timeoutMs: number;
  costPerSecondUsd: number;
  enabled: boolean;

  constructor(key: GpuProviderKey) {
    this.key = key;
    this.timeoutMs = GPU_PROVIDER_SETTINGS[key].timeoutMs;
    this.costPerSecondUsd = GPU_PROVIDER_SETTINGS[key].costPerSecondUsd;
    this.enabled = GPU_PROVIDER_SETTINGS[key].enabled;
  }

  async generate(input: GenerationInput): Promise<GenerationResult> {
    if (!this.enabled) {
      throw new Error(`${this.key} provider is disabled`);
    }

    const simulateFailure = process.env.SIMULATE_GPU_PROVIDER_FAILURE === this.key;
    const latencyMs = Number(process.env.SIMULATE_GPU_PROVIDER_LATENCY_MS ?? 400);

    await wait(Math.max(0, latencyMs));

    if (simulateFailure) {
      throw new Error(`${this.key} provider failed during placeholder generation`);
    }

    return createPlaceholderResult(this.key, input);
  }

  async healthCheck(): Promise<GpuProviderHealth> {
    const startedAt = Date.now();
    const forceUnhealthy = process.env.SIMULATE_GPU_PROVIDER_UNHEALTHY === this.key;

    await wait(20);

    return {
      provider: this.key,
      healthy: this.enabled && !forceUnhealthy,
      latencyMs: Date.now() - startedAt,
      checkedAt: new Date().toISOString(),
      message: forceUnhealthy ? 'Provider marked unhealthy by simulation flag' : undefined,
    };
  }
}

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number, provider: GpuProviderKey): Promise<T> => {
  const timeoutPromise = new Promise<T>((_, reject) => {
    const timer = setTimeout(() => {
      clearTimeout(timer);
      reject(new Error(`${provider} provider generation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
};

export const gpuProviderRegistry: Record<GpuProviderKey, GpuGenerationProvider> = {
  runpod: new PlaceholderGpuProvider('runpod'),
  replicate: new PlaceholderGpuProvider('replicate'),
  modal: new PlaceholderGpuProvider('modal'),
  lambda_labs: new PlaceholderGpuProvider('lambda_labs'),
};

export const GPU_PROVIDER_FALLBACK_ORDER: GpuProviderKey[] = ['runpod', 'replicate', 'modal', 'lambda_labs'];

export const getGpuProviderHealth = async () => {
  const healthChecks = await Promise.all(GPU_PROVIDER_FALLBACK_ORDER.map((key) => gpuProviderRegistry[key].healthCheck()));
  return healthChecks;
};

export const executeGpuGenerationWithFailover = async (input: GenerationInput): Promise<GpuGenerationExecution> => {
  const healthChecks = await getGpuProviderHealth();
  const healthByProvider = new Map(healthChecks.map((entry) => [entry.provider, entry]));
  const providerAttempts: GpuProviderKey[] = [];
  const errors: string[] = [];

  for (const providerKey of GPU_PROVIDER_FALLBACK_ORDER) {
    const provider = gpuProviderRegistry[providerKey];
    const health = healthByProvider.get(providerKey);

    if (!provider.enabled || !health?.healthy) {
      errors.push(`${providerKey} skipped (${health?.message ?? 'unhealthy or disabled'})`);
      continue;
    }

    providerAttempts.push(providerKey);
    try {
      const result = await withTimeout(provider.generate(input), provider.timeoutMs, providerKey);
      return {
        result: {
          ...result,
          providerAttempts,
        },
        providerAttempts,
        healthChecks,
        selectedProvider: providerKey,
      };
    } catch (error: any) {
      errors.push(`${providerKey} failed: ${error.message ?? 'unknown error'}`);
    }
  }

  throw new Error(`All GPU providers failed. ${errors.join('; ')}`);
};
