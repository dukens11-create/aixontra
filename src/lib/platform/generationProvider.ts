import { DEMO_AUDIO_URL } from './demoData';

export type GenerationStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETE' | 'FAILED';

export type GenerationInput = {
  prompt: string;
  lyrics?: string;
  genre?: string;
  mood?: string;
  language?: string;
  bpm?: number;
  vocalStyle?: string;
  instrumentalOnly?: boolean;
  targetDurationSeconds?: number;
  masteringPreset?: 'LOUDNESS_NORMALIZATION' | 'CLEAN_MIX' | 'RADIO_READY';
  originalSongId?: string;
};

export type GenerationResult = {
  audioUrl: string;
  wavUrl: string;
  stemsUrls: Record<'vocals' | 'drums' | 'bass' | 'melody' | 'instrumental' | 'fullMix', string>;
  coverUrl?: string;
  videoUrl?: string;
  masteredAudioUrl?: string;
  provider: string;
  status: GenerationStatus;
  message: string;
  costUsd?: number;
  providerAttempts?: string[];
};

export interface AiMusicProvider {
  name: string;
  generate(input: GenerationInput): Promise<GenerationResult>;
}

class DemoMusicProvider implements AiMusicProvider {
  name = 'demo-provider';

  async generate(_input: GenerationInput): Promise<GenerationResult> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const stemsUrls = {
      vocals: `${DEMO_AUDIO_URL}&stem=vocals`,
      drums: `${DEMO_AUDIO_URL}&stem=drums`,
      bass: `${DEMO_AUDIO_URL}&stem=bass`,
      melody: `${DEMO_AUDIO_URL}&stem=melody`,
      instrumental: `${DEMO_AUDIO_URL}&stem=instrumental`,
      fullMix: `${DEMO_AUDIO_URL}&stem=full_mix`,
    };
    return {
      audioUrl: DEMO_AUDIO_URL,
      wavUrl: `${DEMO_AUDIO_URL}&format=wav`,
      stemsUrls,
      coverUrl: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?auto=format&fit=crop&w=900&q=80',
      videoUrl: 'https://example.com/visualizer/placeholder.mp4',
      masteredAudioUrl: `${DEMO_AUDIO_URL}&mastered=true`,
      provider: this.name,
      status: 'COMPLETE',
      message: 'Generation complete',
    };
  }
}

export const providerRegistry: Record<string, AiMusicProvider> = {
  demo: new DemoMusicProvider(),
};

export const getMusicProvider = (providerKey = process.env.AI_MUSIC_PROVIDER ?? 'demo') => {
  return providerRegistry[providerKey] ?? providerRegistry.demo;
};

export const getRegisteredProviders = () => Object.keys(providerRegistry);
