import { DEMO_AUDIO_URL } from './demoData';

export type GenerationInput = {
  prompt: string;
  lyrics?: string;
  genre?: string;
  mood?: string;
  language?: string;
  bpm?: number;
  vocalStyle?: string;
  instrumentalOnly?: boolean;
};

export type GenerationResult = {
  audioUrl: string;
  provider: string;
  status: 'complete';
  message: 'Generation complete';
};

export interface AiMusicProvider {
  name: string;
  generate(input: GenerationInput): Promise<GenerationResult>;
}

class DemoMusicProvider implements AiMusicProvider {
  name = 'demo-provider';

  async generate(_input: GenerationInput): Promise<GenerationResult> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return {
      audioUrl: DEMO_AUDIO_URL,
      provider: this.name,
      status: 'complete',
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
