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

  it('creates autocomplete options and chorus blocks', () => {
    const suggestions = getSmartAutocomplete('Write a song about');
    expect(suggestions.length).toBeGreaterThan(0);
    const chorus = createChorusBlock('city lights forever', 'Energetic');
    expect(chorus).toContain('[Chorus]');
  });

  it('returns structure template and rhyme helper defaults', () => {
    expect(applyStructureTemplate('pop')).toContain('[Verse 1]');
    expect(getRhymeHelper('night').length).toBeGreaterThan(0);
  });
});
