/**
 * Offline Playback placeholder for AIXENTRA.
 *
 * This module abstracts offline audio caching decisions so the same logic
 * can be ported to React Native (via MMKV / AsyncStorage) or Flutter (Hive).
 *
 * TODO (native):
 *   - React Native: use `react-native-track-player` with offline cache
 *   - Flutter: use `just_audio` with a local file cache
 *   - Web PWA: the service worker's AUDIO_CACHE handles fetch-level caching.
 *              Use this module to track which tracks the user explicitly
 *              wants available offline.
 */

export type OfflineTrackEntry = {
  id: string;
  title: string;
  audioUrl: string;
  coverUrl?: string;
  cachedAt: string;
  /** 'pending' → being cached | 'ready' → available offline | 'error' → failed */
  status: 'pending' | 'ready' | 'error';
};

const STORAGE_KEY = 'aixentra:offline-tracks';

function loadRegistry(): OfflineTrackEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveRegistry(entries: OfflineTrackEntry[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

/** Return all tracks registered for offline playback. */
export function getOfflineTracks(): OfflineTrackEntry[] {
  return loadRegistry();
}

/** Check whether a specific track is available for offline playback. */
export function isTrackOfflineReady(trackId: string): boolean {
  return loadRegistry().some((e) => e.id === trackId && e.status === 'ready');
}

/**
 * Register a track for offline caching.
 * On the web, this asks the Cache API to store the audio URL via the service worker.
 * On React Native / Flutter this will delegate to the platform cache layer.
 */
export async function addTrackForOffline(track: Omit<OfflineTrackEntry, 'cachedAt' | 'status'>): Promise<void> {
  const registry = loadRegistry();
  if (registry.some((e) => e.id === track.id)) return; // already queued

  const entry: OfflineTrackEntry = { ...track, cachedAt: new Date().toISOString(), status: 'pending' };
  saveRegistry([...registry, entry]);

  // Web: ask the Cache API to store the audio file
  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const cache = await caches.open('aixentra-v1-audio');
      await cache.add(track.audioUrl);
      updateStatus(track.id, 'ready');
    } catch {
      updateStatus(track.id, 'error');
    }
  }
}

/** Remove a track from the offline registry and purge its cache entry. */
export async function removeTrackFromOffline(trackId: string): Promise<void> {
  const registry = loadRegistry();
  const entry = registry.find((e) => e.id === trackId);
  if (!entry) return;

  saveRegistry(registry.filter((e) => e.id !== trackId));

  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const cache = await caches.open('aixentra-v1-audio');
      await cache.delete(entry.audioUrl);
    } catch {
      // Ignore – entry may have been evicted already
    }
  }
}

function updateStatus(trackId: string, status: OfflineTrackEntry['status']): void {
  const registry = loadRegistry();
  const updated = registry.map((e) => (e.id === trackId ? { ...e, status } : e));
  saveRegistry(updated);
}
