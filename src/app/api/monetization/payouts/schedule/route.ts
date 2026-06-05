import { NextResponse } from 'next/server';
import { scheduleCreatorPayout } from '@/lib/platform/monetization';

export async function POST(request: Request) {
  const body = await request.json();
  if (typeof body.creatorId !== 'string') {
    return NextResponse.json({ error: 'creatorId is required' }, { status: 400 });
  }
  const payout = scheduleCreatorPayout(body.creatorId);
  if (!payout) {
    return NextResponse.json({ error: 'No available payout amount or missing bank account' }, { status: 409 });
  }
  return NextResponse.json({ success: true, payout });
}
