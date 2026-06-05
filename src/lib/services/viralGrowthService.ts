/**
 * Viral Growth Service
 * Tracks remix/duet chains, trending challenges, referral rewards,
 * creator contests, achievement badges, creator rankings, and streaks.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type RemixNode = {
  songId: string;
  title: string;
  creatorId: string;
  creatorName: string;
  parentSongId: string | null;
  depth: number; // 0 = original
  createdAt: string;
};

export type RemixChain = {
  rootSongId: string;
  rootTitle: string;
  nodes: RemixNode[];
  totalDepth: number;
};

export type DuetNode = {
  duetId: string;
  songId: string;
  title: string;
  creatorId: string;
  creatorName: string;
  partnerSongId: string | null;
  sequenceIndex: number; // position in the duet chain
  createdAt: string;
};

export type DuetChain = {
  chainId: string;
  title: string;
  nodes: DuetNode[];
  totalParticipants: number;
};

export type Challenge = {
  id: string;
  title: string;
  description: string;
  hashtag: string;
  creatorId: string;
  creatorName: string;
  coverUrl: string;
  submissionCount: number;
  trendingScore: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'ended' | 'upcoming';
  prizePool?: number;
};

export type ChallengeSubmission = {
  id: string;
  challengeId: string;
  songId: string;
  songTitle: string;
  creatorId: string;
  creatorName: string;
  votes: number;
  submittedAt: string;
};

export type ReferralRecord = {
  referrerId: string;
  referrerName: string;
  referredUserId: string;
  referredUserName: string;
  rewardPoints: number;
  rewardStatus: 'pending' | 'credited';
  createdAt: string;
};

export type Contest = {
  id: string;
  title: string;
  description: string;
  genre: string;
  submissionStart: string;
  submissionEnd: string;
  votingEnd: string;
  status: 'open' | 'voting' | 'ended';
  entryCount: number;
  prizeTiers: { rank: number; reward: string }[];
  winnerId?: string;
  winnerName?: string;
};

export type AchievementBadge = {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji or icon identifier
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';
  unlockTrigger: string; // human-readable trigger description
  xpReward: number;
};

export type UserAchievement = {
  userId: string;
  badgeId: string;
  unlockedAt: string;
  progress?: number; // 0–100 when partially completed
};

export type CreatorRanking = {
  rank: number;
  creatorId: string;
  creatorName: string;
  avatarUrl: string;
  plays: number;
  remixes: number;
  duets: number;
  contestWins: number;
  totalXp: number;
  badgeCount: number;
  verified: boolean;
};

export type UserStreak = {
  userId: string;
  currentStreak: number; // consecutive active days
  longestStreak: number;
  lastActiveDate: string; // ISO date
  totalActiveDays: number;
  streakBroken: boolean;
};

export type TrendingSnapshot = {
  date: string; // ISO date
  topTracks: { songId: string; title: string; creatorName: string; score: number }[];
  topCreators: { creatorId: string; name: string; followerGain: number }[];
  topChallenges: { challengeId: string; title: string; newSubmissions: number }[];
};

// ─── Trending Calculation ─────────────────────────────────────────────────────

const CHALLENGE_DECAY_HOURS = 48;

export function calculateChallengeTrendingScore(challenge: {
  submissionCount: number;
  startDate: string;
}): number {
  const ageHours = Math.max(
    0,
    (Date.now() - new Date(challenge.startDate).getTime()) / (1000 * 60 * 60),
  );
  const decayFactor = Math.max(0, 1 - ageHours / CHALLENGE_DECAY_HOURS);
  return Math.round(challenge.submissionCount * 10 * (0.5 + decayFactor));
}

export function rankChallenges(challenges: Challenge[]): Challenge[] {
  return [...challenges]
    .map((c) => ({
      ...c,
      trendingScore: calculateChallengeTrendingScore({
        submissionCount: c.submissionCount,
        startDate: c.startDate,
      }),
    }))
    .sort((a, b) => b.trendingScore - a.trendingScore);
}

// ─── Remix Chain Helpers ──────────────────────────────────────────────────────

export function buildRemixChain(nodes: RemixNode[]): RemixChain {
  const root = nodes.find((n) => n.parentSongId === null);
  if (!root) {
    return { rootSongId: '', rootTitle: '', nodes, totalDepth: 0 };
  }
  const maxDepth = nodes.reduce((acc, n) => Math.max(acc, n.depth), 0);
  return {
    rootSongId: root.songId,
    rootTitle: root.title,
    nodes,
    totalDepth: maxDepth,
  };
}

export function getRemixLineage(songId: string, nodes: RemixNode[]): RemixNode[] {
  const lineage: RemixNode[] = [];
  let current = nodes.find((n) => n.songId === songId);
  while (current) {
    lineage.unshift(current);
    const parentId = current.parentSongId;
    current = parentId ? nodes.find((n) => n.songId === parentId) : undefined;
  }
  return lineage;
}

// ─── Streak Helpers ───────────────────────────────────────────────────────────

export function computeStreak(activeDates: string[]): UserStreak {
  const sorted = [...new Set(activeDates)].sort();
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  for (const dateStr of sorted) {
    const date = new Date(dateStr);
    if (prevDate) {
      const diffDays = Math.round(
        (date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (diffDays === 1) {
        tempStreak += 1;
      } else {
        tempStreak = 1;
      }
    } else {
      tempStreak = 1;
    }
    longestStreak = Math.max(longestStreak, tempStreak);
    prevDate = date;
  }
  currentStreak = tempStreak;

  const today = new Date().toISOString().slice(0, 10);
  const lastDate = sorted[sorted.length - 1] ?? '';
  const streakBroken = lastDate < today && lastDate !== '';

  return {
    userId: '',
    currentStreak: streakBroken ? 0 : currentStreak,
    longestStreak,
    lastActiveDate: lastDate,
    totalActiveDays: sorted.length,
    streakBroken,
  };
}

// ─── Achievement Unlock Helpers ───────────────────────────────────────────────

export function checkBadgeUnlock(
  badge: AchievementBadge,
  stats: {
    plays: number;
    remixes: number;
    duets: number;
    streak: number;
    referrals: number;
    contestWins: number;
    challengeSubmissions: number;
  },
): boolean {
  const trigger = badge.unlockTrigger.toLowerCase();
  if (trigger.includes('1000 plays')) return stats.plays >= 1000;
  if (trigger.includes('10000 plays')) return stats.plays >= 10000;
  if (trigger.includes('100000 plays')) return stats.plays >= 100000;
  if (trigger.includes('first remix')) return stats.remixes >= 1;
  if (trigger.includes('10 remixes')) return stats.remixes >= 10;
  if (trigger.includes('first duet')) return stats.duets >= 1;
  if (trigger.includes('7-day streak')) return stats.streak >= 7;
  if (trigger.includes('30-day streak')) return stats.streak >= 30;
  if (trigger.includes('first referral')) return stats.referrals >= 1;
  if (trigger.includes('contest win')) return stats.contestWins >= 1;
  if (trigger.includes('challenge')) return stats.challengeSubmissions >= 1;
  return false;
}

// ─── Leaderboard Sorting ──────────────────────────────────────────────────────

export type LeaderboardMetric = 'plays' | 'remixes' | 'duets' | 'contestWins' | 'totalXp';

export function sortLeaderboard(
  rankings: CreatorRanking[],
  metric: LeaderboardMetric,
): CreatorRanking[] {
  return [...rankings]
    .sort((a, b) => b[metric] - a[metric])
    .map((entry, i) => ({ ...entry, rank: i + 1 }));
}

// ─── Referral Points ──────────────────────────────────────────────────────────

export const REFERRAL_REWARD_POINTS = 100;

export function calculateReferralReward(referrals: ReferralRecord[]): number {
  return referrals
    .filter((r) => r.rewardStatus === 'credited')
    .reduce((acc, r) => acc + r.rewardPoints, 0);
}
