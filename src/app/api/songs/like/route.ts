import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { songId } = await request.json();
  if (!songId) return NextResponse.json({ error: 'songId required' }, { status: 400 });
  return NextResponse.json({ success: true, songId, liked: true, message: 'Song liked' });
}
