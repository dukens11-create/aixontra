import { NextResponse } from 'next/server';
import { verifyStripeConnectAccount } from '@/lib/platform/monetization';

export async function POST(request: Request) {
  const body = await request.json();
  if (typeof body.creatorId !== 'string') {
    return NextResponse.json({ error: 'creatorId is required' }, { status: 400 });
  }
  const stripeConnect = verifyStripeConnectAccount(body.creatorId);
  if (!stripeConnect) {
    return NextResponse.json({ error: 'Stripe Connect account is not linked yet' }, { status: 409 });
  }
  return NextResponse.json({ success: true, stripeConnect });
}
