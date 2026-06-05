import { NextResponse } from 'next/server';
import { pushNotification } from '@/lib/platform/platformStore';
import { publishNotificationEvent } from '@/lib/platform/notificationBus';

export async function POST(request: Request) {
  const { title, message, type = 'system', channel = 'realtime-ready' } = await request.json();
  if (!title?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'title and message are required' }, { status: 400 });
  }

  const notification = pushNotification(title, message, type);
  publishNotificationEvent({
    type,
    title,
    message,
    createdAt: notification.createdAt,
  });
  return NextResponse.json({ success: true, notification: { ...notification, channel }, message: 'Notification queued for realtime delivery' });
}
