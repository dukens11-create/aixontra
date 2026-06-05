import { NextResponse } from 'next/server';
import { scheduleCreatorPayout } from '@/lib/platform/monetization';

const DEMO_CREATOR_ID = 'demo-user';

export async function POST(request: Request) {
  const body = await request.json();
  if (typeof body.creatorId !== 'string') {
    return NextResponse.json({ error: 'creatorId is required' }, { status: 400 });
  }
  if (body.creatorId !== DEMO_CREATOR_ID) {
    return NextResponse.json({ error: 'Creator not available in demo mode' }, { status: 403 });
  }
  const payout = scheduleCreatorPayout(DEMO_CREATOR_ID);
  if (!payout) {
    return NextResponse.json({ error: 'No available payout amount or missing bank account' }, { status: 409 });
  }
  return NextResponse.json({ success: true, payout });
}
