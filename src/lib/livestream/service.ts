/**
 * Live Streaming Service
 *
 * Provides simulation of real-time chat, reactions, and stream state
 * using client-side timers as a placeholder for WebSocket/WebRTC infrastructure.
 *
 * TODO (follow-up):
 *  - Replace interval simulation with Supabase Realtime channels or WebSocket server
 *  - Integrate WebRTC (e.g., LiveKit, Mux, or Agora) for actual video/audio streaming
 *  - Connect tip payments to Stripe or in-platform coin system
 */

import type { LiveChatMessage, LiveReaction, ReactionEmoji, TipPayload } from './types';

const REACTION_EMOJIS: ReactionEmoji[] = ['🔥', '❤️', '🎵', '⚡', '💜', '🎤', '🥁', '🎸', '👏', '🙌'];

let messageIdCounter = 1000;
let reactionIdCounter = 1000;

/** Generate a unique ID for messages / reactions */
function nextId(prefix: string): string {
  return `${prefix}-${++messageIdCounter}-${Date.now()}`;
}

/** Simulate random viewer count drift (placeholder until real viewer tracking) */
export function simulateViewerDrift(current: number): number {
  const delta = Math.floor((Math.random() - 0.45) * 30);
  return Math.max(1, current + delta);
}

/** Build a chat message object for a new viewer-submitted message */
export function buildChatMessage(
  streamId: string,
  userId: string,
  userName: string,
  userAvatar: string,
  content: string,
): LiveChatMessage {
  return {
    id: nextId('msg'),
    streamId,
    userId,
    userName,
    userAvatar,
    content,
    timestamp: new Date().toISOString(),
    type: 'message',
  };
}

/** Build a tip event message to display in chat */
export function buildTipMessage(
  streamId: string,
  userId: string,
  userName: string,
  userAvatar: string,
  tip: TipPayload,
): LiveChatMessage {
  const currency = tip.currency === 'AIXC' ? 'AIXC' : '$';
  const label = tip.currency === 'AIXC' ? tip.amount.toFixed(0) : tip.amount.toFixed(2);
  return {
    id: nextId('tip'),
    streamId,
    userId,
    userName,
    userAvatar,
    content: `💸 Tipped ${currency}${label}${tip.message ? ` — "${tip.message}"` : ''}`,
    timestamp: new Date().toISOString(),
    type: 'tip',
    tipAmount: tip.amount,
  };
}

/** Build a floating reaction object */
export function buildReaction(emoji: ReactionEmoji): LiveReaction {
  return {
    id: `rx-${++reactionIdCounter}-${Date.now()}`,
    emoji,
    x: 10 + Math.random() * 80, // random horizontal position 10–90%
    timestamp: Date.now(),
  };
}

/** Pick a random reaction emoji */
export function randomEmoji(): ReactionEmoji {
  return REACTION_EMOJIS[Math.floor(Math.random() * REACTION_EMOJIS.length)];
}

/** All available reaction emojis for the picker */
export { REACTION_EMOJIS };

/** Format viewer count (e.g. 1842 → "1.8K") */
export function formatViewerCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return String(count);
}

/** Format elapsed time since stream started */
export function formatElapsed(startedAt: string | undefined): string {
  if (!startedAt) return '00:00';
  const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Format scheduled time for display */
export function formatScheduled(scheduledAt: string): string {
  const d = new Date(scheduledAt);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Stream type human-readable label */
export const STREAM_TYPE_LABELS: Record<string, string> = {
  creator_livestream: '🎙️ Livestream',
  ai_concert: '🤖 AI Concert',
  listening_party: '🎧 Listening Party',
  remix_battle: '🥊 Remix Battle',
};

/** Tip presets in USD */
export const TIP_PRESETS = [1, 5, 10, 20, 50] as const;
