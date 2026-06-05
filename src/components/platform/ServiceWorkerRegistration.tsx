'use client';

import { useEffect, useRef } from 'react';

/**
 * ServiceWorkerRegistration – mounts a service worker for PWA features.
 *
 * Registers `/sw.js` once on the client. Designed to be placed inside
 * the root layout so it runs on every page without re-registering.
 *
 * TODO (native): On React Native / Flutter, replace this component with the
 * platform's background service / task registration.
 */
export function ServiceWorkerRegistration() {
  const registered = useRef(false);

  useEffect(() => {
    if (registered.current || typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    registered.current = true;

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        // Check for updates on every page load
        registration.update().catch((err) => {
          console.warn('[AIXENTRA] Service worker update check failed:', err);
        });
      })
      .catch((err) => {
        console.warn('[AIXENTRA] Service worker registration failed:', err);
      });
  }, []);

  // Renders nothing – this is a side-effect-only component
  return null;
}
