import { NextResponse } from 'next/server';
import { createCollabRoom, validateRoyaltySplitTotal } from '@/lib/platform/platformStore';

export async function POST(request: Request) {
  const { title, royaltySplits = [100] } = await request.json();
  if (!title?.trim()) return NextResponse.json({ error: 'title required' }, { status: 400 });
  if (!Array.isArray(royaltySplits) || royaltySplits.some((entry) => !Number.isFinite(entry))) {
    return NextResponse.json({ error: 'Royalty splits must be numeric values.' }, { status: 400 });
  }
  if (!validateRoyaltySplitTotal(royaltySplits)) {
    return NextResponse.json({ error: 'Royalty splits must total exactly 100%.' }, { status: 400 });
  }
  return NextResponse.json({ success: true, room: createCollabRoom(title, royaltySplits), message: 'Collaboration room created' });
}
