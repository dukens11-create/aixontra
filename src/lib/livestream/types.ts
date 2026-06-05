// ============================================================================
// Live Streaming Types
// ============================================================================

export type StreamType = 'creator_livestream' | 'ai_concert' | 'listening_party' | 'remix_battle';
export type StreamStatus = 'scheduled' | 'live' | 'ended' | 'cancelled';
export type ReactionEmoji = '🔥' | '❤️' | '🎵' | '⚡' | '💜' | '🎤' | '🥁' | '🎸' | '👏' | '🙌';

export interface LiveStream {
  id: string;
  title: string;
  description: string;
  type: StreamType;
  status: StreamStatus;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  coverUrl: string;
  streamUrl?: string;
  scheduledAt: string; // ISO date string
  startedAt?: string;
  endedAt?: string;
  viewerCount: number;
  peakViewerCount: number;
  guestCreators: GuestCreator[];
  tags: string[];
  tipTotal: number;
  chatEnabled: boolean;
  reactionsEnabled: boolean;
}

export interface GuestCreator {
  id: string;
  name: string;
  avatar: string;
  role: 'co-host' | 'performer' | 'battle-opponent';
  status: 'invited' | 'accepted' | 'declined' | 'live';
}

export interface LiveChatMessage {
  id: string;
  streamId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  type: 'message' | 'tip' | 'reaction' | 'system';
  tipAmount?: number;
  isModerator?: boolean;
  isPinned?: boolean;
}

export interface LiveReaction {
  id: string;
  emoji: ReactionEmoji;
  x: number; // 0-100 percent from left
  timestamp: number;
}

export interface TipPayload {
  streamId: string;
  amount: number;
  message?: string;
  currency: 'USD' | 'AIXC'; // AIXC = platform coins
}

export interface StreamSchedule {
  streams: LiveStream[];
  featured?: LiveStream;
}

export interface StreamState {
  isFullScreen: boolean;
  isChatOpen: boolean;
  isMuted: boolean;
  volume: number;
  quality: '1080p' | '720p' | '480p' | '360p' | 'auto';
}
