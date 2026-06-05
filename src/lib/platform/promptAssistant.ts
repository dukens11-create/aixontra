import { SUPPORTED_GENRES } from './demoData';

const STOP_WORDS = new Set(['the', 'and', 'with', 'for', 'from', 'into', 'your', 'this', 'that']);

export const QUICK_PROMPT_CHIPS = [
  'anthem-ready hook',
  'radio-friendly chorus',
  'festival drop',
  'late-night vibe',
  'viral TikTok moment',
] as const;

export const PROMPT_TEMPLATES = [
  'Create a {genre} track in {language} with a {mood} mood, a strong hook, and a memorable chorus.',
  'Write cinematic {genre} lyrics about {theme}, keeping lines singable and emotionally vivid.',
  'Generate a {mood} {genre} concept with verse, pre-chorus, and chorus sections plus ad-libs.',
] as const;

const MOOD_SUGGESTIONS = ['Cinematic', 'Romantic', 'Dark', 'Energetic', 'Uplifting', 'Melancholic'] as const;

const RHYME_DICTIONARY: Record<string, string[]> = {
  fire: ['desire', 'higher', 'wire', 'choir'],
  night: ['light', 'bright', 'flight', 'ignite'],
  love: ['above', 'dove', 'glove'],
  pain: ['rain', 'chain', 'vein', 'again'],
  dream: ['beam', 'theme', 'gleam', 'extreme'],
};

function extractKeywords(prompt: string): string[] {
  return prompt
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
    .slice(0, 4);
}

export function enhancePrompt(prompt: string, genre: string, mood: string, language: string): string {
  const trimmed = prompt.trim();
  if (!trimmed) return '';
  const safeGenre = genre.trim() || 'contemporary';
  const safeMood = mood.trim().toLowerCase() || 'balanced';
  const safeLanguage = language.trim() || 'English';
  return `${trimmed} Focus on ${safeGenre} production, ${safeMood} emotion, and natural ${safeLanguage} phrasing with a clear hook and chorus.`;
}

export function getGenreSuggestions(input: string): string[] {
  const lowered = input.toLowerCase();
  return [...SUPPORTED_GENRES]
    .filter((genre) => !lowered || genre.toLowerCase().includes(lowered))
    .slice(0, 6);
}

export function getMoodSuggestions(input: string): string[] {
  const lowered = input.toLowerCase();
  return [...MOOD_SUGGESTIONS]
    .filter((mood) => !lowered || mood.toLowerCase().includes(lowered))
    .slice(0, 6);
}

export function getSmartAutocomplete(prompt: string): string[] {
  const lowered = prompt.toLowerCase();
  if (!lowered.trim()) return [];
  return [
    'with call-and-response vocals',
    'plus cinematic bridge and final chorus lift',
    'keeping syllables balanced for live performance',
    'with multilingual phrases and internal rhymes',
  ].filter((option) => !lowered.includes(option.toLowerCase()));
}

export function generateHookIdea(prompt: string, mood: string): string {
  const [first = 'heartbeat'] = extractKeywords(prompt);
  return `Hook idea: "${first.toUpperCase()} in the spotlight, we rise tonight" with a ${mood.toLowerCase()} cadence.`;
}

export function generateChorusIdea(prompt: string): string {
  const [first = 'dream', second = 'fire'] = extractKeywords(prompt);
  return `Chorus idea: Repeat "${first} and ${second}" across lines 1 and 4, then resolve with a sing-along phrase.`;
}

export function getRhymeSuggestions(word: string): string[] {
  const normalized = word.toLowerCase().replace(/[^a-z'-]/g, '');
  // For compounds/contractions we use the trailing segment (e.g. "mid-night" -> "night").
  const cleaned = normalized.split(/['-]/g).filter(Boolean).at(-1) ?? '';
  if (!cleaned) return [];
  return RHYME_DICTIONARY[cleaned] ?? [];
}

export function getLyricHelper(prompt: string): string[] {
  const [first = 'city', second = 'lights'] = extractKeywords(prompt);
  return [
    `Verse starter: "Under the ${first} sky, I hear the ${second} call."`,
    'Bridge move: switch to shorter lines to raise intensity before chorus.',
    'Performance tip: keep stressed syllables aligned on beat 2 and 4.',
  ];
}

export function getRewriteSuggestions(prompt: string): string[] {
  const trimmed = prompt.trim();
  if (!trimmed) return [];
  return [
    `${trimmed} Keep the imagery visual and emotionally direct.`,
    `${trimmed} Add contrast between verse vulnerability and chorus confidence.`,
    `${trimmed} Tighten line length for punchier vocal phrasing.`,
  ];
}
