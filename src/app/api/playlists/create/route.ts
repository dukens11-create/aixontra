import { NextResponse } from 'next/server';
import { createPlaylist } from '@/lib/platform/platformStore';

export async function POST(request: Request) {
  const { name } = await request.json();
  if (!name?.trim()) return NextResponse.json({ error: 'name required' }, { status: 400 });
  return NextResponse.json({ success: true, playlist: createPlaylist(name), message: 'Playlist created' });
}
