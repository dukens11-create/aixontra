import { NextResponse } from 'next/server';
import { followCreator } from '@/lib/platform/platformStore';

export async function POST(request: Request) {
  const { creatorId } = await request.json();
  if (!creatorId) return NextResponse.json({ error: 'creatorId required' }, { status: 400 });

  return NextResponse.json({ success: true, data: followCreator(creatorId), message: 'Creator followed' });
}
