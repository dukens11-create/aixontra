export type StorageProvider = 'cloudinary' | 's3' | 'supabase';
export type MediaAssetKind = 'mp3' | 'wav' | 'stem' | 'cover' | 'video';

const detectProvider = (): StorageProvider => {
  const configured = (process.env.MEDIA_STORAGE_PROVIDER ?? '').toLowerCase();
  if (configured === 'cloudinary' || configured === 's3' || configured === 'supabase') return configured;
  if (process.env.CLOUDINARY_CLOUD_NAME) return 'cloudinary';
  if (process.env.AWS_S3_BUCKET) return 's3';
  return 'supabase';
};

export const storageProvider: StorageProvider = detectProvider();

const extensionByKind: Record<MediaAssetKind, string> = {
  mp3: 'mp3',
  wav: 'wav',
  stem: 'wav',
  cover: 'jpg',
  video: 'mp4',
};

export const createSecureUploadUrl = (input: { userId: string; kind: MediaAssetKind; songId?: string }) => {
  const path = `${input.userId}/${input.songId ?? 'drafts'}/${input.kind}-${Date.now()}.${extensionByKind[input.kind]}`;
  return {
    provider: storageProvider,
    path,
    uploadUrl: `/api/media/upload-url?provider=${storageProvider}&path=${encodeURIComponent(path)}`,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  };
};

export const toPublicMediaUrl = (path: string) => `https://media.aixentra.app/${storageProvider}/${path}`;
