import { describe, expect, it } from 'vitest';
import {
  enhancePrompt,
  generateChorus,
  generateHook,
  lyricHelper,
  rewriteSuggestions,
  rhymeHelper,
  smartAutocomplete,
  suggestGenres,
  suggestMoods,
} from './promptAssistant';

describe('promptAssistant', () => {
  it('enhances prompt with creative constraints', () => {
    const enhanced = enhancePrompt('write a city anthem', 'Hip-Hop', 'Energetic');
    expect(enhanced).toContain('Hip-Hop production');
    expect(enhanced).toContain('strong melodic hook');
  });

  it('provides helper outputs', () => {
    expect(generateHook('midnight lights and rhythm')).toContain('Hook idea');
    expect(generateChorus('midnight lights and rhythm', 'Cinematic')).toContain('[Chorus]');
    expect(rhymeHelper('night')).toEqual(expect.arrayContaining(['light', 'bright']));
    expect(lyricHelper('city lights and freedom')[0]).toContain('Start with a concrete visual');
  });

  it('supports suggestions and smart autocomplete', () => {
    expect(suggestGenres('make an afrobeats summer anthem').length).toBeGreaterThan(0);
    expect(suggestMoods('I need dark cinematic vibes')).toEqual(expect.arrayContaining(['Cinematic', 'Dark']));
    expect(smartAutocomplete('make a dance song')[0]).toContain('make a dance song');
    expect(rewriteSuggestions('a club banger', 'EDM', 'Energetic').length).toBeGreaterThan(0);
  });
});
