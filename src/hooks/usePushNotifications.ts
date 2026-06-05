'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  subscribeToPush,
  unsubscribeFromPush,
  isPushSupported,
  getPushPermissionState,
} from '@/lib/mobile/pushNotifications';

export type PushState = {
  supported: boolean;
  permission: NotificationPermission | 'unsupported';
  subscribed: boolean;
  loading: boolean;
  error: string | null;
};

/**
 * React hook for managing Web Push notification subscriptions.
 *
 * TODO (native):
 *   - React Native: replace with `useFCMToken` / `useExpoNotifications`.
 *   - Flutter: handle in a Dart service using `firebase_messaging`.
 */
export function usePushNotifications(userId: string | null) {
  const [state, setState] = useState<PushState>({
    supported: false,
    permission: 'unsupported',
    subscribed: false,
    loading: false,
    error: null,
  });

  useEffect(() => {
    setState((prev) => ({
      ...prev,
      supported: isPushSupported(),
      permission: getPushPermissionState(),
    }));
  }, []);

  const subscribe = useCallback(async () => {
    if (!userId) {
      setState((prev) => ({ ...prev, error: 'You must be signed in to enable notifications.' }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const sub = await subscribeToPush(userId);
      setState((prev) => ({
        ...prev,
        subscribed: !!sub,
        permission: getPushPermissionState(),
        loading: false,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to subscribe',
      }));
    }
  }, [userId]);

  const unsubscribe = useCallback(async () => {
    if (!userId) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await unsubscribeFromPush(userId);
      setState((prev) => ({ ...prev, subscribed: false, loading: false }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to unsubscribe',
      }));
    }
  }, [userId]);

  return { ...state, subscribe, unsubscribe };
}
