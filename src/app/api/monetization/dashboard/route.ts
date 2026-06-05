import { NextResponse } from 'next/server';
import { getMonetizationDashboard } from '@/lib/platform/monetization';

const DEMO_CREATOR_ID = 'demo-user';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const creatorId = searchParams.get('creatorId') ?? DEMO_CREATOR_ID;
  if (creatorId !== DEMO_CREATOR_ID) {
    return NextResponse.json({ error: 'Creator not available in demo mode' }, { status: 403 });
  }
  return NextResponse.json({ success: true, dashboard: getMonetizationDashboard(DEMO_CREATOR_ID) });
}
