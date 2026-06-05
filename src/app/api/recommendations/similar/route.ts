import { NextResponse } from 'next/server';
import { songs } from '@/lib/platform/demoData';
import { getSimilarCreators, getSimilarSongs } from '@/lib/platform/recommendationEngine';
import { normalizeRecommendationLimit } from '../utils';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const songId = searchParams.get('songId');
  const creatorId = searchParams.get('creatorId');
  const safeLimit = normalizeRecommendationLimit(searchParams.get('limit'), 4, 12);

  if (!songId && !creatorId) {
    return NextResponse.json({ error: 'songId or creatorId is required' }, { status: 400 });
  }

  const seedSong = songId ? songs.find((song) => song.id === songId) : undefined;
  const resolvedCreatorId = creatorId || seedSong?.creatorId;

  return NextResponse.json({
    songId,
    creatorId: resolvedCreatorId,
    similarSongs: songId ? getSimilarSongs(songId, { limit: safeLimit }) : [],
    similarCreators: resolvedCreatorId ? getSimilarCreators(resolvedCreatorId, { limit: safeLimit }) : [],
  });
}
