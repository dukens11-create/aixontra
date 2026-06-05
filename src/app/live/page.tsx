'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Radio, Calendar, Users, Clock } from 'lucide-react';
import { demoStreams } from '@/lib/livestream/demoData';
import {
  formatViewerCount,
  formatScheduled,
  formatElapsed,
  STREAM_TYPE_LABELS,
} from '@/lib/livestream/service';
import type { StreamType } from '@/lib/livestream/types';

const TYPE_FILTERS: { label: string; value: StreamType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: '🎙️ Livestreams', value: 'creator_livestream' },
  { label: '🤖 AI Concerts', value: 'ai_concert' },
  { label: '🎧 Listening Parties', value: 'listening_party' },
  { label: '🥊 Remix Battles', value: 'remix_battle' },
];

export default function LivePage() {
  const [filter, setFilter] = useState<StreamType | 'all'>('all');
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleType, setScheduleType] = useState<StreamType>('creator_livestream');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleDesc, setScheduleDesc] = useState('');
  const [scheduled, setScheduled] = useState(false);

  const liveStreams = demoStreams.filter((s) => s.status === 'live');
  const upcomingStreams = demoStreams.filter((s) => s.status === 'scheduled');
  const pastStreams = demoStreams.filter((s) => s.status === 'ended');

  const filtered = (list: typeof demoStreams) =>
    filter === 'all' ? list : list.filter((s) => s.type === filter);

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    setScheduled(true);
    setShowScheduleForm(false);
    setScheduleTitle('');
    setScheduleDate('');
    setScheduleDesc('');
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <section className="card bg-white/5 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Radio size={20} className="text-red-500 animate-pulse" />
              <h1 className="text-3xl font-black">Live</h1>
              {liveStreams.length > 0 && (
                <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                  {liveStreams.length} LIVE
                </span>
              )}
            </div>
            <p className="muted">Livestreams · AI Concerts · Listening Parties · Remix Battles</p>
          </div>
          <button
            className="btn"
            onClick={() => setShowScheduleForm((v) => !v)}
          >
            <Calendar size={16} className="mr-2 inline" />
            Schedule Stream
          </button>
        </div>

        {/* Type filters */}
        <div className="mt-4 flex flex-wrap gap-2">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`badge cursor-pointer transition-colors ${filter === f.value ? 'bg-purple-600 text-white border-purple-600' : ''}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      {/* Schedule Form */}
      {showScheduleForm && (
        <motion.section
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-black/40 border-purple-500/30"
        >
          <h2 className="mb-4">Schedule a New Stream</h2>
          {scheduled && (
            <p className="mb-3 rounded-lg bg-green-900/40 px-3 py-2 text-sm text-green-400">
              ✅ Stream scheduled! It will appear in your dashboard.
            </p>
          )}
          <form onSubmit={handleSchedule} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="muted mb-1 block text-xs">Stream Title</label>
                <input
                  className="input"
                  placeholder="My Awesome Livestream"
                  value={scheduleTitle}
                  onChange={(e) => setScheduleTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="muted mb-1 block text-xs">Stream Type</label>
                <select
                  className="select"
                  value={scheduleType}
                  onChange={(e) => setScheduleType(e.target.value as StreamType)}
                >
                  <option value="creator_livestream">🎙️ Livestream</option>
                  <option value="ai_concert">🤖 AI Concert</option>
                  <option value="listening_party">🎧 Listening Party</option>
                  <option value="remix_battle">🥊 Remix Battle</option>
                </select>
              </div>
              <div>
                <label className="muted mb-1 block text-xs">Date &amp; Time</label>
                <input
                  type="datetime-local"
                  className="input"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="muted mb-1 block text-xs">Description</label>
                <input
                  className="input"
                  placeholder="What's this stream about?"
                  value={scheduleDesc}
                  onChange={(e) => setScheduleDesc(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn">Schedule</button>
              <button
                type="button"
                className="btn secondary"
                onClick={() => setShowScheduleForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.section>
      )}

      {/* LIVE NOW */}
      {filtered(liveStreams).length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <h2>Live Now</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered(liveStreams).map((stream, i) => (
              <motion.div
                key={stream.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <Link href={`/live/${stream.id}`} className="block group">
                  <article className="card bg-black/40 hover:border-red-500/60 transition-colors overflow-hidden p-0">
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={stream.coverUrl}
                        alt={stream.title}
                        className="h-44 w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                      <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                        LIVE
                      </span>
                      <span className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white/80">
                        {STREAM_TYPE_LABELS[stream.type]}
                      </span>
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="font-bold text-white line-clamp-1">{stream.title}</p>
                        <p className="text-xs text-white/70">{stream.creatorName}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users size={12} />
                        <span>{formatViewerCount(stream.viewerCount)} viewers</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock size={12} />
                        <span>{formatElapsed(stream.startedAt)}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* UPCOMING */}
      {filtered(upcomingStreams).length > 0 && (
        <section>
          <h2 className="mb-3">Upcoming</h2>
          <div className="space-y-3">
            {filtered(upcomingStreams).map((stream) => (
              <article key={stream.id} className="card bg-black/30 flex flex-wrap gap-4 items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={stream.coverUrl}
                  alt={stream.title}
                  className="h-16 w-24 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold line-clamp-1">{stream.title}</p>
                  <p className="muted">{stream.creatorName} · {STREAM_TYPE_LABELS[stream.type]}</p>
                  <p className="muted flex items-center gap-1 mt-0.5">
                    <Calendar size={12} />
                    {formatScheduled(stream.scheduledAt)}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button className="badge cursor-pointer hover:border-purple-500 transition-colors">
                    Set Reminder
                  </button>
                  <Link href={`/live/${stream.id}`} className="badge hover:border-white transition-colors">
                    Preview
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* PAST */}
      {filtered(pastStreams).length > 0 && (
        <section>
          <h2 className="mb-3">Recent Replays</h2>
          <div className="space-y-3">
            {filtered(pastStreams).map((stream) => (
              <article key={stream.id} className="card bg-black/20 flex flex-wrap gap-4 items-center opacity-75">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={stream.coverUrl}
                  alt={stream.title}
                  className="h-16 w-24 rounded-xl object-cover flex-shrink-0 grayscale"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold line-clamp-1">{stream.title}</p>
                  <p className="muted">{stream.creatorName} · {STREAM_TYPE_LABELS[stream.type]}</p>
                  <p className="muted">{formatViewerCount(stream.peakViewerCount)} peak viewers</p>
                </div>
                <span className="badge flex-shrink-0">Ended</span>
              </article>
            ))}
          </div>
        </section>
      )}

      {filtered(liveStreams).length === 0 && filtered(upcomingStreams).length === 0 && (
        <div className="card bg-black/30 text-center py-12">
          <Radio size={40} className="mx-auto mb-3 text-muted-foreground" />
          <p className="muted">No streams found for this filter. Check back soon or schedule your own!</p>
        </div>
      )}
    </div>
  );
}
