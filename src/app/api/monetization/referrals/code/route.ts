import { NextResponse } from 'next/server';
import { createReferralCode } from '@/lib/platform/monetization';

export async function POST(request: Request) {
  const body = await request.json();
  if (typeof body.creatorId !== 'string') {
    return NextResponse.json({ error: 'creatorId is required' }, { status: 400 });
  }
  const referralCode = createReferralCode(body.creatorId);
  return NextResponse.json({ success: true, referralCode });
}
