import { Queue } from 'bullmq';

export const GENERATION_QUEUE_NAME = 'ai-generation';

let generationQueue: Queue | null = null;

function makeConnectionConfig() {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parsed.port ? Number(parsed.port) : 6379,
      password: parsed.password || undefined,
      username: parsed.username || undefined,
      db: parsed.pathname ? Number(parsed.pathname.slice(1)) || 0 : 0,
      // Required by BullMQ — must be null to allow blocking commands
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      maxRetriesPerRequest: null as any,
      enableReadyCheck: false,
      lazyConnect: true,
    };
  } catch {
    return null;
  }
}

/**
 * Returns the BullMQ Queue instance, or null when Redis is unavailable.
 * The queue is lazily created so the app starts cleanly without Redis.
 */
export function getGenerationQueue(): Queue | null {
  if (generationQueue) return generationQueue;
  const conn = makeConnectionConfig();
  if (!conn) return null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    generationQueue = new Queue(GENERATION_QUEUE_NAME, { connection: conn as any });
    return generationQueue;
  } catch {
    return null;
  }
}

/** Returns the raw connection config (for use in Workers). */
export function getConnectionConfig() {
  return makeConnectionConfig();
}
