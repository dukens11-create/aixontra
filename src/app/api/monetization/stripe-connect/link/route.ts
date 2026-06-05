import { NextResponse } from 'next/server';
import { linkStripeConnectAccount } from '@/lib/platform/monetization';

const DEMO_CREATOR_ID = 'demo-user';

export async function POST(request: Request) {
  const body = await request.json();
  if (typeof body.creatorId !== 'string' || typeof body.email !== 'string') {
    return NextResponse.json({ error: 'creatorId and email are required' }, { status: 400 });
  }
  if (body.creatorId !== DEMO_CREATOR_ID) {
    return NextResponse.json({ error: 'Creator not available in demo mode' }, { status: 403 });
  }
  const stripeConnect = linkStripeConnectAccount(DEMO_CREATOR_ID, body.email);
  return NextResponse.json({ success: true, stripeConnect });
}
