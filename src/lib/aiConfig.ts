/**
 * AI API Configuration for Create Song Feature
 * 
 * This file configures the AI APIs used for lyrics and music generation.
 * Set up your API keys in .env file to enable live generation.
 * 
 * Supported APIs:
 * - OpenAI: For lyrics generation
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
