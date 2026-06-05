import { describe, expect, it } from 'vitest';
import {
  applyStructureTemplate,
  createChorusBlock,
  enhancePrompt,
  getGenreSuggestions,
  getMoodSuggestions,
  getRhymeHelper,
  getSmartAutocomplete,
} from './lyricsStudioAssistant';

describe('lyricsStudioAssistant', () => {
  it('enhances prompt with genre and mood context', () => {
    const enhanced = enhancePrompt('A song about hope', 'Pop', 'Uplifting');
    expect(enhanced).toContain('Pop');
    expect(enhanced).toContain('uplifting');
  });

  it('suggests genres from prompt keywords', () => {
    const genres = getGenreSuggestions('Need an 808 trap street banger');
    expect(genres).toContain('Trap');
  });

  it('suggests moods from prompt keywords', () => {
    const moods = getMoodSuggestions('A lonely midnight memory song');
    expect(moods).toContain('Melancholic');
  });

  it('creates autocomplete options', () => {
    const suggestions = getSmartAutocomplete('Write a song about');
    expect(suggestions.length).toBeGreaterThan(0);
  });

  it('creates chorus blocks', () => {
    const chorus = createChorusBlock('city lights forever', 'Energetic');
    expect(chorus).toContain('[Chorus]');
  });

  it('returns structure template', () => {
    expect(applyStructureTemplate('pop')).toContain('[Verse 1]');
  });

  it('returns rhyme helper matches', () => {
    expect(getRhymeHelper('night')).toEqual(['light', 'night', 'fight', 'flight']);
  });
});
