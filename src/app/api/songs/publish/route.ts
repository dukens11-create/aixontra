import { NextResponse } from 'next/server';
import { publishGeneratedSong } from '@/lib/platform/platformStore';

export async function POST(request: Request) {
  const { draftId } = await request.json();
  if (!draftId) return NextResponse.json({ error: 'draftId required' }, { status: 400 });

  const song = publishGeneratedSong(draftId);
  if (!song) return NextResponse.json({ error: 'Draft not found' }, { status: 404 });

  return NextResponse.json({ success: true, song, message: 'Song published' });
}
