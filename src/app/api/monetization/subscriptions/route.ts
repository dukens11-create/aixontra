import { NextResponse } from 'next/server';
import { createSubscription } from '@/lib/platform/monetization';

const DEMO_CREATOR_ID = 'demo-user';

export async function POST(request: Request) {
  const body = await request.json();
  if (typeof body.creatorId !== 'string' || typeof body.subscriberId !== 'string' || typeof body.tierId !== 'string') {
    return NextResponse.json({ error: 'creatorId, subscriberId, and tierId are required' }, { status: 400 });
  }
  if (body.creatorId !== DEMO_CREATOR_ID) {
    return NextResponse.json({ error: 'Creator not available in demo mode' }, { status: 403 });
  }
  const subscription = createSubscription({
    creatorId: DEMO_CREATOR_ID,
    subscriberId: body.subscriberId,
    tierId: body.tierId,
  });
  if (!subscription) {
    return NextResponse.json({ error: 'Invalid subscription tier' }, { status: 404 });
  }
  return NextResponse.json({ success: true, ...subscription });
}
