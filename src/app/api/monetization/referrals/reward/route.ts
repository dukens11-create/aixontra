import { NextResponse } from 'next/server';
import { trackReferralReward } from '@/lib/platform/monetization';

const DEMO_CREATOR_ID = 'demo-user';

export async function POST(request: Request) {
  const body = await request.json();
  if (
    typeof body.creatorId !== 'string'
    || typeof body.referralCode !== 'string'
    || typeof body.referredUserId !== 'string'
    || typeof body.conversionAmount !== 'number'
  ) {
    return NextResponse.json({ error: 'creatorId, referralCode, referredUserId, and conversionAmount are required' }, { status: 400 });
  }
  if (body.creatorId !== DEMO_CREATOR_ID) {
    return NextResponse.json({ error: 'Creator not available in demo mode' }, { status: 403 });
  }
  if (body.conversionAmount <= 0) {
    return NextResponse.json({ error: 'conversionAmount must be positive' }, { status: 400 });
  }
  const reward = trackReferralReward({
    creatorId: DEMO_CREATOR_ID,
    referralCode: body.referralCode,
    referredUserId: body.referredUserId,
    conversionAmount: body.conversionAmount,
  });
  if (!reward) {
    return NextResponse.json({ error: 'Unknown referralCode for creator' }, { status: 404 });
  }
  return NextResponse.json({ success: true, reward });
}
