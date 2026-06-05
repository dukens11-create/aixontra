import { NextResponse } from 'next/server';
import { createSecureUploadUrl } from '@/lib/platform/storageService';

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.userId || !body.kind) {
    return NextResponse.json({ error: 'userId and kind are required' }, { status: 400 });
  }
  const upload = createSecureUploadUrl({ userId: body.userId, kind: body.kind, songId: body.songId });
  return NextResponse.json({ success: true, upload });
}
