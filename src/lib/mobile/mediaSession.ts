/**
 * Media Session API – lock screen & notification controls for AIXENTRA.
 *
 * Wraps the Web Media Session API to provide lock-screen playback controls.
 *
 * TODO (native):
 *   - React Native: use `react-native-track-player`'s built-in notification controls.
 *   - Flutter: use `audio_service` package for background/lock-screen controls.
 */

export type MediaSessionTrack = {
  title: string;
  artist?: string;
  album?: string;
  coverUrl?: string;
  duration?: number;
};

export type MediaSessionHandlers = {
  onPlay?: () => void;
  onPause?: () => void;
  onNextTrack?: () => void;
  onPreviousTrack?: () => void;
  onSeek?: (time: number) => void;
};

/** Returns true when the Media Session API is available in this environment. */
export function isMediaSessionSupported(): boolean {
  return typeof navigator !== 'undefined' && 'mediaSession' in navigator;
}

/**
 * Update the lock-screen / notification track metadata.
 * No-op when Media Session API is unavailable.
 */
export function setMediaSessionMetadata(track: MediaSessionTrack): void {
  if (!isMediaSessionSupported()) return;

  const artwork = track.coverUrl
    ? [
        { src: track.coverUrl, sizes: '512x512', type: 'image/jpeg' },
        { src: track.coverUrl, sizes: '256x256', type: 'image/jpeg' },
      ]
    : [{ src: '/logo.svg', sizes: '512x512', type: 'image/svg+xml' }];

  navigator.mediaSession.metadata = new MediaMetadata({
    title: track.title,
    artist: track.artist ?? 'AIXENTRA',
    album: track.album ?? 'AI Music Platform',
    artwork,
  });
}

/**
 * Register playback control handlers for lock-screen / notification media controls.
 * No-op when Media Session API is unavailable.
 */
export function registerMediaSessionHandlers(handlers: MediaSessionHandlers): void {
  if (!isMediaSessionSupported()) return;

  if (handlers.onPlay) navigator.mediaSession.setActionHandler('play', handlers.onPlay);
  if (handlers.onPause) navigator.mediaSession.setActionHandler('pause', handlers.onPause);
  if (handlers.onNextTrack) navigator.mediaSession.setActionHandler('nexttrack', handlers.onNextTrack);
  if (handlers.onPreviousTrack) navigator.mediaSession.setActionHandler('previoustrack', handlers.onPreviousTrack);

  if (handlers.onSeek) {
    try {
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined && handlers.onSeek) {
          handlers.onSeek(details.seekTime);
        }
      });
    } catch {
      // 'seekto' is not supported in all browsers – ignore
    }
  }
}

/**
 * Update the playback position state shown on the lock screen.
 */
export function updateMediaSessionPosition(currentTime: number, duration: number, playbackRate = 1): void {
  if (!isMediaSessionSupported() || !duration) return;
  try {
    navigator.mediaSession.setPositionState({
      duration,
      position: Math.min(currentTime, duration),
      playbackRate,
    });
  } catch {
    // Ignore – older browsers may not support setPositionState
  }
}

/**
 * Set the playback state (playing | paused | none) on the media session.
 */
export function setMediaSessionPlaybackState(state: 'playing' | 'paused' | 'none'): void {
  if (!isMediaSessionSupported()) return;
  navigator.mediaSession.playbackState = state;
}
