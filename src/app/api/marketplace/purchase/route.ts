import { NextResponse } from 'next/server';
import { createPurchase, PLATFORM_FEE_RATE } from '@/lib/platform/platformStore';

export async function POST(request: Request) {
  const { marketplaceItemId, amount } = await request.json();
  if (!marketplaceItemId || typeof amount !== 'number') {
    return NextResponse.json({ error: 'marketplaceItemId and amount are required' }, { status: 400 });
  }

  const purchase = createPurchase(marketplaceItemId, amount);
  return NextResponse.json({
    success: true,
    purchase,
    message: `Purchase placeholder created. Stripe Connect split: ${Math.round(PLATFORM_FEE_RATE * 100)}% platform fee, ${Math.round((1 - PLATFORM_FEE_RATE) * 100)}% creator payout.`,
  });
}
