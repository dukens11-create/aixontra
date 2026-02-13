/**
 * Genre-Specific Rules and Generation Intelligence
 * 
 * Provides genre-specific guidance for:
 * - BPM ranges
 * - Lyric themes and structure
 * - Musical characteristics
 * - Vocal style recommendations
 */

export interface GenreRules {
  name: string;
  bpmRange: { min: number; max: number };
  idealBpm: number;
  themes: string[];
  structure: string[];
  musicalCharacteristics: string[];
  vocalStyle: string[];
  lyricPromptEnhancer: (basePrompt: string) => string;
}

export const GENRE_RULES: Record<string, GenreRules> = {
  'Kompa (Haiti)': {
    name: 'Kompa',
    bpmRange: { min: 90, max: 110 },
    idealBpm: 100,
    themes: ['Romantic love', 'Dancing', 'Celebration', 'Haitian culture', 'Passion'],
    structure: ['Intro', 'Verse 1', 'Chorus', 'Verse 2', 'Chorus', 'Bridge', 'Chorus', 'Outro'],
    musicalCharacteristics: [
      'Smooth, flowing melodies',
      'Distinctive guitar patterns',
      'Melodic bass lines',
      'Steady 4/4 beat',
      'Romantic horn sections',
    ],
    vocalStyle: ['Smooth', 'Melodic', 'Romantic', 'Passionate'],
    lyricPromptEnhancer: (prompt) =>
      `Write romantic Kompa song lyrics with a smooth, flowing style. ${prompt}. Use themes of love, dancing, and connection. Keep it melodic and singable.`,
  },
  
  'Afrobeats': {
    name: 'Afrobeats',
    bpmRange: { min: 100, max: 128 },
    idealBpm: 115,
    themes: ['Joy', 'Celebration', 'Love', 'Success', 'Life', 'Dancing'],
    structure: ['Intro', 'Verse 1', 'Pre-Chorus', 'Chorus', 'Verse 2', 'Chorus', 'Bridge', 'Chorus', 'Outro'],
    musicalCharacteristics: [
      'Syncopated rhythms',
      'Call and response patterns',
      'Layered percussion',
      'Infectious grooves',
      'Repetitive hooks',
    ],
    vocalStyle: ['Melodic', 'Rhythmic', 'Energetic', 'Catchy'],
    lyricPromptEnhancer: (prompt) =>
      `Write Afrobeats song lyrics with catchy hooks and call-and-response elements. ${prompt}. Make it rhythmic, celebratory, and full of energy. Include repetitive, memorable phrases.`,
  },
  
  'Drill': {
    name: 'Drill',
    bpmRange: { min: 140, max: 150 },
    idealBpm: 145,
    themes: ['Street life', 'Struggle', 'Authenticity', 'Ambition', 'Reality'],
    structure: ['Intro', 'Verse 1', 'Hook', 'Verse 2', 'Hook', 'Verse 3', 'Hook', 'Outro'],
    musicalCharacteristics: [
      'Dark, menacing beats',
      'Sliding 808s',
      'Rapid hi-hats',
      'Sparse melodies',
      'Heavy bass',
    ],
    vocalStyle: ['Aggressive', 'Direct', 'Rapid', 'Intense'],
    lyricPromptEnhancer: (prompt) =>
      `Write Drill rap lyrics with aggressive, direct delivery. ${prompt}. Keep it raw, authentic, and street-focused. Use rapid-fire flows and hard-hitting punchlines.`,
  },
  
  'Gospel': {
    name: 'Gospel',
    bpmRange: { min: 70, max: 140 },
    idealBpm: 100,
    themes: ['Faith', 'Hope', 'Worship', 'Praise', 'Redemption', 'Joy', 'Testimony'],
    structure: ['Intro', 'Verse 1', 'Chorus', 'Verse 2', 'Chorus', 'Bridge', 'Vamp', 'Chorus', 'Outro'],
    musicalCharacteristics: [
      'Uplifting melodies',
      'Powerful vocals',
      'Choir harmonies',
      'Call and response',
      'Piano and organ',
      'Building intensity',
    ],
    vocalStyle: ['Powerful', 'Emotional', 'Uplifting', 'Soulful'],
    lyricPromptEnhancer: (prompt) =>
      `Write uplifting Gospel lyrics with themes of faith and hope. ${prompt}. Make it powerful, emotional, and spiritually inspiring. Include call-and-response elements.`,
  },
  
  'Pop': {
    name: 'Pop',
    bpmRange: { min: 110, max: 130 },
    idealBpm: 120,
    themes: ['Love', 'Relationships', 'Fun', 'Youth', 'Dreams', 'Emotions'],
    structure: ['Intro', 'Verse 1', 'Pre-Chorus', 'Chorus', 'Verse 2', 'Pre-Chorus', 'Chorus', 'Bridge', 'Chorus', 'Outro'],
    musicalCharacteristics: [
      'Catchy melodies',
      'Clear structure',
      'Strong hooks',
      'Polished production',
      'Universal appeal',
    ],
    vocalStyle: ['Clear', 'Melodic', 'Catchy', 'Accessible'],
    lyricPromptEnhancer: (prompt) =>
      `Write catchy Pop song lyrics with universal appeal. ${prompt}. Make it memorable, relatable, and radio-friendly. Focus on a strong, repetitive hook.`,
  },
  
  'Hip-Hop': {
    name: 'Hip-Hop',
    bpmRange: { min: 80, max: 110 },
    idealBpm: 95,
    themes: ['Success', 'Struggle', 'Authenticity', 'Life', 'Dreams', 'Culture'],
    structure: ['Intro', 'Verse 1', 'Hook', 'Verse 2', 'Hook', 'Verse 3', 'Hook', 'Outro'],
    musicalCharacteristics: [
      'Strong drum patterns',
      'Sampled elements',
      'Heavy bass',
      'Rhythmic focus',
      'Layered beats',
    ],
    vocalStyle: ['Rhythmic', 'Clear', 'Confident', 'Varied flow'],
    lyricPromptEnhancer: (prompt) =>
      `Write Hip-Hop lyrics with clever wordplay and strong rhythm. ${prompt}. Make it authentic, rhythmic, and focused on storytelling or expression.`,
  },
  
  'R&B': {
    name: 'R&B',
    bpmRange: { min: 70, max: 110 },
    idealBpm: 90,
    themes: ['Love', 'Relationships', 'Emotion', 'Romance', 'Heartbreak', 'Desire'],
    structure: ['Intro', 'Verse 1', 'Pre-Chorus', 'Chorus', 'Verse 2', 'Pre-Chorus', 'Chorus', 'Bridge', 'Chorus', 'Outro'],
    musicalCharacteristics: [
      'Smooth grooves',
      'Soulful melodies',
      'Rich harmonies',
      'Emotional delivery',
      'Rhythmic sophistication',
    ],
    vocalStyle: ['Smooth', 'Soulful', 'Emotional', 'Melodic'],
    lyricPromptEnhancer: (prompt) =>
      `Write smooth R&B lyrics with emotional depth and romantic themes. ${prompt}. Make it soulful, intimate, and melodically rich.`,
  },
  
  'Electronic': {
    name: 'Electronic',
    bpmRange: { min: 120, max: 140 },
    idealBpm: 128,
    themes: ['Energy', 'Night', 'Freedom', 'Movement', 'Escape', 'Future'],
    structure: ['Intro', 'Build', 'Drop', 'Verse', 'Build', 'Drop', 'Break', 'Build', 'Drop', 'Outro'],
    musicalCharacteristics: [
      'Synthesized sounds',
      'Build-ups and drops',
      'Repetitive elements',
      'Energy waves',
      'Electronic textures',
    ],
    vocalStyle: ['Energetic', 'Processed', 'Repetitive', 'Catchy'],
    lyricPromptEnhancer: (prompt) =>
      `Write Electronic dance music lyrics with repetitive, energetic hooks. ${prompt}. Keep it simple, catchy, and focused on energy and movement.`,
  },
  
  'Reggae': {
    name: 'Reggae',
    bpmRange: { min: 60, max: 90 },
    idealBpm: 75,
    themes: ['Peace', 'Unity', 'Love', 'Social justice', 'Freedom', 'Spirituality'],
    structure: ['Intro', 'Verse 1', 'Chorus', 'Verse 2', 'Chorus', 'Bridge', 'Chorus', 'Outro'],
    musicalCharacteristics: [
      'Off-beat rhythms',
      'Bass-heavy grooves',
      'Laid-back feel',
      'Syncopated guitar',
      'Steady one-drop beat',
    ],
    vocalStyle: ['Laid-back', 'Melodic', 'Conscious', 'Rhythmic'],
    lyricPromptEnhancer: (prompt) =>
      `Write Reggae lyrics with themes of peace, unity, and consciousness. ${prompt}. Make it laid-back, rhythmic, and socially aware with positive messages.`,
  },
};

/**
 * Get genre rules by name (fuzzy match)
 */
export function getGenreRules(genreName: string): GenreRules | null {
  const normalized = genreName.toLowerCase().trim();
  
  for (const [key, rules] of Object.entries(GENRE_RULES)) {
    if (key.toLowerCase().includes(normalized) || normalized.includes(rules.name.toLowerCase())) {
      return rules;
    }
  }
  
  return null;
}

/**
 * Get ideal BPM for multiple genres (returns average)
 */
export function getIdealBpmForGenres(genres: string[]): number {
  if (genres.length === 0) return 120; // Default BPM
  
  const bpms = genres
    .map(genre => getGenreRules(genre)?.idealBpm)
    .filter((bpm): bpm is number => bpm !== undefined);
  
  if (bpms.length === 0) return 120;
  
  return Math.round(bpms.reduce((sum, bpm) => sum + bpm, 0) / bpms.length);
}

/**
 * Enhance lyric generation prompt with genre-specific guidance
 */
export function enhanceLyricPromptWithGenre(basePrompt: string, genres: string[]): string {
  if (genres.length === 0) return basePrompt;
  
  // Get rules for first genre
  const primaryGenreRules = getGenreRules(genres[0]);
  
  if (!primaryGenreRules) return basePrompt;
  
  return primaryGenreRules.lyricPromptEnhancer(basePrompt);
}

/**
 * Get genre recommendations based on prompt
 */
export function getGenreRecommendations(prompt: string): string[] {
  const lowerPrompt = prompt.toLowerCase();
  const recommendations: string[] = [];
  
  // Keyword-based genre detection
  if (lowerPrompt.includes('love') || lowerPrompt.includes('romantic') || lowerPrompt.includes('heart')) {
    recommendations.push('R&B', 'Pop', 'Kompa (Haiti)');
  }
  
  if (lowerPrompt.includes('dance') || lowerPrompt.includes('party') || lowerPrompt.includes('club')) {
    recommendations.push('Afrobeats', 'Electronic', 'Pop');
  }
  
  if (lowerPrompt.includes('street') || lowerPrompt.includes('struggle') || lowerPrompt.includes('real')) {
    recommendations.push('Hip-Hop', 'Drill');
  }
  
  if (lowerPrompt.includes('faith') || lowerPrompt.includes('god') || lowerPrompt.includes('worship')) {
    recommendations.push('Gospel');
  }
  
  if (lowerPrompt.includes('peace') || lowerPrompt.includes('unity') || lowerPrompt.includes('freedom')) {
    recommendations.push('Reggae', 'Gospel');
  }
  
  if (lowerPrompt.includes('haiti') || lowerPrompt.includes('haitian') || lowerPrompt.includes('creole')) {
    recommendations.push('Kompa (Haiti)', 'Rabòday', 'Zouk');
  }
  
  // Return top 3 recommendations, or default genres
  return recommendations.slice(0, 3).length > 0 
    ? recommendations.slice(0, 3) 
    : ['Pop', 'Hip-Hop', 'R&B'];
}
