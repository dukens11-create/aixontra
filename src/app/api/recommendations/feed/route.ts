import { NextResponse } from 'next/server';
import { DEFAULT_RECOMMENDATION_USER_ID, getPersonalizedFeed } from '@/lib/platform/recommendationEngine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || DEFAULT_RECOMMENDATION_USER_ID;
  const limit = Number(searchParams.get('limit') || '8');

  return NextResponse.json(
    getPersonalizedFeed({
      userId,
      limit: Number.isFinite(limit) ? Math.max(1, Math.min(limit, 20)) : 8,
    }),
  );
}
