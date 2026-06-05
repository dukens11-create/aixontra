import { marketplaceItems, songs } from './demoData';
import { GenerationStatus } from './generationProvider';
import { getPlanCapabilities, SubscriptionPlan } from './subscriptions';

export const PLATFORM_FEE_RATE = 0.1;
const MARKETPLACE_TYPES = ['beats', 'ai_song', 'vocal_pack', 'voice_model', 'exclusive_license', 'commercial_license'] as const;
type MarketplaceType = (typeof MARKETPLACE_TYPES)[number];

type GeneratedSongDraft = {
  id: string;
  prompt: string;
  lyrics?: string;
  genre?: string;
  mood?: string;
  language?: string;
  bpm?: number;
  vocalStyle?: string;
  instrumentalOnly?: boolean;
  audioUrl: string;
  wavUrl?: string;
  stemsUrls?: Partial<Record<'vocals' | 'drums' | 'bass' | 'melody' | 'instrumental' | 'fullMix', string>>;
  coverUrl?: string;
  videoUrl?: string;
  masteredAudioUrl?: string;
  generationStatus: GenerationStatus;
  status: 'draft' | 'published';
  moderationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'TAKEN_DOWN';
  originalSongId?: string;
  createdAt: string;
};

type UserEntitlement = {
  userId: string;
  plan: SubscriptionPlan;
  creditBalance: number;
  monthlyFreeCredits: number;
  lastGrantMonth: string;
};

type CreditTransaction = {
  id: string;
  userId: string;
  type: 'MONTHLY_FREE_CREDIT' | 'GENERATION_DEBIT' | 'CREDIT_PURCHASE' | 'ADMIN_ADJUSTMENT';
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
};

type CreditPack = { id: string; name: string; credits: number; priceUsd: number };
type GenerationCostLedgerEntry = {
  id: string;
  userId: string;
  provider: string;
  amountUsd: number;
  promptPreview: string;
  createdAt: string;
};

type VerificationRequest = {
  id: string;
  userId: string;
  legalName: string;
  stageName: string;
  idUploadPlaceholder: string;
  links: string[];
  reason: string;
  status: 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
};

type VoiceModel = {
  id: string;
  userId: string;
  name: string;
  consentConfirmed: boolean;
  proofUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  isPublic: boolean;
  createdAt: string;
};

const generatedDrafts: GeneratedSongDraft[] = [];
const notifications: Array<{ id: string; title: string; message: string; type: string; createdAt: string }> = [];
const playlists: Array<{ id: string; name: string; songIds: string[] }> = [];
const comments: Array<{ id: string; songId: string; text: string }> = [];
const creditTransactions: CreditTransaction[] = [];
const verificationRequests: VerificationRequest[] = [];
const voiceModels: VoiceModel[] = [];
const reports: Array<{ id: string; songId: string; reason: string; createdAt: string }> = [];
const dmcaClaims: Array<{ id: string; songId: string; claimant: string; createdAt: string }> = [];
const generationCostLedger: GenerationCostLedgerEntry[] = [];
const users = new Map<string, UserEntitlement>();

const getCurrentMonthKey = () => new Date().toISOString().slice(0, 7);

const creditPacks: CreditPack[] = [
  { id: 'pack-creator', name: 'Creator Boost', credits: 100, priceUsd: 9.99 },
  { id: 'pack-pro', name: 'Pro Burst', credits: 500, priceUsd: 39.99 },
  { id: 'pack-studio', name: 'Studio Vault', credits: 1500, priceUsd: 99.99 },
];

const ensureUser = (userId = 'demo-user') => {
  const existing = users.get(userId);
  if (existing) return existing;
  const created: UserEntitlement = {
    userId,
    plan: 'FREE',
    creditBalance: getPlanCapabilities('FREE').monthlyCredits,
    monthlyFreeCredits: getPlanCapabilities('FREE').monthlyCredits,
    lastGrantMonth: getCurrentMonthKey(),
  };
  users.set(userId, created);
  return created;
};

const grantMonthlyCreditsIfNeeded = (account: UserEntitlement) => {
  const currentMonth = getCurrentMonthKey();
  if (account.lastGrantMonth === currentMonth) return account;
  const planCapabilities = getPlanCapabilities(account.plan);
  account.monthlyFreeCredits = planCapabilities.monthlyCredits;
  account.creditBalance += planCapabilities.monthlyCredits;
  account.lastGrantMonth = currentMonth;
  creditTransactions.unshift({
    id: `txn-${Date.now()}`,
    userId: account.userId,
    type: 'MONTHLY_FREE_CREDIT',
    amount: planCapabilities.monthlyCredits,
    balanceAfter: account.creditBalance,
    description: `${account.plan} monthly free credit refresh`,
    createdAt: new Date().toISOString(),
  });
  return account;
};

export const getUserGenerationContext = (userId = 'demo-user') => {
  const account = grantMonthlyCreditsIfNeeded(ensureUser(userId));
  const capabilities = getPlanCapabilities(account.plan);
  return {
    userId: account.userId,
    plan: account.plan,
    creditBalance: account.creditBalance,
    capabilities,
    generationCost: 1,
  };
};

export const reserveGenerationCredits = (userId = 'demo-user', cost = 1) => {
  const account = grantMonthlyCreditsIfNeeded(ensureUser(userId));
  if (account.creditBalance < cost) {
    return { ok: false as const, message: 'Insufficient credits. Purchase a pack or upgrade your plan.' };
  }
  account.creditBalance -= cost;
  creditTransactions.unshift({
    id: `txn-${Date.now()}`,
    userId,
    type: 'GENERATION_DEBIT',
    amount: -cost,
    balanceAfter: account.creditBalance,
    description: 'AI generation debit',
    createdAt: new Date().toISOString(),
  });
  return { ok: true as const, balance: account.creditBalance };
};

export const getSongById = (id: string) => songs.find((song) => song.id === id) ?? generatedDrafts.find((song) => song.id === id);

export const createGeneratedDraft = (draft: Omit<GeneratedSongDraft, 'id' | 'createdAt' | 'status' | 'moderationStatus'>) => {
  const record: GeneratedSongDraft = {
    ...draft,
    id: `draft-${Date.now()}`,
    status: 'draft',
    moderationStatus: 'PENDING',
    createdAt: new Date().toISOString(),
  };
  generatedDrafts.unshift(record);
  return record;
};

export const publishGeneratedSong = (id: string) => {
  const song = generatedDrafts.find((draft) => draft.id === id);
  if (!song) return null;
  song.status = 'published';
  song.moderationStatus = 'APPROVED';
  return song;
};

export const saveComment = (songId: string, text: string) => {
  const comment = { id: `comment-${Date.now()}`, songId, text };
  comments.push(comment);
  return comment;
};

export const followCreator = (creatorId: string) => ({ creatorId, followedAt: new Date().toISOString() });

export const createPlaylist = (name: string) => {
  const playlist = { id: `playlist-${Date.now()}`, name, songIds: [] };
  playlists.push(playlist);
  return playlist;
};

export const addSongToPlaylist = (playlistId: string, songId: string) => {
  const playlist = playlists.find((entry) => entry.id === playlistId);
  if (!playlist) return null;
  if (!playlist.songIds.includes(songId)) playlist.songIds.push(songId);
  return playlist;
};

export const createMarketplaceItem = (input: { title: string; type: string; price: number; licenseType: string; previewAudioUrl?: string; description?: string; seller?: string; cover?: string }) => {
  const safeType: MarketplaceType = MARKETPLACE_TYPES.includes(input.type as MarketplaceType)
    ? (input.type as MarketplaceType)
    : 'beats';
  const item = {
    id: `item-${Date.now()}`,
    title: input.title,
    type: safeType,
    price: input.price,
    licenseType: input.licenseType,
    previewAudioUrl: input.previewAudioUrl ?? songs[0].audioUrl,
    description: input.description ?? 'Placeholder listing',
    seller: input.seller ?? 'AIXENTRA Creator',
    cover: input.cover ?? songs[0].coverUrl,
  };
  marketplaceItems.unshift(item);
  return item;
};

export const createPurchase = (marketplaceItemId: string, amount: number) => ({
  id: `purchase-${Date.now()}`,
  marketplaceItemId,
  amount,
  platformFee: Number((amount * PLATFORM_FEE_RATE).toFixed(2)),
  payoutStatus: 'pending_stripe_connect_link',
  stripePaymentIntentId: `pi_placeholder_${Date.now()}`,
});

/**
 * Floating-point operations can introduce tiny rounding errors.
 * We use a narrow epsilon to treat totals like 99.999999 as valid 100%.
 */
export const validateRoyaltySplitTotal = (splits: number[]) => {
  const total = splits.reduce((sum, value) => sum + value, 0);
  return Math.abs(total - 100) < 0.01;
};

export const createCollabRoom = (title: string, splits: number[] = [100]) => ({
  id: `room-${Date.now()}`,
  title,
  status: 'draft',
  royaltySplitValid: validateRoyaltySplitTotal(splits),
});

export const pushNotification = (title: string, message: string, type: string) => {
  const item = { id: `notif-${Date.now()}`, title, message, type, createdAt: new Date().toISOString() };
  notifications.unshift(item);
  return item;
};

export const getCreditPacks = () => creditPacks;

export const purchaseCreditPack = (userId: string, packId: string) => {
  const account = ensureUser(userId);
  const pack = creditPacks.find((entry) => entry.id === packId);
  if (!pack) return null;
  account.creditBalance += pack.credits;
  creditTransactions.unshift({
    id: `txn-${Date.now()}`,
    userId,
    type: 'CREDIT_PURCHASE',
    amount: pack.credits,
    balanceAfter: account.creditBalance,
    description: `Purchased ${pack.name}`,
    createdAt: new Date().toISOString(),
  });
  return { pack, balance: account.creditBalance };
};

export const submitVerificationRequest = (input: Omit<VerificationRequest, 'id' | 'status' | 'createdAt'>) => {
  const request: VerificationRequest = {
    id: `verify-${Date.now()}`,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    ...input,
  };
  verificationRequests.unshift(request);
  return request;
};

export const submitVoiceModel = (input: { userId: string; name: string; consentConfirmed: boolean; proofUrl: string }) => {
  if (!input.consentConfirmed || !input.proofUrl.trim()) return null;
  const model: VoiceModel = {
    id: `voice-${Date.now()}`,
    userId: input.userId,
    name: input.name,
    consentConfirmed: true,
    proofUrl: input.proofUrl,
    status: 'PENDING',
    isPublic: false,
    createdAt: new Date().toISOString(),
  };
  voiceModels.unshift(model);
  return model;
};

export const reportSong = (songId: string, reason: string) => {
  const report = { id: `report-${Date.now()}`, songId, reason, createdAt: new Date().toISOString() };
  reports.unshift(report);
  return report;
};

export const fileDmcaClaim = (songId: string, claimant: string) => {
  const claim = { id: `dmca-${Date.now()}`, songId, claimant, createdAt: new Date().toISOString() };
  dmcaClaims.unshift(claim);
  return claim;
};

export const getGeneratedDrafts = () => generatedDrafts;
export const getNotifications = () => notifications;
export const getCreditTransactions = () => creditTransactions;
export const getGenerationCostLedger = () => generationCostLedger;
export const getVerificationRequests = () => verificationRequests;
export const getVoiceModels = () => voiceModels;
export const getReports = () => reports;
export const getDmcaClaims = () => dmcaClaims;

export const recordGenerationCost = (entry: Omit<GenerationCostLedgerEntry, 'id' | 'createdAt'>) => {
  const costEntry: GenerationCostLedgerEntry = {
    id: `cost-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...entry,
  };
  generationCostLedger.unshift(costEntry);
  return costEntry;
};
