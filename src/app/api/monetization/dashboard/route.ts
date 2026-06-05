import { NextResponse } from 'next/server';
import { getMonetizationDashboard } from '@/lib/platform/monetization';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const creatorId = searchParams.get('creatorId') ?? 'demo-user';
  return NextResponse.json({ success: true, dashboard: getMonetizationDashboard(creatorId) });
}
