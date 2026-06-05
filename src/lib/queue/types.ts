export type GenerationJobStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETE' | 'FAILED' | 'CANCELLED';

export type GenerationJobData = {
  userId: string;
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
  mode?: 'generate' | 'regenerate' | 'extend';
  isPriority: boolean;
  enqueuedAt: string;
};

export type GenerationJobResult = {
  audioUrl: string;
  wavUrl: string;
  stemsUrls?: Record<string, string>;
  masteredAudioUrl?: string;
  coverUrl?: string;
  videoUrl?: string;
  provider: string;
  songDraftId: string;
};

export type GenerationJobRecord = {
  jobId: string;
  userId: string;
  status: GenerationJobStatus;
  progress: number;
  queuePosition: number | null;
  estimatedWaitSeconds: number | null;
  result: GenerationJobResult | null;
  errorMessage: string | null;
  enqueuedAt: string;
  startedAt: string | null;
  completedAt: string | null;
};
