import { NextResponse } from 'next/server';
import { songs } from '@/lib/platform/demoData';
import { getSimilarCreators, getSimilarSongs } from '@/lib/platform/recommendationEngine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const songId = searchParams.get('songId');
  const creatorId = searchParams.get('creatorId');
  const limit = Number(searchParams.get('limit') || '4');
  const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.min(limit, 12)) : 4;

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
