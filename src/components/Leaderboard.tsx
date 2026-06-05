'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CreatorRanking, LeaderboardMetric } from '@/lib/services/viralGrowthService';
import { sortLeaderboard } from '@/lib/services/viralGrowthService';

const metricLabels: Record<LeaderboardMetric, string> = {
  plays: '▶ Plays',
  remixes: '🔀 Remixes',
  duets: '🎤 Duets',
  contestWins: '🏆 Contest Wins',
  totalXp: '⚡ Total XP',
};

const tierBadge: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
};

type LeaderboardProps = {
  rankings: CreatorRanking[];
  /** Highlight this creator ID (e.g. logged-in user) */
  highlightCreatorId?: string;
};

export function Leaderboard({ rankings, highlightCreatorId }: LeaderboardProps) {
  const [metric, setMetric] = useState<LeaderboardMetric>('plays');
  const sorted = sortLeaderboard(rankings, metric);

  return (
    <div className="flex flex-col gap-4">
      {/* Metric filter tabs */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(metricLabels) as LeaderboardMetric[]).map((m) => (
          <button
            key={m}
            className={`badge cursor-pointer transition-colors ${metric === m ? 'bg-primary/20 border-primary text-primary' : ''}`}
            onClick={() => setMetric(m)}
          >
            {metricLabels[m]}
          </button>
        ))}
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={metric}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-2"
          >
            {sorted.map((creator) => {
              const isMe = creator.creatorId === highlightCreatorId;
              return (
                <motion.div
                  key={creator.creatorId}
                  layout
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${isMe ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}
                >
                  {/* Rank */}
                  <div className="w-8 text-center text-lg font-bold">
                    {tierBadge[creator.rank] ?? `#${creator.rank}`}
                  </div>

                  {/* Avatar */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={creator.avatarUrl}
                    alt={creator.creatorName}
                    className="w-10 h-10 rounded-full object-cover border border-border"
                  />

                  {/* Name + verified */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold truncate">{creator.creatorName}</span>
                      {creator.verified && (
                        <span className="text-cyan-400 text-xs" title="Verified">✓</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {creator.badgeCount} badge{creator.badgeCount !== 1 ? 's' : ''} · {creator.totalXp.toLocaleString()} XP
                    </p>
                  </div>

                  {/* Metric value */}
                  <div className="text-right">
                    <p className="font-bold tabular-nums">
                      {creator[metric].toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">{metricLabels[metric]}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
