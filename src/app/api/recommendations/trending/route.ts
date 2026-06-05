import { NextResponse } from 'next/server';
import { getTrendingSongs } from '@/lib/platform/recommendationEngine';
import { normalizeRecommendationLimit } from '../utils';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = normalizeRecommendationLimit(searchParams.get('limit'), 10);

  return NextResponse.json({
    songs: getTrendingSongs({ limit }),
  });
}
