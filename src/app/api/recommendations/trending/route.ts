import { NextResponse } from 'next/server';
import { getTrendingSongs } from '@/lib/platform/recommendationEngine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get('limit') || '10');

  return NextResponse.json({
    songs: getTrendingSongs({
      limit: Number.isFinite(limit) ? Math.max(1, Math.min(limit, 20)) : 10,
    }),
  });
}
