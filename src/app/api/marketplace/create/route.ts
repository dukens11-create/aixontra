import { NextResponse } from 'next/server';
import { createMarketplaceItem, getUserGenerationContext } from '@/lib/platform/platformStore';

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.title || !body.type || typeof body.price !== 'number') {
    return NextResponse.json({ error: 'title, type and price are required' }, { status: 400 });
  }
  if (typeof body.userId !== 'string' || !body.userId.trim()) {
    return NextResponse.json({ error: 'Authentication required: userId is missing.' }, { status: 401 });
  }
  const context = getUserGenerationContext(body.userId.trim());
  if (!context.capabilities.marketplaceSelling) {
    return NextResponse.json({ error: `Marketplace selling requires CREATOR plan or higher. Current plan: ${context.plan}.` }, { status: 403 });
  }

  const item = createMarketplaceItem(body);
  return NextResponse.json({ success: true, item, message: 'Marketplace item created' });
}
