/**
 * AI API Configuration for Create Song Feature
 * 
 * This file configures the AI APIs used for lyrics, voice, and music generation.
 * Set up your API keys in .env file to enable live generation.
 * 
 * Supported APIs:
 * - OpenAI: For lyrics generation and TTS voice
 * - ElevenLabs: For high-quality TTS voice generation
 * - Google Cloud TTS: For multi-language TTS
 * - Azure Neural TTS: For enterprise-grade TTS
 * - Suno, Riffusion, Stable Audio: For music generation
 */

export const AI_CONFIG = {
  // OpenAI configuration for lyrics generation
  openai: {
    enabled: !!process.env.OPENAI_API_KEY,
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4', // Configurable model: gpt-4, gpt-4-turbo, gpt-3.5-turbo, gpt-4o, etc.
    maxTokens: (() => {
      const parsed = parseInt(process.env.OPENAI_MAX_TOKENS || '1500', 10);
      return isNaN(parsed) || parsed <= 0 ? 1500 : parsed;
    })(), // Configurable max tokens for longer lyrics if needed
  },
  
  // Text-to-Speech API configurations
  tts: {
    // OpenAI TTS configuration
    openai: {
      enabled: !!process.env.OPENAI_API_KEY,
      apiKey: process.env.OPENAI_API_KEY,
      model: 'tts-1-hd', // or 'tts-1' for faster generation
    },
    
    // ElevenLabs TTS configuration
    elevenlabs: {
      enabled: !!process.env.ELEVENLABS_API_KEY,
      apiKey: process.env.ELEVENLABS_API_KEY,
    },
    
    // Google Cloud TTS configuration
    googleTTS: {
      enabled: !!process.env.GOOGLE_TTS_API_KEY,
      apiKey: process.env.GOOGLE_TTS_API_KEY,
    },
    
    // Azure Neural TTS configuration
    azureTTS: {
      enabled: !!process.env.AZURE_TTS_API_KEY,
      apiKey: process.env.AZURE_TTS_API_KEY,
      region: process.env.AZURE_TTS_REGION || 'eastus',
    },
  },
  
  // Music generation API configurations
  music: {
    // Suno AI configuration
    suno: {
      enabled: !!process.env.SUNO_API_KEY,
      apiKey: process.env.SUNO_API_KEY,
    },
    
    // Riffusion configuration
    riffusion: {
      enabled: !!process.env.RIFFUSION_API_KEY,
      apiKey: process.env.RIFFUSION_API_KEY,
    },
    
    // Stable Audio configuration
    stableAudio: {
      enabled: !!process.env.STABLE_AUDIO_API_KEY,
      apiKey: process.env.STABLE_AUDIO_API_KEY,
    },
  },
  
  // Demo mode settings
  demo: {
    // Enable demo mode when no API keys are configured
    enabled: !process.env.OPENAI_API_KEY && !process.env.SUNO_API_KEY,
    
    // Demo sample audio files (place in public/demo-audio/)
    sampleTracks: [
      { name: 'Piano Demo', file: '/demo-audio/piano-demo.mp3', instrument: 'piano' },
      { name: 'Drums Demo', file: '/demo-audio/drums-demo.mp3', instrument: 'drums' },
      { name: 'Synth Demo', file: '/demo-audio/synth-demo.mp3', instrument: 'synth' },
      { name: 'Guitar Demo', file: '/demo-audio/guitar-demo.mp3', instrument: 'guitar' },
      { name: 'Bass Demo', file: '/demo-audio/bass-demo.mp3', instrument: 'bass' },
    ],
    
    // Demo voice samples
    sampleVoices: [
      { id: 'demo-male-1', name: 'Demo Male Voice', gender: 'male', language: 'en', languageName: 'English', provider: 'demo', file: '/demo-audio/voice-male-demo.mp3' },
      { id: 'demo-female-1', name: 'Demo Female Voice', gender: 'female', language: 'en', languageName: 'English', provider: 'demo', file: '/demo-audio/voice-female-demo.mp3' },
    ] as VoiceOption[],
  },
};

// Available genres for song generation
export const GENRES = [
  'Pop',
  'Rock',
  'Hip-Hop',
  'Electronic',
  'Jazz',
  'Classical',
  'R&B',
  'Country',
  'Reggae',
  'Blues',
  'Metal',
  'Folk',
  'Latin',
  'Ambient',
  'Lo-fi',
  'Indie',
  'Funk',
  'Soul',
  'Kompa (Haiti)',
  'Zouk',
  'Rabòday',
  'Vodou (Haitian)',
];

// Available instruments for track generation
export const INSTRUMENTS = [
  { id: 'piano', label: 'Piano', icon: '🎹' },
  { id: 'guitar', label: 'Guitar', icon: '🎸' },
  { id: 'bass', label: 'Bass', icon: '🎸' },
  { id: 'drums', label: 'Drums', icon: '🥁' },
  { id: 'synth', label: 'Synthesizer', icon: '🎛️' },
  { id: 'strings', label: 'Strings', icon: '🎻' },
  { id: 'brass', label: 'Brass', icon: '🎺' },
  { id: 'vocals', label: 'Vocals', icon: '🎤' },
  { id: 'percussion', label: 'Percussion', icon: '🥁' },
  { id: 'woodwind', label: 'Woodwind', icon: '🎷' },
];

// Moods/Styles for generation
export const MOODS = [
  'Energetic',
  'Calm',
  'Happy',
  'Melancholic',
  'Epic',
  'Romantic',
  'Dark',
  'Uplifting',
  'Chill',
  'Dramatic',
  'Mysterious',
  'Playful',
];

// Voice options for TTS generation
export interface VoiceOption {
  id: string;
  name: string;
  provider: 'openai' | 'elevenlabs' | 'google' | 'azure' | 'demo';
  gender?: 'male' | 'female' | 'neutral';
  language: string;
  languageName: string;
  style?: string;
  previewUrl?: string;
  singing?: boolean; // Indicates if voice supports singing
  file?: string; // For demo mode voice samples
}

// OpenAI TTS Voices
export const OPENAI_VOICES: VoiceOption[] = [
  { id: 'alloy', name: 'Alloy', provider: 'openai', gender: 'neutral', language: 'en', languageName: 'English' },
  { id: 'echo', name: 'Echo', provider: 'openai', gender: 'male', language: 'en', languageName: 'English' },
  { id: 'fable', name: 'Fable', provider: 'openai', gender: 'neutral', language: 'en', languageName: 'English' },
  { id: 'onyx', name: 'Onyx', provider: 'openai', gender: 'male', language: 'en', languageName: 'English' },
  { id: 'nova', name: 'Nova', provider: 'openai', gender: 'female', language: 'en', languageName: 'English' },
  { id: 'shimmer', name: 'Shimmer', provider: 'openai', gender: 'female', language: 'en', languageName: 'English' },
];

// ElevenLabs popular voices (users can add their custom voices)
export const ELEVENLABS_VOICES: VoiceOption[] = [
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', provider: 'elevenlabs', gender: 'male', language: 'en', languageName: 'English', style: 'Deep' },
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', provider: 'elevenlabs', gender: 'female', language: 'en', languageName: 'English', style: 'Calm' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', provider: 'elevenlabs', gender: 'female', language: 'en', languageName: 'English', style: 'Strong' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', provider: 'elevenlabs', gender: 'female', language: 'en', languageName: 'English', style: 'Soft' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', provider: 'elevenlabs', gender: 'male', language: 'en', languageName: 'English', style: 'Warm' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', provider: 'elevenlabs', gender: 'female', language: 'en', languageName: 'English', style: 'Youthful' },
];

// Google Cloud TTS sample voices (supports 40+ languages)
export const GOOGLE_TTS_VOICES: VoiceOption[] = [
  { id: 'en-US-Neural2-A', name: 'US English Male (Neural)', provider: 'google', gender: 'male', language: 'en', languageName: 'English (US)' },
  { id: 'en-US-Neural2-C', name: 'US English Female (Neural)', provider: 'google', gender: 'female', language: 'en', languageName: 'English (US)' },
  { id: 'en-GB-Neural2-A', name: 'UK English Female (Neural)', provider: 'google', gender: 'female', language: 'en-GB', languageName: 'English (UK)' },
  { id: 'en-GB-Neural2-B', name: 'UK English Male (Neural)', provider: 'google', gender: 'male', language: 'en-GB', languageName: 'English (UK)' },
  { id: 'es-ES-Neural2-A', name: 'Spanish Female (Neural)', provider: 'google', gender: 'female', language: 'es', languageName: 'Spanish' },
  { id: 'es-ES-Neural2-B', name: 'Spanish Male (Neural)', provider: 'google', gender: 'male', language: 'es', languageName: 'Spanish' },
  { id: 'fr-FR-Neural2-A', name: 'French Female (Neural)', provider: 'google', gender: 'female', language: 'fr', languageName: 'French' },
  { id: 'fr-FR-Neural2-B', name: 'French Male (Neural)', provider: 'google', gender: 'male', language: 'fr', languageName: 'French' },
];

// Azure Neural TTS sample voices (supports 100+ languages)
export const AZURE_TTS_VOICES: VoiceOption[] = [
  { id: 'en-US-JennyNeural', name: 'Jenny (US)', provider: 'azure', gender: 'female', language: 'en', languageName: 'English (US)', style: 'Friendly' },
  { id: 'en-US-GuyNeural', name: 'Guy (US)', provider: 'azure', gender: 'male', language: 'en', languageName: 'English (US)', style: 'Casual' },
  { id: 'en-US-AriaNeural', name: 'Aria (US)', provider: 'azure', gender: 'female', language: 'en', languageName: 'English (US)', style: 'Professional' },
  { id: 'en-GB-SoniaNeural', name: 'Sonia (UK)', provider: 'azure', gender: 'female', language: 'en-GB', languageName: 'English (UK)' },
  { id: 'en-GB-RyanNeural', name: 'Ryan (UK)', provider: 'azure', gender: 'male', language: 'en-GB', languageName: 'English (UK)' },
  { id: 'es-ES-ElviraNeural', name: 'Elvira (Spanish)', provider: 'azure', gender: 'female', language: 'es', languageName: 'Spanish' },
  { id: 'fr-FR-DeniseNeural', name: 'Denise (French)', provider: 'azure', gender: 'female', language: 'fr', languageName: 'French' },
];

// Get all available voices based on configured APIs
export function getAvailableVoices(): VoiceOption[] {
  const voices: VoiceOption[] = [];
  
  if (AI_CONFIG.tts.openai.enabled) {
    voices.push(...OPENAI_VOICES);
  }
  
  if (AI_CONFIG.tts.elevenlabs.enabled) {
    voices.push(...ELEVENLABS_VOICES);
  }
  
  if (AI_CONFIG.tts.googleTTS.enabled) {
    voices.push(...GOOGLE_TTS_VOICES);
  }
  
  if (AI_CONFIG.tts.azureTTS.enabled) {
    voices.push(...AZURE_TTS_VOICES);
  }
  
  // Always include demo voices if no TTS providers are configured
  if (voices.length === 0) {
    voices.push(...AI_CONFIG.demo.sampleVoices);
  }
  
  return voices;
}

// Get voices filtered by language
export function getVoicesByLanguage(languageCode: string): VoiceOption[] {
  const allVoices = getAvailableVoices();
  return allVoices.filter(v => v.language.startsWith(languageCode) || v.language === languageCode);
}
