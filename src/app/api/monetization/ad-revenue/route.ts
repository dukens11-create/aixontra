import { NextResponse } from 'next/server';
import { addAdRevenuePlaceholder } from '@/lib/platform/monetization';

const DEMO_CREATOR_ID = 'demo-user';

export async function POST(request: Request) {
  const body = await request.json();
  if (typeof body.creatorId !== 'string' || typeof body.amount !== 'number') {
    return NextResponse.json({ error: 'creatorId and amount are required' }, { status: 400 });
  }
  if (body.creatorId !== DEMO_CREATOR_ID) {
    return NextResponse.json({ error: 'Creator not available in demo mode' }, { status: 403 });
  }
  if (body.amount <= 0) {
    return NextResponse.json({ error: 'amount must be positive' }, { status: 400 });
  }
  const revenue = addAdRevenuePlaceholder({
    creatorId: DEMO_CREATOR_ID,
    amount: body.amount,
    sourceLabel: typeof body.sourceLabel === 'string' ? body.sourceLabel : undefined,
  });
  return NextResponse.json({ success: true, revenue });
}
