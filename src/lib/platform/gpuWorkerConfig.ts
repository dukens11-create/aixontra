export type GpuWorkerConfig = {
  queueName: string;
  concurrency: number;
  removeOnComplete: number;
  removeOnFail: number;
  generationTimeoutMs: number;
  retries: number;
  backoffMs: number;
};

export type AutoscalingConfig = {
  enabled: boolean;
  minWorkers: number;
  maxWorkers: number;
  scaleUpAtQueueDepth: number;
  scaleDownAtQueueDepth: number;
  coolDownSeconds: number;
};

export const GPU_WORKER_CONFIG: GpuWorkerConfig = {
  queueName: process.env.GPU_GENERATION_QUEUE_NAME ?? 'gpu-generation',
  concurrency: Number(process.env.GPU_WORKER_CONCURRENCY ?? 4),
  removeOnComplete: Number(process.env.GPU_QUEUE_REMOVE_ON_COMPLETE ?? 500),
  removeOnFail: Number(process.env.GPU_QUEUE_REMOVE_ON_FAIL ?? 1000),
  generationTimeoutMs: Number(process.env.GPU_GENERATION_TIMEOUT_MS ?? 120_000),
  retries: Number(process.env.GPU_GENERATION_RETRIES ?? 3),
  backoffMs: Number(process.env.GPU_GENERATION_RETRY_BACKOFF_MS ?? 2_000),
};

export const GPU_AUTOSCALING_CONFIG: AutoscalingConfig = {
  enabled: process.env.GPU_AUTOSCALING_ENABLED === 'true',
  minWorkers: Number(process.env.GPU_AUTOSCALING_MIN_WORKERS ?? 1),
  maxWorkers: Number(process.env.GPU_AUTOSCALING_MAX_WORKERS ?? 20),
  scaleUpAtQueueDepth: Number(process.env.GPU_AUTOSCALING_SCALE_UP_AT_QUEUE_DEPTH ?? 20),
  scaleDownAtQueueDepth: Number(process.env.GPU_AUTOSCALING_SCALE_DOWN_AT_QUEUE_DEPTH ?? 3),
  coolDownSeconds: Number(process.env.GPU_AUTOSCALING_COOLDOWN_SECONDS ?? 60),
};

export const estimateQueueEtaSeconds = (queueDepth: number) => {
  if (queueDepth <= 0) return 0;
  const batchDurationSeconds = Math.ceil(GPU_WORKER_CONFIG.generationTimeoutMs / 1000);
  const effectiveConcurrency = Math.max(1, GPU_WORKER_CONFIG.concurrency);
  return Math.ceil((queueDepth / effectiveConcurrency) * batchDurationSeconds);
};
