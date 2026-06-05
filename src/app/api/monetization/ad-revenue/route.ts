import { NextResponse } from 'next/server';
import { addAdRevenuePlaceholder } from '@/lib/platform/monetization';

export async function POST(request: Request) {
  const body = await request.json();
  if (typeof body.creatorId !== 'string' || typeof body.amount !== 'number') {
    return NextResponse.json({ error: 'creatorId and amount are required' }, { status: 400 });
  }
  if (body.amount <= 0) {
    return NextResponse.json({ error: 'amount must be positive' }, { status: 400 });
  }
  const revenue = addAdRevenuePlaceholder({
    creatorId: body.creatorId,
    amount: body.amount,
    sourceLabel: typeof body.sourceLabel === 'string' ? body.sourceLabel : undefined,
  });
  return NextResponse.json({ success: true, revenue });
}
