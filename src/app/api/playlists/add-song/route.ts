import { NextResponse } from 'next/server';
import { addSongToPlaylist } from '@/lib/platform/platformStore';

export async function POST(request: Request) {
  const { playlistId, songId } = await request.json();
  if (!playlistId || !songId) {
    return NextResponse.json({ error: 'playlistId and songId are required' }, { status: 400 });
  }

  const playlist = addSongToPlaylist(playlistId, songId);
  if (!playlist) return NextResponse.json({ error: 'playlist not found' }, { status: 404 });
  return NextResponse.json({ success: true, playlist, message: 'Song added to playlist' });
}
