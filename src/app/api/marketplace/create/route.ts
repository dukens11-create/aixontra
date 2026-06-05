import { NextResponse } from 'next/server';
import { createMarketplaceItem } from '@/lib/platform/platformStore';

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.title || !body.type || typeof body.price !== 'number') {
    return NextResponse.json({ error: 'title, type and price are required' }, { status: 400 });
  }

  const item = createMarketplaceItem(body);
  return NextResponse.json({ success: true, item, message: 'Marketplace item created' });
}
