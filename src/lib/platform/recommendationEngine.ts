import { creators, CreatorProfile, songs, Song } from './demoData';

export const DEFAULT_RECOMMENDATION_USER_ID = 'listener-demo';

export type RecommendationAlgorithm = 'trending' | 'similar-songs' | 'similar-creators' | 'personalized';

export type ListeningHistoryEntry = {
  userId: string;
  songId: string;
  playedAt: string;
  watchTimeSeconds: number;
  completed?: boolean;
  liked?: boolean;
  shared?: boolean;
  remixed?: boolean;
};

export type ListeningHistoryAnalysis = {
  totalPlays: number;
  averageWatchTimeSeconds: number;
  completionRate: number;
  topGenres: string[];
  topCreators: string[];
  topLanguages: string[];
  recentSongIds: string[];
};

export type TrendBreakdown = {
  plays: number;
  likes: number;
  comments: number;
  shares: number;
  remixes: number;
  watchTime: number;
  recency: number;
};

export type RankedSong = Song & {
  score: number;
  reasons: string[];
  algorithm: RecommendationAlgorithm;
};

export type RankedCreator = CreatorProfile & {
  score: number;
  relatedGenres: string[];
  algorithm: RecommendationAlgorithm;
};

export type RecommendationFeed = {
  userId: string;
  songs: RankedSong[];
  historyAnalysis: ListeningHistoryAnalysis;
  placeholders: {
    collaborativeFiltering: {
      status: 'placeholder';
      message: string;
      readyFor: string[];
    };
    userTasteEmbeddings: {
      status: 'placeholder';
      dimensions: number;
      seedSignals: string[];
    };
  };
};

const SCORE_WEIGHTS = {
  likes: 3,
  comments: 4,
  shares: 5,
  remixes: 6,
  watchTime: 0.75,
};

const MS_PER_HOUR = 1000 * 60 * 60;
const CACHE_TTL_MS = 30_000;

const recommendationCache = new Map<string, { expiresAt: number; value: unknown }>();

const listeningHistoryStore = new Map<string, ListeningHistoryEntry[]>([
  [
    DEFAULT_RECOMMENDATION_USER_ID,
    [
      {
        userId: DEFAULT_RECOMMENDATION_USER_ID,
        songId: 'song-1',
        playedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        watchTimeSeconds: 214,
        completed: true,
        liked: true,
        shared: true,
      },
      {
        userId: DEFAULT_RECOMMENDATION_USER_ID,
        songId: 'song-3',
        playedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        watchTimeSeconds: 171,
        completed: true,
        liked: true,
      },
      {
        userId: DEFAULT_RECOMMENDATION_USER_ID,
        songId: 'song-2',
        playedAt: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
        watchTimeSeconds: 92,
        completed: false,
      },
    ],
  ],
]);

const withCache = <T>(key: string, producer: () => T): T => {
  const cached = recommendationCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value as T;
  }

  const value = producer();
  recommendationCache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, value });
  return value;
};

const uniqueTopValues = (values: string[], limit = 3) =>
  Array.from(new Set(values.filter(Boolean))).slice(0, limit);

const getSongCatalog = (catalogSongs: Song[] = songs) => catalogSongs.filter((song) => song.isPublic !== false);

const getHoursSinceRelease = (createdAt?: string) => {
  if (!createdAt) return 72;
  return Math.max(0, (Date.now() - new Date(createdAt).getTime()) / MS_PER_HOUR);
};

export const getRecencyBoost = (createdAt?: string) => Math.max(0, 72 - getHoursSinceRelease(createdAt)) * 1.5;

export const calculateTrendingScore = (song: Song) => {
  const breakdown: TrendBreakdown = {
    plays: song.plays,
    likes: song.likes * SCORE_WEIGHTS.likes,
    comments: song.comments * SCORE_WEIGHTS.comments,
    shares: (song.shares ?? 0) * SCORE_WEIGHTS.shares,
    remixes: song.remixes * SCORE_WEIGHTS.remixes,
    watchTime: (song.averageWatchTimeSeconds ?? 0) * SCORE_WEIGHTS.watchTime,
    recency: getRecencyBoost(song.createdAt),
  };

  return {
    score: Object.values(breakdown).reduce((total, value) => total + value, 0),
    breakdown,
  };
};

export const recordListeningHistory = (entry: Omit<ListeningHistoryEntry, 'playedAt'> & { playedAt?: string }) => {
  const normalizedEntry: ListeningHistoryEntry = {
    ...entry,
    playedAt: entry.playedAt ?? new Date().toISOString(),
  };
  const history = listeningHistoryStore.get(normalizedEntry.userId) ?? [];
  listeningHistoryStore.set(normalizedEntry.userId, [normalizedEntry, ...history].slice(0, 100));
  recommendationCache.clear();
  return normalizedEntry;
};

export const getListeningHistory = (userId: string) => listeningHistoryStore.get(userId) ?? [];

export const analyzeListeningHistory = (userId: string, catalogSongs: Song[] = songs): ListeningHistoryAnalysis => {
  const history = getListeningHistory(userId);
  const songLookup = new Map(getSongCatalog(catalogSongs).map((song) => [song.id, song]));
  const matchedSongs = history.map((entry) => songLookup.get(entry.songId)).filter((song): song is Song => Boolean(song));
  const completedCount = history.filter((entry) => entry.completed).length;
  const averageWatchTimeSeconds =
    history.length === 0 ? 0 : history.reduce((total, entry) => total + entry.watchTimeSeconds, 0) / history.length;

  return {
    totalPlays: history.length,
    averageWatchTimeSeconds,
    completionRate: history.length === 0 ? 0 : completedCount / history.length,
    topGenres: uniqueTopValues(matchedSongs.map((song) => song.genre)),
    topCreators: uniqueTopValues(matchedSongs.map((song) => song.creatorName)),
    topLanguages: uniqueTopValues(matchedSongs.map((song) => song.language)),
    recentSongIds: uniqueTopValues(history.map((entry) => entry.songId), 5),
  };
};

const createPersonalizationReasons = (song: Song, analysis: ListeningHistoryAnalysis) => {
  const reasons: string[] = [];

  if (analysis.topGenres.includes(song.genre)) {
    reasons.push(`Matches your top genre: ${song.genre}`);
  }

  if (analysis.topCreators.includes(song.creatorName)) {
    reasons.push(`You keep coming back to ${song.creatorName}`);
  }

  if (analysis.topLanguages.includes(song.language)) {
    reasons.push(`Aligned with your preferred language: ${song.language}`);
  }

  if (!analysis.recentSongIds.includes(song.id) && reasons.length === 0) {
    reasons.push('Fresh pick based on current discovery trends');
  }

  return reasons;
};

const calculatePersonalizedScore = (song: Song, analysis: ListeningHistoryAnalysis) => {
  const { score: trendingScore } = calculateTrendingScore(song);
  let personalizedScore = trendingScore;

  if (analysis.topGenres.includes(song.genre)) personalizedScore += 220;
  if (analysis.topCreators.includes(song.creatorName)) personalizedScore += 180;
  if (analysis.topLanguages.includes(song.language)) personalizedScore += 120;
  if (!analysis.recentSongIds.includes(song.id)) personalizedScore += 60;
  personalizedScore += analysis.averageWatchTimeSeconds * 0.5;

  return personalizedScore;
};

const getCreatorGenres = (creatorId: string, catalogSongs: Song[] = songs) =>
  uniqueTopValues(
    getSongCatalog(catalogSongs)
      .filter((song) => song.creatorId === creatorId)
      .map((song) => song.genre),
    5,
  );

export const getTrendingSongs = (options?: { limit?: number; catalogSongs?: Song[] }) => {
  const limit = options?.limit ?? 10;
  const catalogSongs = getSongCatalog(options?.catalogSongs);
  return withCache(`trending:${limit}:${catalogSongs.length}`, () =>
    [...catalogSongs]
      .map((song) => ({
        ...song,
        score: calculateTrendingScore(song).score,
        reasons: ['High engagement across plays, likes, shares, remixes, watch time, and recency'],
        algorithm: 'trending' as const,
      }))
      .sort((left, right) => right.score - left.score)
      .slice(0, limit),
  );
};

export const getSimilarSongs = (songId: string, options?: { limit?: number; catalogSongs?: Song[] }) => {
  const limit = options?.limit ?? 6;
  const catalogSongs = getSongCatalog(options?.catalogSongs);
  const seedSong = catalogSongs.find((song) => song.id === songId);
  if (!seedSong) return [];

  return withCache(`similar-song:${songId}:${limit}:${catalogSongs.length}`, () =>
    catalogSongs
      .filter((song) => song.id !== songId)
      .map((song) => {
        let score = 0;
        const reasons: string[] = [];

        if (song.genre === seedSong.genre) {
          score += 260;
          reasons.push(`Shared genre: ${song.genre}`);
        }
        if (song.mood === seedSong.mood) {
          score += 180;
          reasons.push(`Shared mood: ${song.mood}`);
        }
        if (song.language === seedSong.language) {
          score += 120;
          reasons.push(`Shared language: ${song.language}`);
        }

        score += Math.max(0, 80 - Math.abs(song.bpm - seedSong.bpm));
        score += song.creatorId === seedSong.creatorId ? 60 : 0;
        score += calculateTrendingScore(song).score * 0.01;

        return {
          ...song,
          score,
          reasons: reasons.length > 0 ? reasons : ['Trending alongside the seed track'],
          algorithm: 'similar-songs' as const,
        };
      })
      .sort((left, right) => right.score - left.score)
      .slice(0, limit),
  );
};

export const getSimilarCreators = (creatorId: string, options?: { limit?: number; catalogSongs?: Song[]; catalogCreators?: CreatorProfile[] }) => {
  const limit = options?.limit ?? 4;
  const catalogSongs = getSongCatalog(options?.catalogSongs);
  const catalogCreators = options?.catalogCreators ?? creators;
  const seedCreator = catalogCreators.find((creator) => creator.id === creatorId);
  if (!seedCreator) return [];

  const seedGenres = getCreatorGenres(creatorId, catalogSongs);

  return withCache(`similar-creator:${creatorId}:${limit}:${catalogCreators.length}`, () =>
    catalogCreators
      .filter((creator) => creator.id !== creatorId)
      .map((creator) => {
        const creatorGenres = getCreatorGenres(creator.id, catalogSongs);
        const relatedGenres = creatorGenres.filter((genre) => seedGenres.includes(genre));
        const followerDelta = Math.abs(seedCreator.followers - creator.followers);
        const listenerDelta = Math.abs(seedCreator.monthlyListeners - creator.monthlyListeners);
        const score =
          relatedGenres.length * 260 +
          Math.max(0, 150 - followerDelta / 100) +
          Math.max(0, 150 - listenerDelta / 250);

        return {
          ...creator,
          score,
          relatedGenres,
          algorithm: 'similar-creators' as const,
        };
      })
      .sort((left, right) => right.score - left.score)
      .slice(0, limit),
  );
};

export const getPersonalizedFeed = (options?: {
  userId?: string;
  limit?: number;
  catalogSongs?: Song[];
  catalogCreators?: CreatorProfile[];
}) => {
  const userId = options?.userId ?? DEFAULT_RECOMMENDATION_USER_ID;
  const limit = options?.limit ?? 8;
  const catalogSongs = getSongCatalog(options?.catalogSongs);
  const analysis = analyzeListeningHistory(userId, catalogSongs);

  return withCache(`personalized:${userId}:${limit}:${catalogSongs.length}`, () => ({
    userId,
    songs: [...catalogSongs]
      .map((song) => ({
        ...song,
        score: calculatePersonalizedScore(song, analysis),
        reasons: createPersonalizationReasons(song, analysis),
        algorithm: 'personalized' as const,
      }))
      .sort((left, right) => right.score - left.score)
      .slice(0, limit),
    historyAnalysis: analysis,
    placeholders: {
      collaborativeFiltering: {
        status: 'placeholder' as const,
        message: 'Collaborative filtering candidate generation is reserved for future ML signals and user-user affinity.',
        readyFor: ['implicit feedback matrix', 'nearest-neighbor retrieval', 'batch offline ranking'],
      },
      userTasteEmbeddings: {
        status: 'placeholder' as const,
        dimensions: 8,
        seedSignals: ['genre affinity', 'creator affinity', 'language affinity', 'watch-time retention'],
      },
    },
  }));
};

export const recommendationAlgorithms = {
  trending: getTrendingSongs,
  similarSongs: getSimilarSongs,
  similarCreators: getSimilarCreators,
  personalized: getPersonalizedFeed,
};
