import { NextResponse } from 'next/server';
import { reportSong } from '@/lib/platform/platformStore';

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.songId || !body.reason) {
    return NextResponse.json({ error: 'songId and reason are required' }, { status: 400 });
  }

  const report = reportSong(body.songId, body.reason);
  return NextResponse.json({ success: true, report, moderationStatus: 'PENDING' });
}
