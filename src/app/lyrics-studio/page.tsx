'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { LANGUAGES } from '@/lib/constants';
import { rhymeEngine } from '@/lib/services/rhymeEngine';
import { lyricAnalyzer } from '@/lib/services/lyricAnalyzer';

const DRAFT_KEY = 'aixontra:lyrics-studio:draft';

const SONG_STRUCTURE_TEMPLATES = [
  '[Verse 1]\n\n[Pre-Chorus]\n\n[Chorus]\n\n[Verse 2]\n\n[Bridge]\n\n[Chorus]\n\n[Outro]',
  '[Intro]\n\n[Verse 1]\n\n[Chorus]\n\n[Verse 2]\n\n[Chorus]\n\n[Hook]\n\n[Outro]',
  '[Verse 1]\n\n[Chorus]\n\n[Verse 2]\n\n[Chorus]\n\n[Bridge]\n\n[Final Chorus]',
] as const;

type GenerationMode = 'lyrics' | 'verse' | 'chorus';

export default function LyricsStudioPage() {
  const [prompt, setPrompt] = useState('Write an uplifting afro-futuristic anthem about rebuilding after storms.');
  const [lyrics, setLyrics] = useState('[Verse 1]\nSky opens wide, we rise in neon rain\n');
  const [language, setLanguage] = useState('English');
  const [mood, setMood] = useState('Uplifting');
  const [genre, setGenre] = useState('Afrobeat');
  const [bpm, setBpm] = useState(110);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [activeLine, setActiveLine] = useState(0);

  const persistDraft = useCallback((nextTimestamp?: string) => {
    const timestamp = nextTimestamp ?? new Date().toISOString();
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ prompt, lyrics, language, mood, genre, bpm, savedAt: timestamp }));
    setSavedAt(timestamp);
  }, [prompt, lyrics, language, mood, genre, bpm]);

  useEffect(() => {
    const rawDraft = localStorage.getItem(DRAFT_KEY);
    if (!rawDraft) return;
    try {
      const parsed: unknown = JSON.parse(rawDraft);
      if (!parsed || typeof parsed !== 'object') return;
      const draft = parsed as Record<string, unknown>;
      if (typeof draft.prompt === 'string') setPrompt(draft.prompt);
      if (typeof draft.lyrics === 'string') setLyrics(draft.lyrics);
      if (typeof draft.language === 'string') setLanguage(draft.language);
      if (typeof draft.mood === 'string') setMood(draft.mood);
      if (typeof draft.genre === 'string') setGenre(draft.genre);
      if (typeof draft.bpm === 'number') setBpm(draft.bpm);
      if (typeof draft.savedAt === 'string') setSavedAt(draft.savedAt);
    } catch {
      localStorage.removeItem(DRAFT_KEY);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      persistDraft();
    }, 600);
    return () => clearTimeout(timeout);
  }, [persistDraft]);

  const flow = useMemo(() => rhymeEngine.analyzeFlow(lyrics, bpm), [lyrics, bpm]);
  const tone = useMemo(() => lyricAnalyzer.analyzeLyrics(lyrics), [lyrics]);

  const runGenerator = async (mode: GenerationMode) => {
    setError('');
    setLoading(true);
    try {
      const modePrompt = mode === 'lyrics'
        ? prompt
        : `${prompt}\n\nGenerate only a [${mode === 'verse' ? 'Verse 1' : 'Chorus'}] section that fits this song.`;
      const response = await fetch('/api/generate/lyrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: modePrompt, genre, mood, language }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Generation failed');
      const shouldAppend = mode !== 'lyrics';
      setLyrics((current) => (shouldAppend ? `${current.trim()}\n\n${data.lyrics}`.trim() : data.lyrics));
    } catch (generationError: unknown) {
      setError(generationError instanceof Error ? generationError.message : 'Failed to generate lyrics');
    } finally {
      setLoading(false);
    }
  };

  const onEditorCursorMove = (value: string, selectionStart: number) => {
    setLyrics(value);
    const beforeCursor = value.slice(0, selectionStart);
    setActiveLine(beforeCursor.split('\n').length - 1);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-4 pb-8">
      <div className="card border border-cyan-400/20 bg-black/70 backdrop-blur">
        <h1 className="hero-title text-left text-3xl">AI Lyrics Studio</h1>
        <p className="muted mt-2">Generate lyrics, verses, and choruses with structure-aware songwriting tools.</p>
        <p className="mt-2 text-xs text-cyan-100">Auto-save: {savedAt ? new Date(savedAt).toLocaleTimeString() : 'waiting for edits...'}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card space-y-4 border border-white/10 bg-black/60">
          <label className="block text-sm font-semibold">Prompt</label>
          <textarea className="textarea min-h-32" value={prompt} onChange={(event) => setPrompt(event.target.value)} />

          <div className="grid grid-cols-2 gap-3">
            <input className="input" value={genre} onChange={(event) => setGenre(event.target.value)} placeholder="Genre" />
            <input className="input" value={mood} onChange={(event) => setMood(event.target.value)} placeholder="Mood" />
            <select className="select" value={language} onChange={(event) => setLanguage(event.target.value)}>
              {LANGUAGES.map((entry) => <option key={entry.code} value={entry.name}>{entry.name}</option>)}
            </select>
            <label className="text-sm">BPM: {bpm}
              <input className="mt-1 w-full" type="range" min={70} max={170} value={bpm} onChange={(event) => setBpm(Number(event.target.value))} />
            </label>
          </div>

          <div className="row flex-wrap">
            <button type="button" className="btn" disabled={loading} onClick={() => runGenerator('lyrics')}>AI Lyric Generation</button>
            <button type="button" className="btn secondary" disabled={loading} onClick={() => runGenerator('verse')}>Verse Generation</button>
            <button type="button" className="btn secondary" disabled={loading} onClick={() => runGenerator('chorus')}>Chorus Generation</button>
          </div>
          {error && <p className="text-sm text-red-300">{error}</p>}

          <div className="space-y-2">
            <p className="text-sm font-semibold">Song structure templates</p>
            <div className="grid gap-2">
              {SONG_STRUCTURE_TEMPLATES.map((template) => (
                <button key={template} type="button" className="badge text-left" onClick={() => setLyrics(template)}>
                  {template.split('\n').filter(Boolean).join(' → ')}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-sm">
            <p className="font-semibold">Emotional tone analysis</p>
            <p className="mt-2">Overall tone score: <span className="text-cyan-200">{tone.overall}</span>/100</p>
            <p>Emotion: {tone.emotion} · Imagery: {tone.imagery} · Coherence: {tone.coherence}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-sm">
            <p className="font-semibold">Rhyme + syllable balancing</p>
            <p className="mt-2">Rhyme scheme: {flow.rhymeScheme || 'N/A'}</p>
            <p>Average syllables/line: {flow.averageSyllablesPerLine}</p>
            <p>Flow score: {flow.flowScore}/100</p>
          </div>
        </section>

        <section className="card space-y-3 border border-white/10 bg-black/75">
          <p className="text-sm font-semibold">Lyrics editor</p>
          <textarea
            className="textarea min-h-[28rem] font-mono"
            value={lyrics}
            onChange={(event) => onEditorCursorMove(event.target.value, event.target.selectionStart)}
            onClick={(event) => onEditorCursorMove(lyrics, (event.target as HTMLTextAreaElement).selectionStart)}
            onKeyUp={(event) => onEditorCursorMove(lyrics, (event.target as HTMLTextAreaElement).selectionStart)}
          />
          <div className="rounded-xl border border-white/10 bg-black/40 p-3">
            <p className="mb-2 text-sm font-semibold">Line highlighting preview</p>
            <div className="max-h-64 overflow-auto font-mono text-sm">
              <div className="space-y-1">
                {lyrics.split('\n').map((line, index) => (
                  <p
                    key={index}
                    aria-label={index === activeLine ? `Active line ${index + 1}` : `Line ${index + 1}`}
                    className={index === activeLine ? 'rounded border-l-2 border-cyan-300 bg-cyan-400/20 px-2 py-0.5 text-cyan-100' : 'px-2 py-0.5 text-slate-200'}
                  >
                    {index === activeLine ? '▶ ' : ''}
                    {line || ' '}
                  </p>
                ))}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn secondary"
            onClick={() => {
              persistDraft();
            }}
          >
            Save lyric draft
          </button>
        </section>
      </div>
    </div>
  );
}
