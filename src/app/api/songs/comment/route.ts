import { NextResponse } from 'next/server';
import { saveComment } from '@/lib/platform/platformStore';

export async function POST(request: Request) {
  const { songId, text } = await request.json();
  if (!songId || !text?.trim()) {
    return NextResponse.json({ error: 'songId and text are required' }, { status: 400 });
  }

  const comment = saveComment(songId, text);
  return NextResponse.json({ success: true, comment, message: 'Comment added' });
}
