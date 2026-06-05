import { describe, expect, it } from 'vitest';
import {
  createHistoryState,
  createInitialAudioEditorState,
  pushHistoryState,
  redoHistoryState,
  replaceChorus,
  requestVocalIsolation,
  setCursor,
  setFadeIn,
  setTrimRange,
  setVolume,
  splitAtCursor,
  undoHistoryState,
} from '@/lib/audioStudio/editorState';

describe('audio editor state operations', () => {
  it('clamps trim and fade values to the current edit span', () => {
    const initial = createInitialAudioEditorState(120);
    const trimmed = setTrimRange(initial, 10, 40);
    const withFade = setFadeIn(trimmed, 100);

    expect(withFade.trimStart).toBe(10);
    expect(withFade.trimEnd).toBe(40);
    expect(withFade.fadeIn).toBe(30);
  });

  it('splits at cursor only within trim boundaries without duplicates', () => {
    const initial = setTrimRange(createInitialAudioEditorState(120), 20, 100);
    const withCursor = setCursor(initial, 50);
    const firstSplit = splitAtCursor(withCursor);
    const duplicateSplit = splitAtCursor(firstSplit);

    expect(firstSplit.splits).toEqual([50]);
    expect(duplicateSplit.splits).toEqual([50]);
  });

  it('supports undo/redo across edit operations', () => {
    const base = createInitialAudioEditorState(90);
    const history0 = createHistoryState(base);
    const history1 = pushHistoryState(history0, setVolume(base, 1.5));
    const history2 = pushHistoryState(history1, setTrimRange(history1.present, 5, 60));

    expect(history2.present.volume).toBe(1.5);
    expect(history2.present.trimStart).toBe(5);

    const undone = undoHistoryState(history2);
    expect(undone.present.trimStart).toBe(0);

    const redone = redoHistoryState(undone);
    expect(redone.present.trimStart).toBe(5);
    expect(redone.present.trimEnd).toBe(60);
  });

  it('records chorus replacement and vocal isolation intent', () => {
    const state = createInitialAudioEditorState(100);
    const withChorus = replaceChorus(state, 15, 35, 'Replace with bilingual anthem hook');
    const withIsolation = requestVocalIsolation(withChorus);

    expect(withIsolation.chorusReplacement).toEqual({
      start: 15,
      end: 35,
      replacementPrompt: 'Replace with bilingual anthem hook',
    });
    expect(withIsolation.vocalIsolationRequested).toBe(true);
  });
});
