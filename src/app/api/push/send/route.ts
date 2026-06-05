/**
 * POST /api/push/send – send a Web Push notification to a user's subscriptions.
 *
 * Requires VAPID keys to be configured:
 *   VAPID_PUBLIC_KEY   – public VAPID key
 *   VAPID_PRIVATE_KEY  – private VAPID key
 *   VAPID_SUBJECT      – mailto: or https: contact for the push server
 *
 * Generate keys with: npx web-push generate-vapid-keys
 * Install the sender library with: npm install web-push @types/web-push
 *
 * TODO: Replace `subscriptions` import with a DB query once persistence is wired.
 * TODO: Install `web-push` and uncomment the sender logic below once VAPID keys
 *       are provisioned in the environment.
 */

import { NextResponse } from 'next/server';
import { subscriptions } from '../subscribe/route';

type PushPayload = {
  userId: string;
  title: string;
  message?: string;
  body?: string;
  url?: string;
  tag?: string;
};

export async function POST(request: Request) {
  try {
    const raw = await request.json();

    // Validate required fields explicitly
    if (!raw || typeof raw !== 'object') {
      return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
    }

    const body: PushPayload = {
      userId: typeof raw.userId === 'string' ? raw.userId.trim() : '',
      title: typeof raw.title === 'string' ? raw.title.trim() : '',
      message: typeof raw.message === 'string' ? raw.message : undefined,
      body: typeof raw.body === 'string' ? raw.body : undefined,
      url: typeof raw.url === 'string' ? raw.url : undefined,
      tag: typeof raw.tag === 'string' ? raw.tag : undefined,
    };

    if (!body.userId || !body.title) {
      return NextResponse.json({ error: 'userId and title are required non-empty strings' }, { status: 400 });
    }

    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

    if (!vapidPublicKey || !vapidPrivateKey) {
      // VAPID not configured – return a placeholder success so the UI still works
      return NextResponse.json({
        success: true,
        sent: 0,
        message:
          'VAPID keys not configured – push notifications are disabled. ' +
          'Set VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, and VAPID_SUBJECT, then install web-push to enable.',
      });
    }

    // Fetch subscriptions for this user
    const userSubs = [...subscriptions.values()].filter((s) => s.userId === body.userId);
    if (userSubs.length === 0) {
      return NextResponse.json({ success: true, sent: 0, total: 0, message: 'No subscriptions found for user' });
    }

    /*
     * Sender implementation – uncomment once `web-push` is installed:
     *
     * import webpush from 'web-push';
     * webpush.setVapidDetails(
     *   process.env.VAPID_SUBJECT ?? 'mailto:support@aixentra.com',
     *   vapidPublicKey,
     *   vapidPrivateKey,
     * );
     * const payload = JSON.stringify({ title: body.title, body: body.message ?? body.body ?? '', url: body.url ?? '/notifications', tag: body.tag ?? 'aixentra' });
     * const results = await Promise.allSettled(userSubs.map((e) => webpush.sendNotification(e.subscription as Parameters<typeof webpush.sendNotification>[0], payload)));
     * const sent = results.filter((r) => r.status === 'fulfilled').length;
     * return NextResponse.json({ success: true, sent, total: userSubs.length });
     */

    return NextResponse.json({
      success: true,
      sent: 0,
      total: userSubs.length,
      message: 'web-push package not installed. Run: npm install web-push @types/web-push',
    });
  } catch {
    return NextResponse.json({ error: 'Failed to send push notification' }, { status: 500 });
  }
}
