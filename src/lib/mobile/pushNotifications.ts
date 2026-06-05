/**
 * Push Notification helpers for AIXENTRA.
 *
 * These utilities handle Web Push subscription management on the client side
 * and are designed to be replaceable by React Native / Flutter equivalents
 * via the API abstraction layer (`src/lib/api/`).
 *
 * TODO (native): Replace `subscribeToPush` / `unsubscribeFromPush` with
 *   - React Native: `@react-native-firebase/messaging` or Expo Push
 *   - Flutter: `firebase_messaging` package
 */

// VAPID public key – set via NEXT_PUBLIC_VAPID_PUBLIC_KEY env variable.
// Generate a key-pair with: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '';

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Request notification permission from the user.
 * Returns the resulting permission state.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission !== 'default') return Notification.permission;
  return Notification.requestPermission();
}

/**
 * Subscribe the current browser to Web Push.
 * Sends the PushSubscription object to the backend `/api/push/subscribe` endpoint.
 * Returns the subscription or null if unavailable / denied.
 */
export async function subscribeToPush(userId: string): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;

  const permission = await requestNotificationPermission();
  if (permission !== 'granted') return null;

  const registration = await navigator.serviceWorker.ready;

  const existing = await registration.pushManager.getSubscription();
  if (existing) {
    await sendSubscriptionToServer(userId, existing);
    return existing;
  }

  if (!VAPID_PUBLIC_KEY) {
    console.warn('[AIXENTRA] NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set – skipping push subscribe.');
    return null;
  }

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  await sendSubscriptionToServer(userId, subscription);
  return subscription;
}

/**
 * Unsubscribe the current browser from Web Push.
 */
export async function unsubscribeFromPush(userId: string): Promise<void> {
  if (!('serviceWorker' in navigator)) return;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;

  await subscription.unsubscribe();
  await fetch('/api/push/subscribe', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, endpoint: subscription.endpoint }),
  });
}

async function sendSubscriptionToServer(userId: string, subscription: PushSubscription): Promise<void> {
  await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, subscription }),
  });
}

/**
 * Check whether the browser supports Web Push notifications.
 */
export function isPushSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Get the current push permission state without prompting.
 */
export function getPushPermissionState(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission;
}
