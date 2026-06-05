export const SUPPORTED_GENRES = [
  'Rap',
  'Trap',
  'Afrobeat',
  'Kompa',
  'Drill',
  'Reggaeton',
  'Gospel',
  'EDM',
  'R&B',
  'Lo-fi',
  'Pop',
  'Rock',
] as const;

export const SUPPORTED_LANGUAGES = ['English', 'Haitian Creole', 'French', 'Spanish', 'Portuguese'] as const;

export type Song = {
  id: string;
  title: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  genre: string;
  mood: string;
  language: string;
  bpm: number;
  likes: number;
  plays: number;
  comments: number;
  remixes: number;
  audioUrl: string;
  wavUrl?: string;
  stemsUrls?: Partial<Record<'vocals' | 'drums' | 'bass' | 'melody' | 'instrumental' | 'fullMix', string>>;
  coverUrl: string;
  videoUrl?: string;
  masteredAudioUrl?: string;
  prompt: string;
  lyrics: string;
  isPublic: boolean;
  createdAt?: string;
};

export type CreatorProfile = {
  id: string;
  stageName: string;
  bio: string;
  avatarUrl: string;
  bannerUrl: string;
  verified: boolean;
  followers: number;
  monthlyListeners: number;
  totalPlays: number;
};

export type MarketplaceItem = {
  id: string;
  title: string;
  type: 'beats' | 'ai_song' | 'vocal_pack' | 'voice_model' | 'exclusive_license' | 'commercial_license';
  price: number;
  licenseType: string;
  previewAudioUrl: string;
  description: string;
  seller: string;
  cover: string;
};

export const DEMO_AUDIO_URL = 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_06bb4f9245.mp3?filename=technology-interface-128925.mp3';

export const creators: CreatorProfile[] = [
  {
    id: 'creator-1',
    stageName: 'NeonKreyol',
    bio: 'Blending Kompa soul with futuristic AI textures.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    verified: true,
    followers: 12840,
    monthlyListeners: 95120,
    totalPlays: 1460000,
  },
  {
    id: 'creator-2',
    stageName: 'FutureDrill',
    bio: 'Heavy 808 narratives engineered for viral loops.',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?auto=format&fit=crop&w=1200&q=80',
    verified: false,
    followers: 5430,
    monthlyListeners: 31400,
    totalPlays: 482000,
  },
];

export const songs: Song[] = [
  {
    id: 'song-1',
    title: 'Midnight Kompa Signals',
    creatorId: 'creator-1',
    creatorName: 'NeonKreyol',
    creatorAvatar: creators[0].avatarUrl,
    genre: 'Kompa',
    mood: 'Romantic',
    language: 'Haitian Creole',
    bpm: 104,
    likes: 2810,
    plays: 90120,
    comments: 290,
    remixes: 73,
    audioUrl: DEMO_AUDIO_URL,
    wavUrl: `${DEMO_AUDIO_URL}&format=wav`,
    stemsUrls: {
      vocals: `${DEMO_AUDIO_URL}&stem=vocals`,
      drums: `${DEMO_AUDIO_URL}&stem=drums`,
      bass: `${DEMO_AUDIO_URL}&stem=bass`,
      melody: `${DEMO_AUDIO_URL}&stem=melody`,
      instrumental: `${DEMO_AUDIO_URL}&stem=instrumental`,
      fullMix: `${DEMO_AUDIO_URL}&stem=full_mix`,
    },
    coverUrl: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?auto=format&fit=crop&w=900&q=80',
    videoUrl: 'https://example.com/visualizer/placeholder.mp4',
    masteredAudioUrl: `${DEMO_AUDIO_URL}&mastered=true`,
    prompt: 'Warm guitar kompa groove with neon synth accents.',
    lyrics: 'Nan mitan lannwit la nou danse anba limyè vil la...',
    isPublic: true,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'song-2',
    title: 'Chrome Street Psalms',
    creatorId: 'creator-2',
    creatorName: 'FutureDrill',
    creatorAvatar: creators[1].avatarUrl,
    genre: 'Drill',
    mood: 'Dark',
    language: 'English',
    bpm: 145,
    likes: 1620,
    plays: 43210,
    comments: 112,
    remixes: 41,
    audioUrl: DEMO_AUDIO_URL,
    wavUrl: `${DEMO_AUDIO_URL}&format=wav`,
    coverUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80',
    prompt: 'Aggressive drill beat, gliding bass, cinematic choir textures.',
    lyrics: 'Chrome on the skyline, city pulse in my veins...',
    isPublic: true,
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
  {
    id: 'song-3',
    title: 'Pulse of Tomorrow',
    creatorId: 'creator-1',
    creatorName: 'NeonKreyol',
    creatorAvatar: creators[0].avatarUrl,
    genre: 'EDM',
    mood: 'Energetic',
    language: 'French',
    bpm: 126,
    likes: 940,
    plays: 21600,
    comments: 76,
    remixes: 18,
    audioUrl: DEMO_AUDIO_URL,
    wavUrl: `${DEMO_AUDIO_URL}&format=wav`,
    coverUrl: 'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?auto=format&fit=crop&w=900&q=80',
    prompt: 'Festival-ready drop with hopeful vocals and side-chained synths.',
    lyrics: 'On danse jusqu’au matin, nos rêves deviennent lumière...',
    isPublic: true,
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
  },
];

export const marketplaceItems: MarketplaceItem[] = [
  {
    id: 'item-1',
    title: 'Afrobeat Heatwave Kit',
    type: 'beats',
    price: 79,
    licenseType: 'Commercial',
    previewAudioUrl: DEMO_AUDIO_URL,
    description: 'Five polished afrobeat loops and stems for fast release cycles.',
    seller: 'NeonKreyol',
    cover: songs[0].coverUrl,
  },
  {
    id: 'item-2',
    title: 'Drill Vocal Texture Pack',
    type: 'vocal_pack',
    price: 49,
    licenseType: 'Non-exclusive',
    previewAudioUrl: DEMO_AUDIO_URL,
    description: 'Processed vocal chops tuned for dark drill productions.',
    seller: 'FutureDrill',
    cover: songs[1].coverUrl,
  },
];
