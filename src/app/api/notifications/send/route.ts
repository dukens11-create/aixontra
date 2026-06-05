import { NextResponse } from 'next/server';
import { pushNotification } from '@/lib/platform/platformStore';

export async function POST(request: Request) {
  const { title, message, type = 'system' } = await request.json();
  if (!title?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'title and message are required' }, { status: 400 });
  }

  const notification = pushNotification(title, message, type);
  return NextResponse.json({ success: true, notification, message: 'Notification sent' });
}
