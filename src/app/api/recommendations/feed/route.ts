import { NextResponse } from 'next/server';
import { DEFAULT_RECOMMENDATION_USER_ID, getPersonalizedFeed } from '@/lib/platform/recommendationEngine';
import { normalizeRecommendationLimit } from '../utils';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || DEFAULT_RECOMMENDATION_USER_ID;
  const limit = normalizeRecommendationLimit(searchParams.get('limit'), 8);

  return NextResponse.json(
    getPersonalizedFeed({
      userId,
      limit,
    }),
  );
}
