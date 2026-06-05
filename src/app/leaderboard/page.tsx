'use client';

import Link from 'next/link';
import { creatorRankings } from '@/lib/platform/viralGrowthData';
import { Leaderboard } from '@/components/Leaderboard';

export default function LeaderboardPage() {
  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="card bg-white/5">
        <h1>🏆 Creator Leaderboard</h1>
        <p className="muted">
          Ranked by plays, remixes, duets, contest wins, and total XP. Filter by any metric below.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <Link href="/trending" className="badge">🔥 Daily Trending</Link>
          <Link href="/challenges" className="badge">⚡ Challenges</Link>
          <Link href="/achievements" className="badge">🎖️ Achievements</Link>
        </div>
      </div>

      {/* Podium */}
      <div className="grid gap-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        {creatorRankings.slice(0, 3).map((creator, i) => {
          const medals = ['🥇', '🥈', '🥉'];
          const colors = [
            'from-yellow-600/20 to-yellow-400/5 border-yellow-500/40',
            'from-slate-500/20 to-slate-300/5 border-slate-400/40',
            'from-orange-700/20 to-orange-400/5 border-orange-500/40',
          ];
          return (
            <div
              key={creator.creatorId}
              className={`card flex flex-col items-center gap-3 bg-gradient-to-b ${colors[i]} text-center`}
            >
              <span className="text-4xl mt-2">{medals[i]}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={creator.avatarUrl}
                alt={creator.creatorName}
                className="w-16 h-16 rounded-full object-cover border-2 border-border"
              />
              <div>
                <p className="font-bold">{creator.creatorName}</p>
                {creator.verified && <p className="text-xs text-cyan-400">✓ Verified</p>}
              </div>
              <div className="flex flex-wrap gap-1 justify-center">
                <span className="badge text-xs">▶ {creator.plays.toLocaleString()}</span>
                <span className="badge text-xs">⚡ {creator.totalXp.toLocaleString()} XP</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Leaderboard */}
      <div className="card">
        <h2 className="mb-4">Full Rankings</h2>
        <Leaderboard rankings={creatorRankings} />
      </div>

      {/* Stats summary */}
      <div className="card bg-white/5">
        <h3>Leaderboard Stats</h3>
        <div className="flex flex-wrap gap-4 mt-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-2xl font-bold">{creatorRankings.length}</span>
            <span className="muted text-xs">Ranked Creators</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-2xl font-bold">{creatorRankings.reduce((a, c) => a + c.plays, 0).toLocaleString()}</span>
            <span className="muted text-xs">Total Plays</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-2xl font-bold">{creatorRankings.reduce((a, c) => a + c.remixes, 0)}</span>
            <span className="muted text-xs">Total Remixes</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-2xl font-bold">{creatorRankings.reduce((a, c) => a + c.totalXp, 0).toLocaleString()}</span>
            <span className="muted text-xs">Total XP Earned</span>
          </div>
        </div>
      </div>
    </div>
  );
}
