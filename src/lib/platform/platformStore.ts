import { songs, marketplaceItems } from '@/lib/platform/demoData';
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
  status: 'draft' | 'published';
  originalSongId?: string;
  createdAt: string;
};

const generatedDrafts: GeneratedSongDraft[] = [];
const notifications: Array<{ id: string; title: string; message: string; type: string; createdAt: string }> = [];
const playlists: Array<{ id: string; name: string; songIds: string[] }> = [];
const comments: Array<{ id: string; songId: string; text: string }> = [];

export const getSongById = (id: string) => songs.find((song) => song.id === id) ?? generatedDrafts.find((song) => song.id === id);

export const createGeneratedDraft = (draft: Omit<GeneratedSongDraft, 'id' | 'createdAt' | 'status'>) => {
  const record: GeneratedSongDraft = {
    ...draft,
    id: `draft-${Date.now()}`,
    status: 'draft',
    createdAt: new Date().toISOString(),
  };
  generatedDrafts.unshift(record);
  return record;
};

export const publishGeneratedSong = (id: string) => {
  const song = generatedDrafts.find((draft) => draft.id === id);
  if (!song) return null;
  song.status = 'published';
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

export const createCollabRoom = (title: string) => ({
  id: `room-${Date.now()}`,
  title,
  status: 'draft',
});

export const pushNotification = (title: string, message: string, type: string) => {
  const item = { id: `notif-${Date.now()}`, title, message, type, createdAt: new Date().toISOString() };
  notifications.unshift(item);
  return item;
};

export const getGeneratedDrafts = () => generatedDrafts;
export const getNotifications = () => notifications;
