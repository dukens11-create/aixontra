export const STEM_KEYS = ['vocals', 'drums', 'bass', 'melody'] as const;

export type StemKey = (typeof STEM_KEYS)[number];

export interface StemMixState {
  muted: boolean;
  solo: boolean;
}

export interface ChorusReplacement {
  start: number;
  end: number;
  replacementPrompt: string;
}

export interface AudioEditorState {
  duration: number;
  cursor: number;
  trimStart: number;
  trimEnd: number;
  splits: number[];
  fadeIn: number;
  fadeOut: number;
  volume: number;
  stems: Record<StemKey, StemMixState>;
  vocalIsolationRequested: boolean;
  chorusReplacement: ChorusReplacement | null;
  lastSavedAt: string | null;
}

export interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const clampToDuration = (value: number, duration: number) => clamp(value, 0, Math.max(duration, 0));

const defaultStems = (): Record<StemKey, StemMixState> => ({
  vocals: { muted: false, solo: false },
  drums: { muted: false, solo: false },
  bass: { muted: false, solo: false },
  melody: { muted: false, solo: false },
});

export function createInitialAudioEditorState(duration = 0): AudioEditorState {
  const normalizedDuration = Math.max(duration, 0);
  return {
    duration: normalizedDuration,
    cursor: 0,
    trimStart: 0,
    trimEnd: normalizedDuration,
    splits: [],
    fadeIn: 0,
    fadeOut: 0,
    volume: 1,
    stems: defaultStems(),
    vocalIsolationRequested: false,
    chorusReplacement: null,
    lastSavedAt: null,
  };
}

export function setDuration(state: AudioEditorState, duration: number): AudioEditorState {
  const normalizedDuration = Math.max(duration, 0);
  const trimStart = clampToDuration(state.trimStart, normalizedDuration);
  const trimEnd = clampToDuration(Math.max(state.trimEnd, trimStart), normalizedDuration);
  return {
    ...state,
    duration: normalizedDuration,
    cursor: clampToDuration(state.cursor, normalizedDuration),
    trimStart,
    trimEnd,
    splits: state.splits.filter((split) => split >= trimStart && split <= trimEnd && split <= normalizedDuration),
    fadeIn: clampToDuration(state.fadeIn, trimEnd - trimStart),
    fadeOut: clampToDuration(state.fadeOut, trimEnd - trimStart),
    chorusReplacement: state.chorusReplacement
      ? {
          ...state.chorusReplacement,
          start: clampToDuration(state.chorusReplacement.start, normalizedDuration),
          end: clampToDuration(state.chorusReplacement.end, normalizedDuration),
        }
      : null,
  };
}

export function setCursor(state: AudioEditorState, cursor: number): AudioEditorState {
  return { ...state, cursor: clampToDuration(cursor, state.duration) };
}

export function setTrimRange(state: AudioEditorState, start: number, end: number): AudioEditorState {
  const normalizedStart = clampToDuration(Math.min(start, end), state.duration);
  const normalizedEnd = clampToDuration(Math.max(start, end), state.duration);
  const span = normalizedEnd - normalizedStart;
  return {
    ...state,
    trimStart: normalizedStart,
    trimEnd: normalizedEnd,
    cursor: clamp(state.cursor, normalizedStart, normalizedEnd),
    splits: state.splits.filter((split) => split > normalizedStart && split < normalizedEnd),
    fadeIn: clampToDuration(state.fadeIn, span),
    fadeOut: clampToDuration(state.fadeOut, span),
  };
}

export function splitAtCursor(state: AudioEditorState): AudioEditorState {
  const point = clamp(state.cursor, state.trimStart, state.trimEnd);
  if (point <= state.trimStart || point >= state.trimEnd) {
    return state;
  }

  const exists = state.splits.some((split) => Math.abs(split - point) < 0.05);
  if (exists) {
    return state;
  }

  return {
    ...state,
    splits: [...state.splits, Number(point.toFixed(3))].sort((a, b) => a - b),
  };
}

export function setFadeIn(state: AudioEditorState, fadeIn: number): AudioEditorState {
  const maxFade = Math.max(state.trimEnd - state.trimStart, 0);
  return {
    ...state,
    fadeIn: clampToDuration(fadeIn, maxFade),
  };
}

export function setFadeOut(state: AudioEditorState, fadeOut: number): AudioEditorState {
  const maxFade = Math.max(state.trimEnd - state.trimStart, 0);
  return {
    ...state,
    fadeOut: clampToDuration(fadeOut, maxFade),
  };
}

export function setVolume(state: AudioEditorState, volume: number): AudioEditorState {
  return {
    ...state,
    volume: clamp(volume, 0, 2),
  };
}

export function toggleStemMute(state: AudioEditorState, stem: StemKey): AudioEditorState {
  return {
    ...state,
    stems: {
      ...state.stems,
      [stem]: { ...state.stems[stem], muted: !state.stems[stem].muted },
    },
  };
}

export function toggleStemSolo(state: AudioEditorState, stem: StemKey): AudioEditorState {
  return {
    ...state,
    stems: {
      ...state.stems,
      [stem]: { ...state.stems[stem], solo: !state.stems[stem].solo },
    },
  };
}

export function requestVocalIsolation(state: AudioEditorState): AudioEditorState {
  return {
    ...state,
    vocalIsolationRequested: true,
  };
}

export function replaceChorus(
  state: AudioEditorState,
  start: number,
  end: number,
  replacementPrompt: string,
): AudioEditorState {
  const normalizedStart = clampToDuration(Math.min(start, end), state.duration);
  const normalizedEnd = clampToDuration(Math.max(start, end), state.duration);

  return {
    ...state,
    chorusReplacement: {
      start: normalizedStart,
      end: normalizedEnd,
      replacementPrompt: replacementPrompt.trim(),
    },
  };
}

export function markSaved(state: AudioEditorState): AudioEditorState {
  return {
    ...state,
    lastSavedAt: new Date().toISOString(),
  };
}

export function createHistoryState<T>(initialState: T): HistoryState<T> {
  return {
    past: [],
    present: initialState,
    future: [],
  };
}

export function pushHistoryState<T>(history: HistoryState<T>, nextState: T): HistoryState<T> {
  if (JSON.stringify(history.present) === JSON.stringify(nextState)) {
    return history;
  }

  return {
    past: [...history.past, history.present],
    present: nextState,
    future: [],
  };
}

export function undoHistoryState<T>(history: HistoryState<T>): HistoryState<T> {
  if (history.past.length === 0) {
    return history;
  }

  const previous = history.past[history.past.length - 1];
  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future],
  };
}

export function redoHistoryState<T>(history: HistoryState<T>): HistoryState<T> {
  if (history.future.length === 0) {
    return history;
  }

  const [next, ...rest] = history.future;
  return {
    past: [...history.past, history.present],
    present: next,
    future: rest,
  };
}

export function getTimelineSections(state: AudioEditorState): Array<{ start: number; end: number }> {
  const points = [state.trimStart, ...state.splits, state.trimEnd].sort((a, b) => a - b);
  const sections: Array<{ start: number; end: number }> = [];

  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index];
    const end = points[index + 1];
    if (end > start) {
      sections.push({ start, end });
    }
  }

  return sections;
}
