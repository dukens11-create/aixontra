import { NextResponse } from 'next/server';
import { linkStripeConnectAccount } from '@/lib/platform/monetization';

export async function POST(request: Request) {
  const body = await request.json();
  if (typeof body.creatorId !== 'string' || typeof body.email !== 'string') {
    return NextResponse.json({ error: 'creatorId and email are required' }, { status: 400 });
  }
  const stripeConnect = linkStripeConnectAccount(body.creatorId, body.email);
  return NextResponse.json({ success: true, stripeConnect });
}
