export const PROMPT_TEMPLATES = [
  'Write a heartfelt song about long-distance love with vivid imagery.',
  'Create a high-energy anthem for late-night city drives.',
  'Craft a reflective song about resilience after failure.',
  'Build a celebratory chorus for a summer festival hit.',
] as const;

export const SONG_STRUCTURE_TEMPLATES = {
  standard: '[Verse 1]\n\n[Pre-Chorus]\n\n[Chorus]\n\n[Verse 2]\n\n[Bridge]\n\n[Chorus]\n\n[Outro]',
  pop: '[Verse 1]\n\n[Chorus]\n\n[Verse 2]\n\n[Chorus]\n\n[Bridge]\n\n[Chorus]',
  storytelling: '[Intro]\n\n[Verse 1]\n\n[Verse 2]\n\n[Hook]\n\n[Bridge]\n\n[Verse 3]\n\n[Outro]',
} as const;

const genreKeywordMap: Record<string, string[]> = {
  Pop: ['pop', 'radio', 'anthem', 'hook'],
  'R&B': ['soul', 'smooth', 'romance', 'slow jam'],
  Afrobeat: ['dance', 'groove', 'afro', 'percussion'],
  Kompa: ['kompa', 'haiti', 'creole'],
  Trap: ['808', 'trap', 'hustle', 'street'],
  Rock: ['guitar', 'band', 'stadium'],
};

const moodKeywordMap: Record<string, string[]> = {
  Uplifting: ['hope', 'rise', 'victory', 'shine'],
  Romantic: ['love', 'heart', 'kiss', 'together'],
  Cinematic: ['cinematic', 'epic', 'skyline', 'dreamscape'],
  Dark: ['shadow', 'midnight', 'pain', 'storm'],
  Energetic: ['dance', 'run', 'fire', 'fast'],
  Melancholic: ['lonely', 'memory', 'tears', 'missing'],
};

const autocompleteChunks: Record<string, string[]> = {
  about: ['second chances under neon lights', 'faith during the darkest night', 'finding home after a long road'],
  with: ['a chant-ready chorus and clear hooks', 'a confident first-person voice', 'imagery tied to city rain'],
  for: ['a global summer audience', 'a late-night drive playlist', 'a cinematic trailer vibe'],
};

const DEFAULT_AUTOCOMPLETE_SUFFIX = 'with multilingual verses and a catchy chorus';
const RHYME_FAMILY: Record<string, string[]> = {
  ay: ['day', 'stay', 'way', 'play'],
  ow: ['glow', 'show', 'slow', 'flow'],
  ee: ['free', 'see', 'me', 'key'],
  ight: ['light', 'night', 'fight', 'flight'],
};
const RHYME_ENDINGS = Object.keys(RHYME_FAMILY).sort((endingA, endingB) => endingB.length - endingA.length);

function sanitizePrompt(prompt: string) {
  return prompt.trim().replace(/\s+/g, ' ');
}

function titleCase(text: string) {
  if (!text.trim()) return '';
  return text
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function enhancePrompt(prompt: string, genre: string, mood: string) {
  const basePrompt = sanitizePrompt(prompt);
  if (!basePrompt) {
    return `Write a ${mood.toLowerCase()} ${genre} song with a memorable hook and clear verse-to-chorus progression.`;
  }
  return `${basePrompt} Write it as a ${genre} track with a ${mood.toLowerCase()} tone, include a standout hook, and keep the lines singable.`;
}

export function getGenreSuggestions(prompt: string) {
  const lower = prompt.toLowerCase();
  const picks = new Set<string>();

  for (const [genre, keywords] of Object.entries(genreKeywordMap)) {
    if (keywords.some((keyword) => lower.includes(keyword))) {
      picks.add(genre);
    }
  }

  if (picks.size === 0) {
    return ['Pop', 'R&B', 'Afrobeat'];
  }

  return Array.from(picks).slice(0, 3);
}

export function getMoodSuggestions(prompt: string) {
  const lower = prompt.toLowerCase();
  const picks = new Set<string>();

  for (const [mood, keywords] of Object.entries(moodKeywordMap)) {
    if (keywords.some((keyword) => lower.includes(keyword))) {
      picks.add(mood);
    }
  }

  if (picks.size === 0) {
    return ['Uplifting', 'Romantic', 'Cinematic'];
  }

  return Array.from(picks).slice(0, 3);
}

export function getSmartAutocomplete(prompt: string) {
  const trimmed = sanitizePrompt(prompt);
  if (!trimmed) {
    return [
      'A cinematic anthem about rising above fear',
      'A soulful love song with bilingual lyrics',
      'An energetic club record with crowd chants',
    ];
  }

  const parts = trimmed.split(' ');
  const lastWord = parts[parts.length - 1].toLowerCase();
  const options = autocompleteChunks[lastWord] ?? [DEFAULT_AUTOCOMPLETE_SUFFIX];

  return options.slice(0, 3).map((option) => `${trimmed} ${option}`);
}

export function getRewriteSuggestions(prompt: string) {
  const base = sanitizePrompt(prompt);
  if (!base) {
    return [
      'Write an emotionally rich radio-ready pop record with vivid imagery.',
      'Create a bilingual anthem with a clear hook and call-and-response chorus.',
    ];
  }

  return [
    `${base} Focus on vivid sensory details and concise lines.`,
    `${base} Add a stronger emotional arc from verse to chorus.`,
    `${base} Keep rhyme endings tighter for better memorability.`,
  ];
}

export function createHookLine(prompt: string, mood: string) {
  const words = sanitizePrompt(prompt).split(' ').filter(Boolean).slice(0, 6).join(' ');
  const phrase = words || 'our story in neon';
  return `${titleCase(phrase)} — we keep it ${mood.toLowerCase()} tonight`;
}

export function createChorusBlock(prompt: string, mood: string) {
  const hook = createHookLine(prompt, mood);
  return `[Chorus]\n${hook}\n${hook}\nWe sing it louder till the morning light`;
}

export function getRhymeHelper(word: string) {
  const clean = word.toLowerCase().replace(/[^\p{L}]/gu, '');
  if (!clean) return [];
  const matchedEnding = RHYME_ENDINGS.find((ending) => clean.endsWith(ending));

  if (matchedEnding) {
    return RHYME_FAMILY[matchedEnding];
  }

  return [];
}

export function applyStructureTemplate(templateKey: keyof typeof SONG_STRUCTURE_TEMPLATES) {
  return SONG_STRUCTURE_TEMPLATES[templateKey];
}
