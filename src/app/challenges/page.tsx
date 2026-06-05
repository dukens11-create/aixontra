'use client';

import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  challenges,
  challengeSubmissions,
  contests,
} from '@/lib/platform/viralGrowthData';
import { rankChallenges } from '@/lib/services/viralGrowthService';
import { ChallengeCard } from '@/components/ChallengeCard';

export default function ChallengesPage() {
  const [filter, setFilter] = useState<'all' | 'active' | 'ended'>('all');

  const ranked = rankChallenges(challenges);
  const filtered = filter === 'all' ? ranked : ranked.filter((c) => c.status === filter);

  const handleJoin = (challengeId: string) => {
    toast.success(`Joined challenge! Upload your track with the challenge hashtag.`);
    console.log('Joining challenge:', challengeId);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="card bg-white/5">
        <h1>⚡ Trending Challenges</h1>
        <p className="muted">
          Join trending challenges, submit your track, and compete for prizes and recognition.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <Link href="/leaderboard" className="badge">🏆 Leaderboard</Link>
          <Link href="/trending" className="badge">🔥 Daily Trending</Link>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'active', 'ended'] as const).map((f) => (
          <button
            key={f}
            className={`badge cursor-pointer capitalize transition-colors ${filter === f ? 'bg-primary/20 border-primary text-primary' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All Challenges' : f === 'active' ? '🟢 Active' : '⏸ Ended'}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-semibold">No challenges found</p>
          <p className="muted text-sm mt-1">Check back soon for new challenges!</p>
        </div>
      )}

      {/* Challenge cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {filtered.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            onJoin={handleJoin}
          />
        ))}
      </div>

      {/* Top Submissions */}
      <div className="card flex flex-col gap-3">
        <h2>🎵 Top Submissions</h2>
        <p className="muted text-xs">Most-voted entries across all active challenges.</p>
        {challengeSubmissions.length === 0 ? (
          <p className="muted text-sm">No submissions yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {[...challengeSubmissions]
              .sort((a, b) => b.votes - a.votes)
              .map((sub, i) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-black/20 px-3 py-2.5"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-bold text-cyan-300 w-5 text-center">#{i + 1}</span>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{sub.songTitle}</p>
                      <p className="muted text-xs">by {sub.creatorName}</p>
                    </div>
                  </div>
                  <span className="badge shrink-0">🗳 {sub.votes.toLocaleString()} votes</span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Creator Contests */}
      <div className="card flex flex-col gap-4">
        <h2>🏆 Creator Contests</h2>
        <p className="muted text-xs">Formal competitions with submission periods, voting, and prizes.</p>
        {contests.map((contest) => {
          const statusBadge =
            contest.status === 'open'
              ? 'text-green-400 border-green-500/40 bg-green-500/10'
              : contest.status === 'voting'
              ? 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10'
              : 'text-muted-foreground border-border';
          return (
            <div key={contest.id} className="rounded-xl border border-border bg-black/20 p-4 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <h3 className="text-base font-bold">{contest.title}</h3>
                  <p className="muted text-xs mt-0.5">{contest.genre} · {contest.entryCount} entries</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border capitalize ${statusBadge}`}>
                  {contest.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{contest.description}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {contest.prizeTiers.map((tier) => (
                  <span key={tier.rank} className="badge text-yellow-400 border-yellow-500/30">
                    #{tier.rank}: {tier.reward}
                  </span>
                ))}
              </div>
              {contest.winnerId && (
                <p className="text-sm text-green-400 font-semibold mt-1">
                  🏆 Winner: {contest.winnerName}
                </p>
              )}
              {contest.status === 'open' && (
                <button
                  className="btn text-sm mt-2"
                  onClick={() => toast.success('Contest entry submitted! Good luck!')}
                >
                  Enter Contest
                </button>
              )}
              {contest.status === 'voting' && (
                <button
                  className="btn secondary text-sm mt-2"
                  onClick={() => toast.success('Vote cast!')}
                >
                  Vote Now
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
