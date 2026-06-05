export const GPU_PROVIDER_KEYS = ['demo', 'runpod', 'replicate', 'modal', 'lambdaLabs'] as const;
export type GpuProviderKey = (typeof GPU_PROVIDER_KEYS)[number];

type GpuAutoscalingConfig = {
  enabled: boolean;
  minWorkers: number;
  maxWorkers: number;
  targetQueueDepth: number;
  scaleUpCooldownSeconds: number;
  scaleDownCooldownSeconds: number;
};

export type GpuWorkerConfig = {
  defaultProvider: GpuProviderKey;
  generationTimeoutMs: number;
  healthcheckIntervalMs: number;
  failoverEnabled: boolean;
  workersPerProvider: Record<GpuProviderKey, number>;
  autoscaling: GpuAutoscalingConfig;
};

const readNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const readProvider = (value: string | undefined): GpuProviderKey => {
  const normalized = (value ?? '').trim() as GpuProviderKey;
  return GPU_PROVIDER_KEYS.includes(normalized) ? normalized : 'demo';
};

export const GPU_WORKER_CONFIG: GpuWorkerConfig = {
  defaultProvider: readProvider(process.env.AIXENTRA_GPU_DEFAULT_PROVIDER),
  generationTimeoutMs: readNumber(process.env.AIXENTRA_GPU_GENERATION_TIMEOUT_MS, 90_000),
  healthcheckIntervalMs: readNumber(process.env.AIXENTRA_GPU_HEALTHCHECK_INTERVAL_MS, 5_000),
  failoverEnabled: process.env.AIXENTRA_GPU_FAILOVER_ENABLED !== 'false',
  workersPerProvider: {
    demo: readNumber(process.env.AIXENTRA_GPU_WORKERS_DEMO, 1),
    runpod: readNumber(process.env.AIXENTRA_GPU_WORKERS_RUNPOD, 2),
    replicate: readNumber(process.env.AIXENTRA_GPU_WORKERS_REPLICATE, 2),
    modal: readNumber(process.env.AIXENTRA_GPU_WORKERS_MODAL, 2),
    lambdaLabs: readNumber(process.env.AIXENTRA_GPU_WORKERS_LAMBDALABS, 2),
  },
  autoscaling: {
    enabled: process.env.AIXENTRA_GPU_AUTOSCALING_ENABLED === 'true',
    minWorkers: readNumber(process.env.AIXENTRA_GPU_AUTOSCALING_MIN_WORKERS, 1),
    maxWorkers: readNumber(process.env.AIXENTRA_GPU_AUTOSCALING_MAX_WORKERS, 8),
    targetQueueDepth: readNumber(process.env.AIXENTRA_GPU_AUTOSCALING_TARGET_QUEUE_DEPTH, 12),
    scaleUpCooldownSeconds: readNumber(process.env.AIXENTRA_GPU_AUTOSCALING_SCALE_UP_COOLDOWN_SECONDS, 30),
    scaleDownCooldownSeconds: readNumber(process.env.AIXENTRA_GPU_AUTOSCALING_SCALE_DOWN_COOLDOWN_SECONDS, 90),
  },
};
