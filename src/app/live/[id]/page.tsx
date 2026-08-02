'use client';

import { use, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Maximize2,
  Minimize2,
  MessageSquare,
  Users,
  DollarSign,
  Clock,
  Share2,
  Heart,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { demoStreams, demoChatMessages } from '@/lib/livestream/demoData';
import {
  buildChatMessage,
  buildTipMessage,
  buildReaction,
  randomEmoji,
  formatViewerCount,
  formatElapsed,
  REACTION_EMOJIS,
  STREAM_TYPE_LABELS,
  TIP_PRESETS,
  simulateViewerDrift,
} from '@/lib/livestream/service';
import { FloatingReactions } from '@/components/platform/FloatingReactions';
import { LiveChatSidebar } from '@/components/platform/LiveChatSidebar';
import type { LiveChatMessage, LiveReaction, TipPayload } from '@/lib/livestream/types';

const DEMO_USER = {
  id: 'viewer-demo',
  name: 'You',
  avatar: '',
};

// Simulated chat bot messages for live feel
const BOT_MESSAGES = [
  'This is insane 🔥',
  'Love this vibe ❤️',
  'Can we get a drop?',
  'Been waiting for this!!',
  'Best livestream on AIXENTRA right now',
  '🎵🎵🎵',
  'Following for sure!',
  '⚡⚡⚡',
  'The bass hits different',
  'Someone clip that!',
];
const BOT_USERS = [
  { name: 'FunkMaster', avatar: '' },
  { name: 'BassDrop99', avatar: '' },
  { name: 'NightOwlBeats', avatar: '' },
  { name: 'WavyHorizon', avatar: '' },
  { name: 'SoundHunter', avatar: '' },
];

export default function LiveStreamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const stream = demoStreams.find((s) => s.id === id);

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<LiveChatMessage[]>(
    demoChatMessages.filter((m) => m.streamId === id || m.streamId === 'stream-1'),
  );
  const [reactions, setReactions] = useState<LiveReaction[]>([]);
  const [viewerCount, setViewerCount] = useState(stream?.viewerCount ?? 0);
  const [tipAmount, setTipAmount] = useState<number>(5);
  const [tipMessage, setTipMessage] = useState('');
  const [tipCurrency, setTipCurrency] = useState<'USD' | 'AIXC'>('USD');
  const [showTipPanel, setShowTipPanel] = useState(false);
  const [tipSent, setTipSent] = useState(false);
  const [elapsedKey, setElapsedKey] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);

  // Tick elapsed time
  useEffect(() => {
    const t = setInterval(() => setElapsedKey((k) => k + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Simulate viewer drift
  useEffect(() => {
    if (stream?.status !== 'live') return;
    const t = setInterval(() => {
      setViewerCount((c) => simulateViewerDrift(c));
    }, 4000);
    return () => clearInterval(t);
  }, [stream?.status]);

  // Simulate incoming chat messages
  useEffect(() => {
    if (stream?.status !== 'live') return;
    const interval = setInterval(() => {
      const bot = BOT_USERS[Math.floor(Math.random() * BOT_USERS.length)];
      const content = BOT_MESSAGES[Math.floor(Math.random() * BOT_MESSAGES.length)];
      const msg = buildChatMessage(id, `bot-${bot.name}`, bot.name, bot.avatar, content);
      setMessages((prev) => [...prev.slice(-99), msg]);
    }, 3500 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, [id, stream?.status]);

  // Simulate random reactions
  useEffect(() => {
    if (stream?.status !== 'live') return;
    const interval = setInterval(() => {
      const rx = buildReaction(randomEmoji());
      setReactions((prev) => [...prev.slice(-30), rx]);
    }, 1800 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, [stream?.status]);

  const handleSendMessage = useCallback(
    (content: string) => {
      const msg = buildChatMessage(id, DEMO_USER.id, DEMO_USER.name, DEMO_USER.avatar, content);
      setMessages((prev) => [...prev.slice(-99), msg]);
    },
    [id],
  );

  const handleReact = useCallback((emoji: (typeof REACTION_EMOJIS)[number]) => {
    const rx = buildReaction(emoji);
    setReactions((prev) => [...prev.slice(-30), rx]);
  }, []);

  const handleTip = useCallback(() => {
    const tip: TipPayload = {
      streamId: id,
      amount: tipAmount,
      message: tipMessage || undefined,
      currency: tipCurrency,
    };
    const msg = buildTipMessage(id, DEMO_USER.id, DEMO_USER.name, DEMO_USER.avatar, tip);
    setMessages((prev) => [...prev.slice(-99), msg]);
    setTipSent(true);
    setShowTipPanel(false);
    setTipMessage('');
    setTimeout(() => setTipSent(false), 4000);
  }, [id, tipAmount, tipMessage, tipCurrency]);

  const toggleFullScreen = useCallback(() => {
    if (!document.fullscreenElement && stageRef.current) {
      stageRef.current.requestFullscreen().catch(() => {});
      setIsFullScreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullScreen(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Loading state
  if (!stream) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Stream not found.</p>
        <Link href="/live" className="btn">
          Back to Live
        </Link>
      </div>
    );
  }

  const isLive = stream.status === 'live';
  const isScheduled = stream.status === 'scheduled';

  return (
    <div className="pb-8">
      {/* Back nav */}
      <div className="mb-3 flex items-center gap-2">
        <button onClick={() => router.back()} className="badge flex items-center gap-1 cursor-pointer">
          <ArrowLeft size={13} /> Back
        </button>
        <span className="muted">/</span>
        <span className="muted text-sm">Live</span>
      </div>

      {/* Tip success banner */}
      <AnimatePresence>
        {tipSent && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-3 rounded-xl bg-emerald-900/40 border border-emerald-500/40 px-4 py-2 text-sm text-emerald-400"
          >
            💸 Tip sent! Thank you for supporting {stream.creatorName}.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main layout: stage + chat */}
      <div className={`flex gap-4 ${isChatOpen ? 'flex-col lg:flex-row' : ''}`}>
        {/* Stage */}
        <div
          ref={stageRef}
          className={`relative flex-1 rounded-2xl overflow-hidden bg-black ${isFullScreen ? 'fixed inset-0 z-50 rounded-none' : ''}`}
          style={{ minHeight: 400 }}
        >
          {/* Cover / Stream placeholder */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={stream.coverUrl}
            alt={stream.title}
            className="h-full w-full object-cover"
            style={{ minHeight: isFullScreen ? '100vh' : 400 }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

          {/* Floating Reactions */}
          <FloatingReactions reactions={reactions} />

          {/* Status badge */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            {isLive && (
              <span className="flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                LIVE
              </span>
            )}
            {isScheduled && (
              <span className="rounded-full bg-yellow-600/80 px-2.5 py-1 text-xs font-bold text-white">
                UPCOMING
              </span>
            )}
            {stream.status === 'ended' && (
              <span className="rounded-full bg-gray-600/80 px-2.5 py-1 text-xs font-bold text-white">
                ENDED
              </span>
            )}
            <span className="rounded-full bg-black/60 px-2 py-0.5 text-xs text-white/80">
              {STREAM_TYPE_LABELS[stream.type]}
            </span>
          </div>

          {/* Top-right controls */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <button
              onClick={() => setIsMuted((m) => !m)}
              className="rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70 transition-colors"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
            <button
              onClick={toggleFullScreen}
              className="rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70 transition-colors"
              aria-label={isFullScreen ? 'Exit full screen' : 'Full screen'}
            >
              {isFullScreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
          </div>

          {/* Creator stage area (bottom of video) */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {/* Guest creators row */}
            {stream.guestCreators.length > 0 && (
              <div className="mb-2 flex gap-2 flex-wrap">
                {stream.guestCreators.map((guest) => (
                  <div
                    key={guest.id}
                    className="flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1"
                  >
                    <span className="text-xs text-white/80">
                      {guest.role === 'battle-opponent' ? '🥊' : '🎤'} {guest.name}
                    </span>
                    {guest.status === 'live' && (
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Creator info */}
            <div className="flex items-end justify-between">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={stream.creatorAvatar}
                  alt={stream.creatorName}
                  className="h-10 w-10 rounded-full border-2 border-purple-500 object-cover"
                />
                <div>
                  <p className="font-bold text-white">{stream.creatorName}</p>
                  <p className="text-xs text-white/70 line-clamp-1">{stream.title}</p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                {isLive && (
                  <>
                    <div className="flex items-center gap-1 text-xs text-white/70">
                      <Users size={12} />
                      <span>{formatViewerCount(viewerCount)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-white/70" key={elapsedKey}>
                      <Clock size={12} />
                      <span>{formatElapsed(stream.startedAt)}</span>
                    </div>
                  </>
                )}
                {isScheduled && (
                  <p className="text-xs text-yellow-400">
                    Starts soon · Set a reminder
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Offline / Scheduled overlay */}
          {!isLive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
              {isScheduled ? (
                <>
                  <Clock size={48} className="text-yellow-400 mb-3" />
                  <p className="text-xl font-bold text-white mb-1">Stream starting soon</p>
                  <p className="text-white/60 text-sm">
                    Scheduled for {new Date(stream.scheduledAt).toLocaleString()}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xl font-bold text-white mb-1">Stream has ended</p>
                  <p className="text-white/60 text-sm">
                    Peak: {formatViewerCount(stream.peakViewerCount)} viewers
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Chat Sidebar */}
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-[500px] w-full lg:h-auto lg:w-80 flex-shrink-0 rounded-2xl overflow-hidden border border-white/10"
          >
            <LiveChatSidebar
              messages={messages}
              onSend={handleSendMessage}
              onClose={() => setIsChatOpen(false)}
            />
          </motion.div>
        )}
      </div>

      {/* Action Bar */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {/* Reaction picker */}
        {isLive && (
          <div className="flex gap-1 flex-wrap">
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReact(emoji)}
                className="text-xl hover:scale-125 transition-transform cursor-pointer select-none rounded-lg px-2 py-1 hover:bg-white/10"
                title={`React with ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          {!isChatOpen && (
            <button
              className="badge flex items-center gap-1 cursor-pointer"
              onClick={() => setIsChatOpen(true)}
            >
              <MessageSquare size={13} /> Chat
            </button>
          )}
          <button className="badge flex items-center gap-1 cursor-pointer">
            <Heart size={13} /> Follow
          </button>
          <button className="badge flex items-center gap-1 cursor-pointer">
            <Share2 size={13} /> Share
          </button>
          {isLive && (
            <button
              className="btn flex items-center gap-1"
              onClick={() => setShowTipPanel((v) => !v)}
            >
              <DollarSign size={14} /> Tip
            </button>
          )}
        </div>
      </div>

      {/* Tip Panel */}
      <AnimatePresence>
        {showTipPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden"
          >
            <div className="card bg-black/40 border-emerald-500/30">
              <h3 className="mb-3">💸 Tip {stream.creatorName}</h3>
              <div className="space-y-3">
                <div className="flex gap-2 flex-wrap">
                  {TIP_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setTipAmount(preset)}
                      className={`badge cursor-pointer transition-colors ${tipAmount === preset ? 'bg-emerald-700 border-emerald-600 text-white' : ''}`}
                    >
                      ${preset}
                    </button>
                  ))}
                  <div className="flex items-center gap-1">
                    <span className="muted text-xs">Custom:</span>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={tipAmount}
                      onChange={(e) => setTipAmount(Math.max(1, Number(e.target.value)))}
                      className="input w-20 text-sm py-1"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTipCurrency('USD')}
                    className={`badge cursor-pointer ${tipCurrency === 'USD' ? 'bg-emerald-700 border-emerald-600 text-white' : ''}`}
                  >
                    USD
                  </button>
                  <button
                    onClick={() => setTipCurrency('AIXC')}
                    className={`badge cursor-pointer ${tipCurrency === 'AIXC' ? 'bg-purple-700 border-purple-600 text-white' : ''}`}
                  >
                    AIXC Coins
                  </button>
                </div>
                <input
                  className="input"
                  placeholder="Optional message..."
                  value={tipMessage}
                  onChange={(e) => setTipMessage(e.target.value)}
                  maxLength={100}
                />
                <div className="flex gap-2">
                  <button className="btn" onClick={handleTip}>
                    Send Tip
                  </button>
                  <button className="btn secondary" onClick={() => setShowTipPanel(false)}>
                    Cancel
                  </button>
                </div>
                <p className="muted text-xs">
                  💡 Payment processing placeholder — Stripe integration coming soon.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stream Info */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="card bg-black/30">
            <h3 className="mb-1">{stream.title}</h3>
            <p className="muted mb-3">{stream.description}</p>
            <div className="flex flex-wrap gap-2">
              {stream.tags.map((tag) => (
                <span key={tag} className="badge">{tag}</span>
              ))}
            </div>
          </div>

          {/* Guest creators section */}
          {stream.guestCreators.length > 0 && (
            <div className="card bg-black/30">
              <h3 className="mb-3">Guest Creators</h3>
              <div className="space-y-2">
                {stream.guestCreators.map((guest) => (
                  <div key={guest.id} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-sm">
                      🎤
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{guest.name}</p>
                      <p className="muted text-xs capitalize">
                        {guest.role.replace('-', ' ')} · {guest.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="badge mt-3 cursor-pointer hover:border-purple-500 transition-colors">
                + Invite Guest Creator
              </button>
            </div>
          )}
        </div>

        {/* Stream stats sidebar */}
        <div className="space-y-3">
          <div className="card bg-black/30">
            <h3 className="mb-3 text-base">Stream Stats</h3>
            <div className="space-y-2 text-sm">
              {isLive && (
                <div className="flex justify-between">
                  <span className="muted">Live viewers</span>
                  <span className="font-semibold">{formatViewerCount(viewerCount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="muted">Peak viewers</span>
                <span className="font-semibold">{formatViewerCount(stream.peakViewerCount || viewerCount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="muted">Tips earned</span>
                <span className="font-semibold text-emerald-400">${stream.tipTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="muted">Type</span>
                <span>{STREAM_TYPE_LABELS[stream.type]}</span>
              </div>
            </div>
          </div>

          {!stream.guestCreators.length && (
            <div className="card bg-black/30">
              <h3 className="mb-2 text-base">Collaborate</h3>
              <p className="muted text-xs mb-2">Invite another creator to join your stream live.</p>
              <button className="badge w-full text-center cursor-pointer hover:border-purple-500 transition-colors">
                + Invite Guest Creator
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
