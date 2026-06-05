import { describe, expect, it } from 'vitest';
import { createVoiceModel, filterVoiceModels, getTrendingVoices, reviewVoiceModel } from './voiceMarketplace';

describe('voiceMarketplace', () => {
  it('filters voices by query and category', () => {
    const results = filterVoiceModels('kompa', 'Kompa', false);
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((voice) => voice.category === 'Kompa')).toBe(true);
  });

  it('returns trending voices ordered by score', () => {
    const trending = getTrendingVoices(2);
    expect(trending.length).toBe(2);
    expect(trending[0].trendingScore).toBeGreaterThanOrEqual(trending[1].trendingScore);
  });

  it('requires consent verification before upload', () => {
    const result = createVoiceModel({
      creatorId: 'creator-1',
      title: 'No Consent Upload',
      description: '',
      category: 'Pop',
      tags: [],
      licenseType: 'standard',
      priceUsd: 10,
      commercialUseEnabled: true,
      royaltyPercent: 10,
      consentVerified: false,
      consentProofUrl: '',
    });
    expect('error' in result).toBe(true);
  });

  it('creates pending voice model and updates moderation state after review', () => {
    const createResult = createVoiceModel({
      creatorId: 'creator-1',
      title: 'Approval Test Voice',
      description: 'Test voice',
      category: 'EDM',
      tags: ['test'],
      licenseType: 'subscription',
      priceUsd: 19,
      commercialUseEnabled: false,
      royaltyPercent: 8,
      consentVerified: true,
      consentProofUrl: 'https://example.com/proof',
    });
    expect('model' in createResult).toBe(true);
    if (!('model' in createResult) || !createResult.model) return;

    const reviewed = reviewVoiceModel(createResult.model.id, 'approve');
    expect(reviewed?.moderationStatus).toBe('APPROVED');
    expect(reviewed?.impersonationDetectionStatus).toBe('PLACEHOLDER_CLEARED');
  });
});
