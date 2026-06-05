import { NextResponse } from 'next/server';
import { fileDmcaClaim } from '@/lib/platform/platformStore';

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.songId || !body.claimant) {
    return NextResponse.json({ error: 'songId and claimant are required' }, { status: 400 });
  }
  const claim = fileDmcaClaim(body.songId, body.claimant);
  return NextResponse.json({ success: true, claim, moderationStatus: 'TAKEN_DOWN' });
}
