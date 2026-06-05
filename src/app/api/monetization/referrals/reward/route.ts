import { NextResponse } from 'next/server';
import { trackReferralReward } from '@/lib/platform/monetization';

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
  const reward = trackReferralReward(body);
  if (!reward) {
    return NextResponse.json({ error: 'Unknown referralCode for creator' }, { status: 404 });
  }
  return NextResponse.json({ success: true, reward });
}
