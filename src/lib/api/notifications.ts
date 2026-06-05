/**
 * Notifications API – AIXENTRA API abstraction layer
 *
 * Covers both in-app notification dispatch and Web Push subscription management.
 *
 * TODO (native):
 *   - React Native: replace push subscription calls with Firebase Cloud Messaging token.
 *   - Flutter: replace with `firebase_messaging` token registration.
 */

import { apiClient } from './client';

export type NotificationPayload = {
  title: string;
  message: string;
  type?: string;
  url?: string;
  tag?: string;
};

export type PushSubscribeParams = {
  userId: string;
  subscription: PushSubscriptionJSON;
};

/** Send an in-app notification (server-side dispatch). */
export function sendNotification(payload: NotificationPayload) {
  return apiClient.post<{ success: boolean; notification: { id: string } }>(
    '/api/notifications/send',
    payload
  );
}

/** Register a Web Push subscription for a user. */
export function registerPushSubscription(params: PushSubscribeParams) {
  return apiClient.post<{ success: boolean }>('/api/push/subscribe', params);
}

/** Remove a Web Push subscription. */
export function removePushSubscription(params: { userId: string; endpoint: string }) {
  return apiClient.delete<{ success: boolean }>('/api/push/subscribe', params);
}

/** Send a Web Push notification to a subscribed user (admin / server use). */
export function sendPushNotification(params: { userId: string } & NotificationPayload) {
  return apiClient.post<{ success: boolean; sent: number }>('/api/push/send', params);
}
