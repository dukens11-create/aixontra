import { create } from 'zustand';
import { Track, PlayerState, PlayerControls } from '@/types';

interface PlayerStore extends PlayerState, PlayerControls {
  // Actions
  reset: () => void;
}

const initialState: PlayerState = {
  currentTrack: null,
  queue: [],
  isPlaying: false,
  volume: 0.7,
  currentTime: 0,
  duration: 0,
  mode: 'normal',
  isLoading: false,
};

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  ...initialState,

  play: (track?: Track) => {
    if (track) {
      set({ currentTrack: track, isPlaying: true, isLoading: true });
    } else {
      set({ isPlaying: true });
    }
  },

  pause: () => {
    set({ isPlaying: false });
  },

  togglePlay: () => {
    set((state) => ({ isPlaying: !state.isPlaying }));
  },

  next: () => {
    const { queue, currentTrack, mode } = get();
    
    if (!currentTrack) return;

    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    
    if (currentIndex === -1) return;

    let nextIndex: number;

    if (mode === 'shuffle') {
      // Random next track (exclude current)
      const availableIndices = queue
        .map((_, i) => i)
        .filter((i) => i !== currentIndex);
      nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    } else {
      // Normal or repeat-all: go to next
      nextIndex = currentIndex + 1;
      
      if (nextIndex >= queue.length) {
        if (mode === 'repeat-all') {
          nextIndex = 0;
        } else {
          // End of queue
          set({ isPlaying: false });
          return;
        }
      }
    }

    set({ currentTrack: queue[nextIndex], isPlaying: true, currentTime: 0 });
  },

  previous: () => {
    const { queue, currentTrack, currentTime } = get();
    
    if (!currentTrack) return;

    // If more than 3 seconds played, restart current track
    if (currentTime > 3) {
      set({ currentTime: 0 });
      return;
    }

    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    
    if (currentIndex === -1 || currentIndex === 0) {
      set({ currentTime: 0 });
      return;
    }

    const previousTrack = queue[currentIndex - 1];
    set({ currentTrack: previousTrack, isPlaying: true, currentTime: 0 });
  },

  seek: (time: number) => {
    set({ currentTime: time });
  },

  setVolume: (volume: number) => {
    set({ volume: Math.max(0, Math.min(1, volume)) });
  },

  setMode: (mode: PlayerState['mode']) => {
    set({ mode });
  },

  addToQueue: (track: Track) => {
    set((state) => {
      // Don't add if already in queue
      if (state.queue.some((t) => t.id === track.id)) {
        return state;
      }
      return { queue: [...state.queue, track] };
    });
  },

  removeFromQueue: (trackId: string) => {
    set((state) => ({
      queue: state.queue.filter((t) => t.id !== trackId),
    }));
  },

  clearQueue: () => {
    set({ queue: [], currentTrack: null, isPlaying: false });
  },

  reset: () => {
    set(initialState);
  },
}));

// Selectors for optimized re-renders
export const selectCurrentTrack = (state: PlayerStore) => state.currentTrack;
export const selectIsPlaying = (state: PlayerStore) => state.isPlaying;
export const selectQueue = (state: PlayerStore) => state.queue;
export const selectVolume = (state: PlayerStore) => state.volume;
export const selectMode = (state: PlayerStore) => state.mode;
