import { describe, expect, it } from 'vitest';
import {
  enhancePrompt,
  getRhymeSuggestions,
  getRewriteSuggestions,
  getSmartAutocomplete,
  generateHookIdea,
} from './promptAssistant';

describe('promptAssistant', () => {
  it('enhances non-empty prompts with composition guidance', () => {
    const enhanced = enhancePrompt('Build a futuristic kompa vibe', 'Kompa', 'Energetic', 'English');
    expect(enhanced).toContain('Build a futuristic kompa vibe');
    expect(enhanced).toContain('Kompa production');
    expect(enhanced).toContain('energetic emotion');
  });

  it('returns known rhyme suggestions', () => {
    expect(getRhymeSuggestions('night')).toEqual(expect.arrayContaining(['light', 'bright']));
    expect(getRhymeSuggestions('unknown')).toEqual([]);
  });

  it('creates rewrite and autocomplete suggestions', () => {
    const prompt = 'Create a viral afrobeat anthem';
    expect(getRewriteSuggestions(prompt)).toHaveLength(3);
    expect(getSmartAutocomplete(prompt).length).toBeGreaterThan(0);
  });

  it('generates hook text using prompt context', () => {
    const hook = generateHookIdea('Neon city lights and midnight rhythm', 'Cinematic');
    expect(hook).toContain('Hook idea');
    expect(hook).toContain('cinematic cadence');
  });
});
