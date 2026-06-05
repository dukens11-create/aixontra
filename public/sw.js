// AIXENTRA Service Worker – v1
// Handles: offline caching, background sync stubs, push notification reception

const CACHE_VERSION = 'aixentra-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const AUDIO_CACHE = `${CACHE_VERSION}-audio`;

// Core app shell assets to pre-cache
const APP_SHELL = [
  '/',
  '/feed',
  '/generate',
  '/lyrics-studio',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/logo.svg',
];

// ─── Install ──────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll(APP_SHELL).catch((err) => {
        console.warn('[AIXENTRA SW] Pre-cache failed during install:', err);
      })
    )
  );
  // Activate immediately without waiting for existing clients to close
  self.skipWaiting();
});

// ─── Activate ─────────────────────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('aixentra-') && key !== STATIC_CACHE && key !== AUDIO_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  // Take control of all clients immediately
  self.clients.claim();
});

// ─── Fetch – network-first with cache fallback ────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, cross-origin, and API requests (always need fresh data)
  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api/')
  ) {
    return;
  }

  // Audio assets: cache-first strategy for offline playback
  if (
    url.pathname.startsWith('/demo-audio/') ||
    url.pathname.match(/\.(mp3|ogg|wav|aac|flac|m4a)$/)
  ) {
    event.respondWith(
      caches.open(AUDIO_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const response = await fetch(request);
          if (response.ok) cache.put(request, response.clone());
          return response;
        } catch {
          // Audio not available offline – return a placeholder 204
          return new Response(null, { status: 204, statusText: 'Audio unavailable offline' });
        }
      })
    );
    return;
  }

  // Navigation requests: network-first, fall back to cached index
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('/').then((r) => r ?? new Response('Offline', { status: 503 }))
      )
    );
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});

// ─── Push Notifications ───────────────────────────────────────────────────────

self.addEventListener('push', (event) => {
  let data = { title: 'AIXENTRA', body: 'You have a new notification.' };
  try {
    if (event.data) data = event.data.json();
  } catch {
    if (event.data) data.body = event.data.text();
  }

  const options = {
    body: data.body ?? data.message ?? '',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: data.tag ?? 'aixentra-notification',
    data: { url: data.url ?? '/notifications' },
    actions: data.actions ?? [],
    vibrate: [100, 50, 100],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// ─── Notification Click ───────────────────────────────────────────────────────

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url ?? '/notifications';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        const existing = clients.find((c) => new URL(c.url).origin === self.location.origin);
        if (existing) {
          existing.focus();
          return existing.navigate(targetUrl);
        }
        return self.clients.openWindow(targetUrl);
      })
  );
});

// ─── Background Sync (placeholder) ───────────────────────────────────────────

self.addEventListener('sync', (event) => {
  // TODO: implement background sync for queued generation jobs and offline actions
  if (event.tag === 'sync-queue') {
    event.waitUntil(Promise.resolve());
  }
});
