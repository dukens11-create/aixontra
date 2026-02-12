import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';
import { RateLimitError } from './errors';

// Rate limiter instances
const rateLimiters = new Map<string, RateLimiterMemory>();

/**
 * Gets or creates a rate limiter for a specific key
 */
function getRateLimiter(key: string, points: number, duration: number): RateLimiterMemory {
  if (!rateLimiters.has(key)) {
    rateLimiters.set(
      key,
      new RateLimiterMemory({
        points,
        duration,
      })
    );
  }
  return rateLimiters.get(key)!;
}

/**
 * Rate limiting configuration
 */
export const RATE_LIMIT_CONFIG = {
  // API endpoints (100 requests per minute)
  api: { points: 100, duration: 60 },
  
  // Upload (5 uploads per hour)
  upload: { points: 5, duration: 3600 },
  
  // Like/Unlike (100 per hour)
  like: { points: 100, duration: 3600 },
  
  // Comment (50 per hour)
  comment: { points: 50, duration: 3600 },
  
  // Search (60 per minute)
  search: { points: 60, duration: 60 },
  
  // Auth (10 attempts per 15 minutes)
  auth: { points: 10, duration: 900 },
} as const;

/**
 * Checks rate limit for a specific identifier and action
 */
export async function checkRateLimit(
  identifier: string,
  action: keyof typeof RATE_LIMIT_CONFIG
): Promise<RateLimiterRes> {
  const config = RATE_LIMIT_CONFIG[action];
  const limiter = getRateLimiter(action, config.points, config.duration);
  
  try {
    const result = await limiter.consume(identifier, 1);
    return result;
  } catch (error) {
    if (error instanceof Error && 'msBeforeNext' in error) {
      const msBeforeNext = (error as any).msBeforeNext as number;
      throw new RateLimitError(
        `Too many ${action} requests. Please try again later.`,
        Math.ceil(msBeforeNext / 1000)
      );
    }
    throw error;
  }
}

/**
 * Gets remaining points for a specific identifier and action
 */
export async function getRateLimitInfo(
  identifier: string,
  action: keyof typeof RATE_LIMIT_CONFIG
): Promise<{ remaining: number; resetAt: Date } | null> {
  const config = RATE_LIMIT_CONFIG[action];
  const limiter = getRateLimiter(action, config.points, config.duration);
  
  try {
    const res = await limiter.get(identifier);
    if (!res) {
      return {
        remaining: config.points,
        resetAt: new Date(Date.now() + config.duration * 1000),
      };
    }
    
    return {
      remaining: res.remainingPoints,
      resetAt: new Date(Date.now() + res.msBeforeNext),
    };
  } catch (error) {
    return null;
  }
}

/**
 * Resets rate limit for a specific identifier and action
 */
export async function resetRateLimit(
  identifier: string,
  action: keyof typeof RATE_LIMIT_CONFIG
): Promise<void> {
  const config = RATE_LIMIT_CONFIG[action];
  const limiter = getRateLimiter(action, config.points, config.duration);
  await limiter.delete(identifier);
}

/**
 * Helper to extract identifier from request (IP or user ID)
 */
export function getIdentifier(req: Request, userId?: string): string {
  if (userId) return userId;
  
  // Try to get IP from various headers
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  // Fallback to a default (not ideal but prevents errors)
  return 'unknown';
}
