import { NextResponse } from 'next/server';
import { createCollabRoom } from '@/lib/platform/platformStore';

export async function POST(request: Request) {
  const { title } = await request.json();
  if (!title?.trim()) return NextResponse.json({ error: 'title required' }, { status: 400 });
  return NextResponse.json({ success: true, room: createCollabRoom(title), message: 'Collaboration room created' });
}
