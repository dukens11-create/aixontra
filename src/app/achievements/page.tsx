'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  achievementBadges,
  userAchievements,
  userStreaks,
  referrals,
} from '@/lib/platform/viralGrowthData';
import { calculateReferralReward } from '@/lib/services/viralGrowthService';
import { BadgeGrid } from '@/components/BadgeDisplay';

// Demo: show achievements for creator-1
const DEMO_USER_ID = 'creator-1';

export default function AchievementsPage() {
  const [animateNew, setAnimateNew] = useState<string | null>(null);

  const myAchievements = userAchievements.filter((a) => a.userId === DEMO_USER_ID);
  const unlockedIds = new Set(myAchievements.map((a) => a.badgeId));
  const myStreak = userStreaks.find((s) => s.userId === DEMO_USER_ID);
  const myReferrals = referrals.filter((r) => r.referrerId === DEMO_USER_ID);
  const referralPoints = calculateReferralReward(myReferrals);

  const totalXp = achievementBadges
    .filter((b) => unlockedIds.has(b.id))
    .reduce((acc, b) => acc + b.xpReward, 0);

  const handlePreviewUnlock = () => {
    // Animate the first locked badge as a demo
    const locked = achievementBadges.find((b) => !unlockedIds.has(b.id));
    if (locked) setAnimateNew(locked.id);
    setTimeout(() => setAnimateNew(null), 2000);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="card bg-white/5">
        <h1>🎖️ Achievement Badges</h1>
        <p className="muted">
          Unlock badges by hitting milestones — plays, remixes, duets, streaks, and more.
          Each badge awards XP toward your creator ranking.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <Link href="/leaderboard" className="badge">🏆 Leaderboard</Link>
          <Link href="/challenges" className="badge">⚡ Challenges</Link>
          <Link href="/trending" className="badge">🔥 Daily Trending</Link>
        </div>
      </div>

      {/* Stats bar */}
      <div className="card flex flex-wrap gap-6">
        <div className="flex flex-col gap-0.5">
          <span className="text-2xl font-bold text-yellow-400">{unlockedIds.size}</span>
          <span className="muted text-xs">Badges Unlocked</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-2xl font-bold text-purple-400">{totalXp.toLocaleString()}</span>
          <span className="muted text-xs">Total XP</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-2xl font-bold text-green-400">{myStreak?.currentStreak ?? 0}</span>
          <span className="muted text-xs">Day Streak 🔥</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-2xl font-bold text-cyan-400">{referralPoints}</span>
          <span className="muted text-xs">Referral Points</span>
        </div>
        <button className="btn secondary text-sm self-center" onClick={handlePreviewUnlock}>
          Preview Unlock Animation
        </button>
      </div>

      {/* Streak Section */}
      {myStreak && (
        <div className="card flex flex-col gap-2">
          <h2>🔥 Daily Streak</h2>
          <div className="flex flex-wrap gap-4 mt-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-3xl font-black text-orange-400">{myStreak.currentStreak}</span>
              <span className="muted text-xs">Current Streak</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-3xl font-black text-yellow-400">{myStreak.longestStreak}</span>
              <span className="muted text-xs">Longest Streak</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-3xl font-black">{myStreak.totalActiveDays}</span>
              <span className="muted text-xs">Total Active Days</span>
            </div>
          </div>
          {myStreak.streakBroken && (
            <p className="text-sm text-red-400 mt-1">⚠️ Your streak was broken. Log in today to start a new one!</p>
          )}
          {!myStreak.streakBroken && myStreak.currentStreak >= 7 && (
            <p className="text-sm text-green-400 mt-1">🌟 Amazing streak! Keep it up to unlock the Consistency King badge.</p>
          )}
        </div>
      )}

      {/* Referral Rewards */}
      <div className="card flex flex-col gap-3">
        <h2>🤝 Referral Rewards</h2>
        <p className="muted text-sm">Invite creators and earn {100} points per successful referral.</p>
        {myReferrals.length === 0 ? (
          <p className="muted text-sm">No referrals yet. Share your invite link to start earning!</p>
        ) : (
          <div className="flex flex-col gap-2">
            {myReferrals.map((r) => (
              <div key={r.referredUserId} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-black/20 px-3 py-2">
                <div>
                  <p className="font-semibold text-sm">{r.referredUserName}</p>
                  <p className="muted text-xs">Joined via your link</p>
                </div>
                <span className={`badge text-xs ${r.rewardStatus === 'credited' ? 'text-green-400 border-green-500/30' : 'text-yellow-400 border-yellow-500/30'}`}>
                  {r.rewardStatus === 'credited' ? `+${r.rewardPoints} pts` : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between mt-2 rounded-xl border border-border bg-black/20 px-3 py-2">
          <span className="font-semibold text-sm">Total Referral Points</span>
          <span className="font-bold text-cyan-400">{referralPoints}</span>
        </div>
      </div>

      {/* Badge grid */}
      <div className="card flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2>All Badges</h2>
          <span className="muted text-xs">{unlockedIds.size} / {achievementBadges.length} unlocked</span>
        </div>
        <BadgeGrid
          badges={achievementBadges}
          unlockedBadgeIds={unlockedIds}
          animateNew={animateNew}
        />
      </div>
    </div>
  );
}
