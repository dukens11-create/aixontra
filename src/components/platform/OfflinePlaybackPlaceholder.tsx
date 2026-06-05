'use client';

import { useState, useEffect } from 'react';
import { getOfflineTracks } from '@/lib/mobile/offlinePlayback';

/**
 * OfflinePlaybackPlaceholder – shows offline-ready track count when offline.
 *
 * Acts as a visible indicator that offline playback is supported.
 * In production, wire this to the real offline track manager in
 * `src/lib/mobile/offlinePlayback.ts`.
 *
 * TODO (native):
 *   - React Native: replace with a notification badge or bottom-sheet component.
 *   - Flutter: use a bottom snackbar or badge widget.
 */
export function OfflinePlaybackPlaceholder() {
  const [isOffline, setIsOffline] = useState(false);
  const [offlineCount, setOfflineCount] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();

    setOfflineCount(getOfflineTracks().filter((t) => t.status === 'ready').length);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Only show when offline
  if (!isOffline || dismissed) return null;

  return (
    <div
      role="alert"
      className="fixed left-3 right-3 top-20 z-50 rounded-xl border border-amber-500/30 bg-slate-950/95 p-3 text-xs shadow-2xl md:left-auto md:right-4 md:max-w-xs"
    >
      <p className="font-semibold text-amber-300">You&apos;re offline</p>
      <p className="mt-1 text-slate-300">
        {offlineCount > 0
          ? `${offlineCount} track${offlineCount === 1 ? '' : 's'} available offline.`
          : 'No tracks saved for offline. Save tracks while online to listen later.'}
      </p>
      <p className="mt-1 text-slate-500">Offline playback placeholder – full caching coming soon.</p>
      <button
        className="badge mt-2 border-amber-500/40 text-amber-300"
        onClick={() => setDismissed(true)}
      >
        Dismiss
      </button>
    </div>
  );
}
