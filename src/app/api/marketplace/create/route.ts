import { NextResponse } from 'next/server';
import { createMarketplaceItem, getUserGenerationContext } from '@/lib/platform/platformStore';

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.title || !body.type || typeof body.price !== 'number') {
    return NextResponse.json({ error: 'title, type and price are required' }, { status: 400 });
  }
  const context = getUserGenerationContext(body.userId ?? 'demo-user');
  if (!context.capabilities.marketplaceSelling) {
    return NextResponse.json({ error: `Marketplace selling requires CREATOR plan or higher. Current plan: ${context.plan}.` }, { status: 403 });
  }

  const item = createMarketplaceItem(body);
  return NextResponse.json({ success: true, item, message: 'Marketplace item created' });
}
