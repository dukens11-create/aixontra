'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Challenge } from '@/lib/services/viralGrowthService';

const statusStyles: Record<Challenge['status'], { label: string; color: string }> = {
  active: { label: 'Active', color: 'text-green-400 border-green-500/40 bg-green-500/10' },
  upcoming: { label: 'Upcoming', color: 'text-blue-400 border-blue-500/40 bg-blue-500/10' },
  ended: { label: 'Ended', color: 'text-muted-foreground border-border bg-muted/20' },
};

function formatTimeLeft(endDate: string): string {
  const diffMs = new Date(endDate).getTime() - Date.now();
  if (diffMs <= 0) return 'Ended';
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h left`;
  return `${hours}h left`;
}

type ChallengeCardProps = {
  challenge: Challenge;
  /** Called when the user clicks "Join Challenge" */
  onJoin?: (challengeId: string) => void;
};

export function ChallengeCard({ challenge, onJoin }: ChallengeCardProps) {
  const status = statusStyles[challenge.status];
  const timeLeft = formatTimeLeft(challenge.endDate);

  return (
    <motion.article
      className="card overflow-hidden flex flex-col gap-0 p-0"
      whileHover={{ y: -3, boxShadow: '0 8px 32px rgba(139,92,246,0.18)' }}
      transition={{ duration: 0.2 }}
    >
      {/* Cover */}
      <div className="relative h-36 overflow-hidden rounded-t-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={challenge.coverUrl}
          alt={challenge.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${status.color}`}
          >
            {status.label}
          </span>
          {challenge.prizePool && (
            <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 px-2 py-0.5 rounded-full">
              💰 ${challenge.prizePool}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2 p-4">
        <h3 className="text-base font-bold leading-tight">{challenge.title}</h3>
        <p className="text-xs text-cyan-400 font-mono">{challenge.hashtag}</p>
        <p className="text-sm text-muted-foreground leading-snug line-clamp-2">
          {challenge.description}
        </p>

        {/* Stats row */}
        <div className="flex flex-wrap gap-2 mt-1">
          <span className="badge">🎵 {challenge.submissionCount} submissions</span>
          {challenge.status !== 'ended' && (
            <span className="badge">⏳ {timeLeft}</span>
          )}
          <span className="badge">by {challenge.creatorName}</span>
        </div>

        {/* CTA */}
        <div className="flex gap-2 mt-2">
          {challenge.status === 'active' && (
            <button
              className="btn flex-1 text-sm py-2"
              onClick={() => onJoin?.(challenge.id)}
            >
              Join Challenge
            </button>
          )}
          <Link
            href={`/challenges/${challenge.id}`}
            className="btn secondary text-sm py-2 text-center flex-1"
          >
            View Details
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
