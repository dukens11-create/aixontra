/**
 * POST /api/push/subscribe  – register a Web Push subscription
 * DELETE /api/push/subscribe – remove a subscription
 *
 * In production, persist subscriptions in your database (Supabase / Prisma).
 * This in-memory store is a placeholder suitable for development and demo.
 *
 * TODO: Replace `subscriptions` Map with a Supabase / Prisma table query.
 */

import { NextResponse } from 'next/server';

type StoredSubscription = {
  userId: string;
  subscription: PushSubscriptionJSON;
  createdAt: string;
};

// In-memory store (replace with DB persistence in production)
const subscriptions = new Map<string, StoredSubscription>();

export async function POST(request: Request) {
  try {
    const raw = await request.json();

    if (!raw || typeof raw !== 'object') {
      return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
    }

    const userId = typeof raw.userId === 'string' ? raw.userId.trim() : '';
    const subscription = raw.subscription as PushSubscriptionJSON | undefined;

    if (!userId || !subscription?.endpoint) {
      return NextResponse.json({ error: 'userId and subscription.endpoint are required' }, { status: 400 });
    }

    subscriptions.set(subscription.endpoint, {
      userId,
      subscription,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: 'Push subscription registered' });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { endpoint } = body as { userId?: string; endpoint?: string };

    if (!endpoint) {
      return NextResponse.json({ error: 'endpoint is required' }, { status: 400 });
    }

    subscriptions.delete(endpoint);
    return NextResponse.json({ success: true, message: 'Push subscription removed' });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

/** Export the in-memory store so /api/push/send can read it. */
export { subscriptions };
