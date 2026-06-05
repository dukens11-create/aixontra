import { SUPPORTED_GENRES } from './demoData';

/** Prompt templates support `[genre]` and `[mood]` token replacement in the generate UI assistant. */
export const PROMPT_TEMPLATES = [
  'Create a [genre] anthem with [mood] energy, vivid imagery, and a festival-ready drop.',
  'Write a [genre] track inspired by midnight city lights, with emotional [mood] vocals.',
  'Generate a [genre] song with [mood] storytelling, layered harmonies, and a memorable hook.',
];

const MOOD_LIBRARY = ['Cinematic', 'Romantic', 'Dark', 'Energetic', 'Uplifting', 'Melancholic', 'Dreamy', 'Aggressive'];

const extractWords = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2);

export const enhancePrompt = (prompt: string, genre?: string, mood?: string) => {
  const base = prompt.trim();
  if (!base) return '';
  const additions = [genre ? `${genre} production` : null, mood ? `${mood.toLowerCase()} mood` : null, 'clear song structure', 'strong melodic hook'].filter(Boolean);
  return `${base}. Include ${additions.join(', ')}.`;
};

export const suggestGenres = (prompt: string) => {
  const lower = prompt.toLowerCase();
  const matched = SUPPORTED_GENRES.filter((genre) => lower.includes(genre.toLowerCase()));
  if (matched.length) return matched.slice(0, 4);
  return SUPPORTED_GENRES.slice(0, 4);
};

export const suggestMoods = (prompt: string) => {
  const lower = prompt.toLowerCase();
  const matched = MOOD_LIBRARY.filter((mood) => lower.includes(mood.toLowerCase()));
  if (matched.length) return matched.slice(0, 4);
  return MOOD_LIBRARY.slice(0, 4);
};

export const generateHook = (prompt: string) => {
  const keywords = extractWords(prompt).slice(0, 3).join(' / ') || 'your sound';
  return `Hook idea: "${keywords} tonight, we rise and we glow."`;
};

export const generateChorus = (prompt: string, mood?: string) => {
  const keywords = extractWords(prompt).slice(0, 2).join(' and ') || 'our rhythm';
  const vibe = mood ? mood.toLowerCase() : 'uplifting';
  return `[Chorus]\nWe carry ${keywords} through the night\n${vibe} hearts, we burn so bright\nOne more time, let the speakers know\nThis is our moment, steal the show`;
};

export const rhymeHelper = (seedWord: string) => {
  const fallback = ['light', 'fire', 'higher', 'desire'];
  const map: Record<string, string[]> = {
    night: ['light', 'bright', 'ignite'],
    love: ['above', 'glove', 'dove'],
    fire: ['higher', 'desire', 'wire'],
    dream: ['gleam', 'beam', 'theme'],
  };
  return map[seedWord.toLowerCase()] ?? fallback;
};

export const lyricHelper = (prompt: string) => {
  const keywords = extractWords(prompt).slice(0, 3);
  return [
    'Start with a concrete visual in verse 1.',
    'Use a repeatable phrase at the end of chorus lines.',
    `Anchor your bridge around keywords: ${keywords.join(', ') || 'emotion, conflict, release'}.`,
  ];
};

export const smartAutocomplete = (prompt: string) => {
  const trimmed = prompt.trim();
  if (!trimmed) {
    return ['with a soaring chorus', 'with bilingual lyrics', 'with a cinematic intro'];
  }
  return [
    `${trimmed} with layered harmonies`,
    `${trimmed} and a radio-ready hook`,
    `${trimmed} while keeping singable syllables`,
  ];
};

export const rewriteSuggestions = (prompt: string, genre?: string, mood?: string) => {
  if (!prompt.trim()) return [];
  const enhanced = enhancePrompt(prompt, genre, mood);
  return [
    enhanced,
    enhanced.replace('Include', 'Focus on'),
    `${prompt.trim()} Keep verses concise and chorus emotionally direct.`,
  ];
};
