import { NextResponse } from 'next/server';
import { getCreditPacks, purchaseCreditPack } from '@/lib/platform/platformStore';

export async function GET() {
  return NextResponse.json({ packs: getCreditPacks() });
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.userId || !body.packId) {
    return NextResponse.json({ error: 'userId and packId are required' }, { status: 400 });
  }
  const result = purchaseCreditPack(body.userId, body.packId);
  if (!result) return NextResponse.json({ error: 'Invalid credit pack' }, { status: 404 });
  return NextResponse.json({ success: true, ...result });
}
