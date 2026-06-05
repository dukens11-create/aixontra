import { NextResponse } from 'next/server';
import { formatErrorResponse, RateLimitError } from '@/lib/errors';
import { checkRateLimit, getIdentifier, RATE_LIMIT_CONFIG } from '@/lib/rateLimiter';

type RateLimitAction = keyof typeof RATE_LIMIT_CONFIG;

export const enforceRateLimit = async (
  request: Request,
  action: RateLimitAction,
  userId?: string
) => {
  const identifier = getIdentifier(request, userId);
  try {
    await checkRateLimit(identifier, action);
    return { identifier, response: null as NextResponse | null };
  } catch (error) {
    if (error instanceof RateLimitError) {
      const payload = formatErrorResponse(error);
      return {
        identifier,
        response: NextResponse.json(payload, { status: 429 }),
      };
    }
    throw error;
  }
};
