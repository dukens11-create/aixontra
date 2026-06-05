/**
 * Demo data for viral growth features:
 * remix chains, duet chains, challenges, referrals, contests,
 * achievement badges, creator rankings, and streaks.
 */

import {
  AchievementBadge,
  Challenge,
  ChallengeSubmission,
  Contest,
  CreatorRanking,
  DuetChain,
  ReferralRecord,
  RemixNode,
  TrendingSnapshot,
  UserAchievement,
  UserStreak,
} from '@/lib/services/viralGrowthService';

// ─── Remix Chain ──────────────────────────────────────────────────────────────

export const remixNodes: RemixNode[] = [
  {
    songId: 'song-1',
    title: 'Midnight Kompa Signals',
    creatorId: 'creator-1',
    creatorName: 'NeonKreyol',
    parentSongId: null,
    depth: 0,
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
  },
  {
    songId: 'remix-1a',
    title: 'Midnight Kompa Signals (FutureDrill Flip)',
    creatorId: 'creator-2',
    creatorName: 'FutureDrill',
    parentSongId: 'song-1',
    depth: 1,
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
  {
    songId: 'remix-1b',
    title: 'Midnight Kompa Signals (Lo-fi Edit)',
    creatorId: 'creator-3',
    creatorName: 'BeatSage',
    parentSongId: 'song-1',
    depth: 1,
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
  },
  {
    songId: 'remix-2a',
    title: 'Kompa Drill Hybrid',
    creatorId: 'creator-4',
    creatorName: 'KreyolKloud',
    parentSongId: 'remix-1a',
    depth: 2,
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
];

// ─── Duet Chain ──────────────────────────────────────────────────────────────

export const duetChains: DuetChain[] = [
  {
    chainId: 'duet-chain-1',
    title: 'Chrome Street Collab Series',
    nodes: [
      {
        duetId: 'duet-1-1',
        songId: 'song-2',
        title: 'Chrome Street Psalms',
        creatorId: 'creator-2',
        creatorName: 'FutureDrill',
        partnerSongId: null,
        sequenceIndex: 0,
        createdAt: new Date(Date.now() - 60 * 3600 * 1000).toISOString(),
      },
      {
        duetId: 'duet-1-2',
        songId: 'duet-song-1',
        title: 'Chrome Street Psalms (ft. NeonKreyol)',
        creatorId: 'creator-1',
        creatorName: 'NeonKreyol',
        partnerSongId: 'song-2',
        sequenceIndex: 1,
        createdAt: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
      },
      {
        duetId: 'duet-1-3',
        songId: 'duet-song-2',
        title: 'Chrome Street Psalms (ft. BeatSage)',
        creatorId: 'creator-3',
        creatorName: 'BeatSage',
        partnerSongId: 'duet-song-1',
        sequenceIndex: 2,
        createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      },
    ],
    totalParticipants: 3,
  },
];

// ─── Challenges ───────────────────────────────────────────────────────────────

export const challenges: Challenge[] = [
  {
    id: 'challenge-1',
    title: 'Kompa Drop Challenge',
    description: 'Create the hardest Kompa-infused drop and share it. Best drop wins prizes!',
    hashtag: '#KompaDropChallenge',
    creatorId: 'creator-1',
    creatorName: 'NeonKreyol',
    coverUrl:
      'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?auto=format&fit=crop&w=900&q=80',
    submissionCount: 312,
    trendingScore: 0,
    startDate: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    endDate: new Date(Date.now() + 6 * 24 * 3600 * 1000).toISOString(),
    status: 'active',
    prizePool: 500,
  },
  {
    id: 'challenge-2',
    title: 'Midnight Verse Challenge',
    description: 'Add your verse to the Midnight Kompa Signals instrumental.',
    hashtag: '#MidnightVerseChallenge',
    creatorId: 'creator-2',
    creatorName: 'FutureDrill',
    coverUrl:
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80',
    submissionCount: 158,
    trendingScore: 0,
    startDate: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    endDate: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
    status: 'active',
  },
  {
    id: 'challenge-3',
    title: 'Afrobeat Fusion Challenge',
    description: 'Blend Afrobeat with any genre. Most creative fusion takes the crown.',
    hashtag: '#AfrobeatFusionChallenge',
    creatorId: 'creator-1',
    creatorName: 'NeonKreyol',
    coverUrl:
      'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?auto=format&fit=crop&w=900&q=80',
    submissionCount: 87,
    trendingScore: 0,
    startDate: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    status: 'active',
    prizePool: 250,
  },
];

export const challengeSubmissions: ChallengeSubmission[] = [
  {
    id: 'sub-1',
    challengeId: 'challenge-1',
    songId: 'remix-1a',
    songTitle: 'Midnight Kompa Signals (FutureDrill Flip)',
    creatorId: 'creator-2',
    creatorName: 'FutureDrill',
    votes: 842,
    submittedAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
  },
  {
    id: 'sub-2',
    challengeId: 'challenge-1',
    songId: 'remix-1b',
    songTitle: 'Midnight Kompa Signals (Lo-fi Edit)',
    creatorId: 'creator-3',
    creatorName: 'BeatSage',
    votes: 523,
    submittedAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
  },
];

// ─── Referrals ────────────────────────────────────────────────────────────────

export const referrals: ReferralRecord[] = [
  {
    referrerId: 'creator-1',
    referrerName: 'NeonKreyol',
    referredUserId: 'creator-3',
    referredUserName: 'BeatSage',
    rewardPoints: 100,
    rewardStatus: 'credited',
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
  {
    referrerId: 'creator-1',
    referrerName: 'NeonKreyol',
    referredUserId: 'creator-4',
    referredUserName: 'KreyolKloud',
    rewardPoints: 100,
    rewardStatus: 'credited',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
];

// ─── Contests ─────────────────────────────────────────────────────────────────

export const contests: Contest[] = [
  {
    id: 'contest-1',
    title: 'AIXENTRA Beat Battle #1',
    description: 'Submit your best original beat. Top 3 win cash prizes and platform features.',
    genre: 'Open',
    submissionStart: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    submissionEnd: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString(),
    votingEnd: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    status: 'open',
    entryCount: 47,
    prizeTiers: [
      { rank: 1, reward: '$200 + Featured Placement' },
      { rank: 2, reward: '$100' },
      { rank: 3, reward: '$50' },
    ],
  },
  {
    id: 'contest-2',
    title: 'Afrobeat Producer Cup',
    description: 'Best Afrobeat production wins $150 and a producer badge.',
    genre: 'Afrobeat',
    submissionStart: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    submissionEnd: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    votingEnd: new Date(Date.now() + 1 * 24 * 3600 * 1000).toISOString(),
    status: 'voting',
    entryCount: 88,
    prizeTiers: [
      { rank: 1, reward: '$150 + Producer Badge' },
      { rank: 2, reward: '$75' },
    ],
  },
  {
    id: 'contest-3',
    title: 'Gospel Chord Challenge',
    description: 'Ended — NeonKreyol took the crown with a stunning Gospel/Kompa fusion.',
    genre: 'Gospel',
    submissionStart: new Date(Date.now() - 21 * 24 * 3600 * 1000).toISOString(),
    submissionEnd: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
    votingEnd: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    status: 'ended',
    entryCount: 63,
    prizeTiers: [{ rank: 1, reward: '$100 + Gospel King Badge' }],
    winnerId: 'creator-1',
    winnerName: 'NeonKreyol',
  },
];

// ─── Achievement Badges ────────────────────────────────────────────────────────

export const achievementBadges: AchievementBadge[] = [
  {
    id: 'badge-first-track',
    name: 'First Note',
    description: 'Published your very first track.',
    icon: '🎵',
    tier: 'bronze',
    unlockTrigger: 'Publish first track',
    xpReward: 50,
  },
  {
    id: 'badge-1k-plays',
    name: 'Rising Star',
    description: 'Reached 1,000 plays across all tracks.',
    icon: '⭐',
    tier: 'bronze',
    unlockTrigger: '1000 plays milestone',
    xpReward: 100,
  },
  {
    id: 'badge-10k-plays',
    name: 'Crowd Pleaser',
    description: 'Reached 10,000 plays — you\'re getting noticed.',
    icon: '🌟',
    tier: 'silver',
    unlockTrigger: '10000 plays milestone',
    xpReward: 300,
  },
  {
    id: 'badge-100k-plays',
    name: 'Viral Artist',
    description: '100,000 plays — you\'ve gone viral!',
    icon: '🔥',
    tier: 'gold',
    unlockTrigger: '100000 plays milestone',
    xpReward: 1000,
  },
  {
    id: 'badge-first-remix',
    name: 'Remix Rookie',
    description: 'Created your first remix.',
    icon: '🔀',
    tier: 'bronze',
    unlockTrigger: 'First remix created',
    xpReward: 75,
  },
  {
    id: 'badge-10-remixes',
    name: 'Remix King',
    description: 'Created 10 remixes — you love to flip it.',
    icon: '👑',
    tier: 'silver',
    unlockTrigger: '10 remixes created',
    xpReward: 250,
  },
  {
    id: 'badge-first-duet',
    name: 'Duet Debut',
    description: 'Completed your first duet collaboration.',
    icon: '🎤',
    tier: 'bronze',
    unlockTrigger: 'First duet completed',
    xpReward: 75,
  },
  {
    id: 'badge-7-day-streak',
    name: 'Week Warrior',
    description: 'Active 7 days in a row.',
    icon: '🗓️',
    tier: 'silver',
    unlockTrigger: '7-day streak achieved',
    xpReward: 200,
  },
  {
    id: 'badge-30-day-streak',
    name: 'Consistency King',
    description: 'Active 30 days in a row — dedication unmatched.',
    icon: '💎',
    tier: 'gold',
    unlockTrigger: '30-day streak achieved',
    xpReward: 750,
  },
  {
    id: 'badge-first-referral',
    name: 'Scene Builder',
    description: 'Referred your first creator to the platform.',
    icon: '🤝',
    tier: 'bronze',
    unlockTrigger: 'First referral credited',
    xpReward: 100,
  },
  {
    id: 'badge-contest-win',
    name: 'Contest Champion',
    description: 'Won a creator contest.',
    icon: '🏆',
    tier: 'platinum',
    unlockTrigger: 'First contest win',
    xpReward: 1500,
  },
  {
    id: 'badge-challenge-sub',
    name: 'Challenge Accepted',
    description: 'Submitted an entry to a trending challenge.',
    icon: '⚡',
    tier: 'bronze',
    unlockTrigger: 'First challenge submission',
    xpReward: 50,
  },
  {
    id: 'badge-legendary',
    name: 'AIXENTRA Legend',
    description: 'Achieved legendary status across all metrics.',
    icon: '🌈',
    tier: 'legendary',
    unlockTrigger: 'All gold badges unlocked',
    xpReward: 5000,
  },
];

// ─── User Achievements (demo) ─────────────────────────────────────────────────

export const userAchievements: UserAchievement[] = [
  {
    userId: 'creator-1',
    badgeId: 'badge-first-track',
    unlockedAt: new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString(),
  },
  {
    userId: 'creator-1',
    badgeId: 'badge-1k-plays',
    unlockedAt: new Date(Date.now() - 80 * 24 * 3600 * 1000).toISOString(),
  },
  {
    userId: 'creator-1',
    badgeId: 'badge-10k-plays',
    unlockedAt: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
  },
  {
    userId: 'creator-1',
    badgeId: 'badge-100k-plays',
    unlockedAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
  },
  {
    userId: 'creator-1',
    badgeId: 'badge-first-remix',
    unlockedAt: new Date(Date.now() - 70 * 24 * 3600 * 1000).toISOString(),
  },
  {
    userId: 'creator-1',
    badgeId: 'badge-10-remixes',
    unlockedAt: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(),
  },
  {
    userId: 'creator-1',
    badgeId: 'badge-contest-win',
    unlockedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
  },
  {
    userId: 'creator-2',
    badgeId: 'badge-first-track',
    unlockedAt: new Date(Date.now() - 50 * 24 * 3600 * 1000).toISOString(),
  },
  {
    userId: 'creator-2',
    badgeId: 'badge-1k-plays',
    unlockedAt: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString(),
  },
  {
    userId: 'creator-2',
    badgeId: 'badge-first-remix',
    unlockedAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
  },
];

// ─── Creator Rankings ──────────────────────────────────────────────────────────

export const creatorRankings: CreatorRanking[] = [
  {
    rank: 1,
    creatorId: 'creator-1',
    creatorName: 'NeonKreyol',
    avatarUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80',
    plays: 1460000,
    remixes: 73,
    duets: 12,
    contestWins: 1,
    totalXp: 7800,
    badgeCount: 7,
    verified: true,
  },
  {
    rank: 2,
    creatorId: 'creator-2',
    creatorName: 'FutureDrill',
    avatarUrl:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=80',
    plays: 482000,
    remixes: 41,
    duets: 6,
    contestWins: 0,
    totalXp: 2300,
    badgeCount: 3,
    verified: false,
  },
  {
    rank: 3,
    creatorId: 'creator-3',
    creatorName: 'BeatSage',
    avatarUrl:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=240&q=80',
    plays: 215000,
    remixes: 28,
    duets: 4,
    contestWins: 0,
    totalXp: 1400,
    badgeCount: 2,
    verified: false,
  },
  {
    rank: 4,
    creatorId: 'creator-4',
    creatorName: 'KreyolKloud',
    avatarUrl:
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=240&q=80',
    plays: 98000,
    remixes: 15,
    duets: 2,
    contestWins: 0,
    totalXp: 750,
    badgeCount: 1,
    verified: false,
  },
];

// ─── Streaks (demo) ───────────────────────────────────────────────────────────

export const userStreaks: UserStreak[] = [
  {
    userId: 'creator-1',
    currentStreak: 14,
    longestStreak: 31,
    lastActiveDate: new Date().toISOString().slice(0, 10),
    totalActiveDays: 74,
    streakBroken: false,
  },
  {
    userId: 'creator-2',
    currentStreak: 3,
    longestStreak: 9,
    lastActiveDate: new Date().toISOString().slice(0, 10),
    totalActiveDays: 32,
    streakBroken: false,
  },
];

// ─── Daily Trending Snapshot ──────────────────────────────────────────────────

export const dailyTrendingSnapshot: TrendingSnapshot = {
  date: new Date().toISOString().slice(0, 10),
  topTracks: [
    { songId: 'song-1', title: 'Midnight Kompa Signals', creatorName: 'NeonKreyol', score: 96280 },
    { songId: 'song-2', title: 'Chrome Street Psalms', creatorName: 'FutureDrill', score: 48100 },
    { songId: 'song-3', title: 'Pulse of Tomorrow', creatorName: 'NeonKreyol', score: 23540 },
  ],
  topCreators: [
    { creatorId: 'creator-1', name: 'NeonKreyol', followerGain: 420 },
    { creatorId: 'creator-2', name: 'FutureDrill', followerGain: 170 },
    { creatorId: 'creator-3', name: 'BeatSage', followerGain: 82 },
  ],
  topChallenges: [
    { challengeId: 'challenge-1', title: 'Kompa Drop Challenge', newSubmissions: 87 },
    { challengeId: 'challenge-2', title: 'Midnight Verse Challenge', newSubmissions: 43 },
    { challengeId: 'challenge-3', title: 'Afrobeat Fusion Challenge', newSubmissions: 19 },
  ],
};
