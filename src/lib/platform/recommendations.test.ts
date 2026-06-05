import { describe, expect, it } from 'vitest';
import { songs } from './demoData';
import { rankSongs, recommendationScore } from './recommendations';
import { validateRoyaltySplitTotal } from './platformStore';
import {
  DEFAULT_RECOMMENDATION_USER_ID,
  analyzeListeningHistory,
  calculateTrendingScore,
  getPersonalizedFeed,
  getSimilarCreators,
  getSimilarSongs,
  recordListeningHistory,
} from './recommendationEngine';

describe('recommendations', () => {
  it('calculates weighted recommendation score', () => {
    const song = songs[0];
    const score = recommendationScore(song);
    expect(score).toBeGreaterThan(song.plays + song.likes);
  });

  it('ranks songs in descending score order', () => {
    const ranked = rankSongs(songs);
    expect(recommendationScore(ranked[0])).toBeGreaterThanOrEqual(recommendationScore(ranked[1]));
  });

  it('includes shares and watch time in trending calculations', () => {
    const baseSong = songs[1];
    const boosted = {
      ...baseSong,
      shares: (baseSong.shares ?? 0) + 100,
      averageWatchTimeSeconds: (baseSong.averageWatchTimeSeconds ?? 0) + 90,
    };

    expect(calculateTrendingScore(boosted).score).toBeGreaterThan(calculateTrendingScore(baseSong).score);
  });

  it('builds a personalized feed with ml placeholders', () => {
    const feed = getPersonalizedFeed({ userId: DEFAULT_RECOMMENDATION_USER_ID, limit: 2 });

    expect(feed.songs).toHaveLength(2);
    expect(feed.songs[0].reasons.length).toBeGreaterThan(0);
    expect(feed.placeholders.collaborativeFiltering.status).toBe('placeholder');
    expect(feed.placeholders.userTasteEmbeddings.status).toBe('placeholder');
  });

  it('returns similar songs and creators for seed content', () => {
    expect(getSimilarSongs('song-1', { limit: 2 })).toHaveLength(2);
    expect(getSimilarCreators('creator-1', { limit: 1 })[0]?.id).toBe('creator-2');
  });

  it('tracks listening history updates in analysis', () => {
    recordListeningHistory({
      userId: 'listener-test',
      songId: 'song-1',
      watchTimeSeconds: 120,
      completed: true,
      liked: true,
    });

    const analysis = analyzeListeningHistory('listener-test');
    expect(analysis.totalPlays).toBe(1);
    expect(analysis.topGenres).toContain('Kompa');
    expect(analysis.completionRate).toBe(1);
  });
});

describe('royalty splits', () => {
  it('requires totals to equal exactly 100', () => {
    expect(validateRoyaltySplitTotal([60, 40])).toBe(true);
    expect(validateRoyaltySplitTotal([60, 39.9])).toBe(false);
  });
});
