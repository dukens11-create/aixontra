import { describe, expect, it } from 'vitest';
import { songs } from './demoData';
import { rankSongs, recommendationScore } from './recommendations';
import { validateRoyaltySplitTotal } from './platformStore';

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
});

describe('royalty splits', () => {
  it('requires totals to equal exactly 100', () => {
    expect(validateRoyaltySplitTotal([60, 40])).toBe(true);
    expect(validateRoyaltySplitTotal([60, 39.9])).toBe(false);
  });
});
