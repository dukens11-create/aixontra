import { NextResponse } from 'next/server';
import { createPurchase } from '@/lib/platform/platformStore';

export async function POST(request: Request) {
  const { marketplaceItemId, amount } = await request.json();
  if (!marketplaceItemId || typeof amount !== 'number') {
    return NextResponse.json({ error: 'marketplaceItemId and amount are required' }, { status: 400 });
  }

  const purchase = createPurchase(marketplaceItemId, amount);
  return NextResponse.json({
    success: true,
    purchase,
    message: 'Purchase placeholder created. Stripe Connect split: 10% platform fee, 90% creator payout.',
  });
}
