import { DEMO_AUDIO_URL, creators } from './demoData';

export const VOICE_MODELS_TABLE_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS voice_models (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL,
  creator_name TEXT NOT NULL,
  creator_avatar_url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT NOT NULL,
  preview_audio_url TEXT NOT NULL,
  waveform_points TEXT NOT NULL,
  license_type TEXT NOT NULL,
  price_usd NUMERIC NOT NULL CHECK (price_usd >= 0),
  commercial_use_enabled BOOLEAN NOT NULL DEFAULT false,
  royalty_percent NUMERIC NOT NULL CHECK (royalty_percent >= 0 AND royalty_percent <= 100),
  moderation_status TEXT NOT NULL DEFAULT 'PENDING',
  consent_verified BOOLEAN NOT NULL DEFAULT false,
  consent_proof_url TEXT NOT NULL,
  impersonation_detection_status TEXT NOT NULL DEFAULT 'PLACEHOLDER_PENDING',
  admin_note TEXT NOT NULL DEFAULT '',
  settlement_status TEXT NOT NULL DEFAULT 'PENDING_IMPLEMENTATION',
  created_at TEXT NOT NULL
);`.trim();

export type VoiceLicenseType = 'standard' | 'exclusive' | 'subscription';
export type VoiceModerationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ImpersonationDetectionStatus = 'PLACEHOLDER_PENDING' | 'PLACEHOLDER_FLAGGED' | 'PLACEHOLDER_CLEARED';

export type VoiceCreator = {
  id: string;
  stageName: string;
  avatarUrl: string;
  bio: string;
  payoutWalletHint: string;
  totalRoyaltyEarningsUsd: number;
};

export type VoiceModel = {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  previewAudioUrl: string;
  waveformPoints: number[];
  licenseType: VoiceLicenseType;
  priceUsd: number;
  commercialUseEnabled: boolean;
  royaltyPercent: number;
  moderationStatus: VoiceModerationStatus;
  consentVerified: boolean;
  consentProofUrl: string;
  impersonationDetectionStatus: ImpersonationDetectionStatus;
  adminNote: string;
  settlementStatus: 'PENDING_IMPLEMENTATION' | 'QUEUED' | 'SETTLED';
  trendingScore: number;
  plays: number;
  createdAt: string;
  creator: VoiceCreator;
};

export type VoiceUploadInput = {
  creatorId: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  previewAudioUrl?: string;
  licenseType: VoiceLicenseType;
  priceUsd: number;
  commercialUseEnabled: boolean;
  royaltyPercent: number;
  consentVerified: boolean;
  consentProofUrl: string;
};

const voiceCreators: VoiceCreator[] = creators.map((creator, index) => ({
  id: creator.id,
  stageName: creator.stageName,
  avatarUrl: creator.avatarUrl,
  bio: creator.bio,
  payoutWalletHint: `wallet_${creator.id}`,
  totalRoyaltyEarningsUsd: index === 0 ? 1280.5 : 542.75,
}));

const fallbackCreator: VoiceCreator = {
  id: 'voice-creator-demo',
  stageName: 'AIXENTRA Voice Lab',
  avatarUrl: creators[0]?.avatarUrl ?? '',
  bio: 'AI voice design collective.',
  payoutWalletHint: 'wallet_aixentra_demo',
  totalRoyaltyEarningsUsd: 0,
};

const getWaveformPoints = (seed: string) =>
  Array.from({ length: 40 }, (_, index) => {
    const normalizedSeed = seed.length > 0 ? seed : 'voice';
    const base = 22 + ((normalizedSeed.charCodeAt(index % normalizedSeed.length) + index * 3) % 38);
    return Math.max(8, Math.min(88, base));
  });

const generateCreatedAt = () => new Date().toISOString();
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const voiceModels: VoiceModel[] = [
  {
    id: 'voice-model-1',
    title: 'Neon Kompa Lead',
    description: 'Warm Creole lead with polished top-end for hooks and toplines.',
    category: 'Kompa',
    tags: ['kompa', 'warm', 'hook'],
    previewAudioUrl: DEMO_AUDIO_URL,
    waveformPoints: getWaveformPoints('neon-kompa'),
    licenseType: 'standard',
    priceUsd: 39,
    commercialUseEnabled: true,
    royaltyPercent: 12,
    moderationStatus: 'APPROVED',
    consentVerified: true,
    consentProofUrl: 'https://example.com/consent/neon-kompa',
    impersonationDetectionStatus: 'PLACEHOLDER_CLEARED',
    adminNote: 'Approved for marketplace listing.',
    settlementStatus: 'PENDING_IMPLEMENTATION',
    trendingScore: 96,
    plays: 12340,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    creator: voiceCreators[0] ?? fallbackCreator,
  },
  {
    id: 'voice-model-2',
    title: 'Future Drill Texture',
    description: 'Gritty modern rap texture optimized for dark drill choruses.',
    category: 'Drill',
    tags: ['drill', 'texture', 'gritty'],
    previewAudioUrl: DEMO_AUDIO_URL,
    waveformPoints: getWaveformPoints('future-drill'),
    licenseType: 'exclusive',
    priceUsd: 129,
    commercialUseEnabled: true,
    royaltyPercent: 18,
    moderationStatus: 'PENDING',
    consentVerified: true,
    consentProofUrl: 'https://example.com/consent/future-drill',
    impersonationDetectionStatus: 'PLACEHOLDER_PENDING',
    adminNote: 'Awaiting admin review.',
    settlementStatus: 'PENDING_IMPLEMENTATION',
    trendingScore: 83,
    plays: 7920,
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    creator: voiceCreators[1] ?? fallbackCreator,
  },
];

export const getVoiceModels = () => [...voiceModels];

export const getVoiceModelById = (id: string) => voiceModels.find((voice) => voice.id === id) ?? null;

export const getVoiceCreatorById = (id: string) => voiceCreators.find((creator) => creator.id === id) ?? null;

export const getVoiceCategories = () => Array.from(new Set(voiceModels.map((voice) => voice.category))).sort();

export const getTrendingVoices = (limit = 3) =>
  [...voiceModels]
    .sort((a, b) => {
      const trendingDelta = b.trendingScore - a.trendingScore;
      return trendingDelta !== 0 ? trendingDelta : b.plays - a.plays;
    })
    .slice(0, Math.max(0, Number.isFinite(limit) ? limit : 3));

export const filterVoiceModels = (query: string, category: string, trendingOnly: boolean) => {
  const normalizedQuery = query.trim().toLowerCase();
  return voiceModels.filter((voice) => {
    const matchesQuery = !normalizedQuery
      || voice.title.toLowerCase().includes(normalizedQuery)
      || voice.creator.stageName.toLowerCase().includes(normalizedQuery)
      || voice.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));
    const matchesCategory = !category || category === 'all' || voice.category === category;
    const matchesTrending = !trendingOnly || voice.trendingScore >= 80;
    return matchesQuery && matchesCategory && matchesTrending;
  });
};

export const createVoiceModel = (input: VoiceUploadInput) => {
  const trimmedTitle = input.title.trim();
  const trimmedCategory = input.category.trim();
  if (!input.consentVerified || !input.consentProofUrl.trim()) {
    return { error: 'Consent verification and proof URL are required.' } as const;
  }
  if (!trimmedTitle || !trimmedCategory) {
    return { error: 'Voice title and category are required.' } as const;
  }
  const creator = getVoiceCreatorById(input.creatorId) ?? fallbackCreator;
  const created: VoiceModel = {
    id: `voice-model-${Date.now()}`,
    title: trimmedTitle,
    description: input.description.trim() || 'Voice model listing',
    category: trimmedCategory,
    tags: input.tags.filter(Boolean),
    previewAudioUrl: input.previewAudioUrl?.trim() || DEMO_AUDIO_URL,
    waveformPoints: getWaveformPoints(`${input.title}-${input.creatorId}`),
    licenseType: input.licenseType,
    priceUsd: Math.max(0, Number(input.priceUsd) || 0),
    commercialUseEnabled: Boolean(input.commercialUseEnabled),
    royaltyPercent: clamp(Number(input.royaltyPercent) || 0, 0, 100),
    moderationStatus: 'PENDING',
    consentVerified: true,
    consentProofUrl: input.consentProofUrl.trim(),
    impersonationDetectionStatus: 'PLACEHOLDER_PENDING',
    adminNote: 'Pending manual moderation.',
    settlementStatus: 'PENDING_IMPLEMENTATION',
    trendingScore: 25,
    plays: 0,
    createdAt: generateCreatedAt(),
    creator,
  };
  voiceModels.unshift(created);
  return { model: created } as const;
};

export const getVoiceApprovalQueue = () => voiceModels.filter((voice) => voice.moderationStatus === 'PENDING');

export const reviewVoiceModel = (voiceId: string, action: 'approve' | 'reject') => {
  const voice = getVoiceModelById(voiceId);
  if (!voice) return null;
  voice.moderationStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
  voice.adminNote = action === 'approve' ? 'Approved by admin queue placeholder.' : 'Rejected by admin queue placeholder.';
  voice.impersonationDetectionStatus = action === 'approve' ? 'PLACEHOLDER_CLEARED' : 'PLACEHOLDER_FLAGGED';
  return voice;
};

export const estimateRoyaltySettlement = (voice: VoiceModel, saleAmountUsd: number) => ({
  settlementStatus: 'PENDING_IMPLEMENTATION' as const,
  grossSaleUsd: Number(saleAmountUsd.toFixed(2)),
  creatorRoyaltyUsd: Number(((saleAmountUsd * voice.royaltyPercent) / 100).toFixed(2)),
  platformNetUsd: Number((saleAmountUsd - (saleAmountUsd * voice.royaltyPercent) / 100).toFixed(2)),
  note: 'Settlement integration TODO: connect Stripe Connect payouts and ledger job queue.',
});
