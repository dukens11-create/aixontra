'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { lyricAnalyzer } from '@/lib/services/lyricAnalyzer';
import { rhymeEngine } from '@/lib/services/rhymeEngine';
import { LANGUAGES } from '@/lib/constants';
import { SUPPORTED_GENRES } from '@/lib/platform/demoData';
import {
  PROMPT_TEMPLATES,
  SONG_STRUCTURE_TEMPLATES,
  applyStructureTemplate,
  createChorusBlock,
  createHookLine,
  enhancePrompt,
  getGenreSuggestions,
  getMoodSuggestions,
  getRewriteSuggestions,
  getRhymeHelper,
  getSmartAutocomplete,
} from '@/lib/services/lyricsStudioAssistant';

const AUTO_SAVE_KEY = 'aixontra:lyrics-studio-draft';
const MAX_TEMPLATE_PREVIEW_LENGTH = 22;

type StructureTemplate = keyof typeof SONG_STRUCTURE_TEMPLATES;

const moods = ['Uplifting', 'Romantic', 'Cinematic', 'Dark', 'Energetic', 'Melancholic'] as const;
const INITIAL_PROMPT = 'A bilingual anthem about hope after heartbreak.';
const INITIAL_LYRICS = '[Verse 1]\nI carried storms inside my hands\nTill your voice taught me to stand';
const INITIAL_GENRE = SUPPORTED_GENRES[0];
const INITIAL_MOOD = moods[0];
const INITIAL_LANGUAGE = LANGUAGES[0].name;

function formatSaveTime() {
  return new Date().toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export default function LyricsStudioPage() {
  const [prompt, setPrompt] = useState(INITIAL_PROMPT);
  const [lyrics, setLyrics] = useState(INITIAL_LYRICS);
  const [genre, setGenre] = useState<string>(INITIAL_GENRE);
  const [mood, setMood] = useState<string>(INITIAL_MOOD);
  const [language, setLanguage] = useState<string>(INITIAL_LANGUAGE);
  const [loading, setLoading] = useState(false);
  const [autoSaveLabel, setAutoSaveLabel] = useState('Not saved yet');
  const [activeLine, setActiveLine] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<StructureTemplate>('standard');
  const [rhymeWord, setRhymeWord] = useState('light');
  const [isAssistantOpen, setIsAssistantOpen] = useState(true);

  const lyricScore = useMemo(() => lyricAnalyzer.analyzeLyrics(lyrics), [lyrics]);
  const flow = useMemo(() => rhymeEngine.analyzeFlow(lyrics, 110), [lyrics]);
  const smartAutocomplete = useMemo(() => getSmartAutocomplete(prompt), [prompt]);
  const rewriteSuggestions = useMemo(() => getRewriteSuggestions(prompt), [prompt]);
  const genreSuggestions = useMemo(() => getGenreSuggestions(prompt), [prompt]);
  const moodSuggestions = useMemo(() => getMoodSuggestions(prompt), [prompt]);
  const rhymeSuggestions = useMemo(() => getRhymeHelper(rhymeWord), [rhymeWord]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const rawDraft = window.localStorage.getItem(AUTO_SAVE_KEY);
    if (!rawDraft) return;

    try {
      const draft = JSON.parse(rawDraft) as {
        prompt: string;
        lyrics: string;
        genre: string;
        mood: string;
        language: string;
      };
      setPrompt(draft.prompt ?? INITIAL_PROMPT);
      setLyrics(draft.lyrics ?? INITIAL_LYRICS);
      setGenre(draft.genre ?? INITIAL_GENRE);
      setMood(draft.mood ?? INITIAL_MOOD);
      setLanguage(draft.language ?? INITIAL_LANGUAGE);
      setAutoSaveLabel('Draft restored');
    } catch {
      setAutoSaveLabel('Could not restore draft');
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const timeout = window.setTimeout(() => {
      window.localStorage.setItem(
        AUTO_SAVE_KEY,
        JSON.stringify({ prompt, lyrics, genre, mood, language }),
      );
      setAutoSaveLabel(`Auto-saved at ${formatSaveTime()}`);
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [prompt, lyrics, genre, mood, language]);

  const handleGenerateLyrics = async (section: 'full' | 'verse' | 'chorus') => {
    setLoading(true);
    const sectionPrompt =
      section === 'verse'
        ? `${prompt} Generate one fresh verse only.`
        : section === 'chorus'
          ? `${prompt} Generate one catchy chorus only.`
          : prompt;

    try {
      const response = await fetch('/api/generate/lyrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: sectionPrompt, genre, mood, language }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Failed to generate lyrics');

      if (section === 'full') {
        setLyrics(data.lyrics);
      } else {
        const heading = section === 'verse' ? '[Verse]' : '[Chorus]';
        const updatedLyrics = [lyrics.trim(), `${heading}\n${data.lyrics}`].filter(Boolean).join('\n\n');
        setLyrics(updatedLyrics);
      }
      toast.success('Lyrics generated');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Generation failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSyllableBalance = () => {
    const adjustmentHints = flow.syllableDistribution
      .map((count, index) => ({ count, index }))
      .filter(({ count }) => Math.abs(count - flow.averageSyllablesPerLine) >= 4)
      .map(({ index, count }) => `Line ${index + 1}: ${count} syllables`);

    if (adjustmentHints.length === 0) {
      toast.success('Syllables look balanced.');
      return;
    }

    toast(`Balance suggestions: ${adjustmentHints.slice(0, 3).join(' • ')}`, { icon: '🎯' });
  };

  const handleSaveDraft = () => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify({ prompt, lyrics, genre, mood, language }));
    setAutoSaveLabel(`Saved at ${formatSaveTime()}`);
    toast.success('Draft saved');
  };

  const lines = lyrics.split('\n');

  return (
    <div className="mx-auto max-w-6xl space-y-4 pb-10 text-slate-100">
      <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-5 shadow-xl">
        <h1 className="text-3xl font-black tracking-tight">AI Lyrics Studio</h1>
        <p className="mt-2 text-sm text-slate-300">
          Split-editor songwriting workspace with generation, multilingual support, rhyme tools, tone analysis, and auto-save.
        </p>
        <p className="mt-2 text-xs text-cyan-300">{autoSaveLabel}</p>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <section className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/80 p-4">
          <label className="block text-sm font-semibold">Prompt</label>
          <textarea className="textarea min-h-28 bg-black/40" value={prompt} onChange={(event) => setPrompt(event.target.value)} />

          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn" onClick={() => setPrompt(enhancePrompt(prompt, genre, mood))}>Improve Prompt</button>
            <button type="button" className="btn secondary" onClick={() => setLyrics((prev) => `${prev}\n\n[Hook]\n${createHookLine(prompt, mood)}`)}>Hook Generator</button>
            <button type="button" className="btn secondary" onClick={() => setLyrics((prev) => `${prev}\n\n${createChorusBlock(prompt, mood)}`)}>Chorus Generator</button>
            <button type="button" className="btn secondary" onClick={handleSaveDraft}>Save Draft</button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <select className="select" value={genre} onChange={(event) => setGenre(event.target.value)}>
              {SUPPORTED_GENRES.map((entry) => <option key={entry}>{entry}</option>)}
            </select>
            <select className="select" value={mood} onChange={(event) => setMood(event.target.value)}>
              {moods.map((entry) => <option key={entry}>{entry}</option>)}
            </select>
            <select className="select" value={language} onChange={(event) => setLanguage(event.target.value)}>
              {LANGUAGES.map((entry) => <option key={entry.code} value={entry.name}>{entry.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <button type="button" className="btn" onClick={() => handleGenerateLyrics('full')} disabled={loading}>{loading ? 'Generating...' : 'AI Lyric Generation'}</button>
            <button type="button" className="btn secondary" onClick={() => handleGenerateLyrics('verse')} disabled={loading}>Verse Generation</button>
            <button type="button" className="btn secondary" onClick={() => handleGenerateLyrics('chorus')} disabled={loading}>Chorus Generation</button>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/30 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold">Song Structure Templates</span>
              <button type="button" className="badge" onClick={() => setLyrics((prev) => `${applyStructureTemplate(selectedTemplate)}\n\n${prev}`)}>Insert Template</button>
            </div>
            <select className="select" value={selectedTemplate} onChange={(event) => setSelectedTemplate(event.target.value as StructureTemplate)}>
              <option value="standard">Standard</option>
              <option value="pop">Pop</option>
              <option value="storytelling">Storytelling</option>
            </select>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/30 p-3 text-sm">
            <p className="font-semibold">Rhyme Engine + Syllable Balancing</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <input className="input max-w-[180px] bg-black/40" value={rhymeWord} onChange={(event) => setRhymeWord(event.target.value)} placeholder="Rhyme helper" />
              {rhymeSuggestions.map((item) => <button key={item} type="button" className="badge">{item}</button>)}
            </div>
            <p className="mt-2 text-xs text-slate-300">Rhyme scheme: {flow.rhymeScheme || 'N/A'} • Avg syllables/line: {flow.averageSyllablesPerLine}</p>
            <button type="button" className="btn secondary mt-2" onClick={handleSyllableBalance}>Syllable Balancing</button>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/30 p-3 text-sm">
            <p className="font-semibold">Emotional Tone Analysis</p>
            <p className="mt-2">Overall: <span className="text-cyan-300">{lyricScore.overall}</span> • Emotion: {lyricScore.emotion} • Imagery: {lyricScore.imagery}</p>
            {lyricScore.poeticDevices.length > 0 && (
              <p className="mt-1 text-xs text-slate-300">Devices: {lyricScore.poeticDevices.join(', ')}</p>
            )}
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/80 p-4">
          <h2 className="text-lg font-bold">Lyrics Editor</h2>
          <textarea className="textarea min-h-[360px] bg-black/50 font-mono text-sm leading-7" value={lyrics} onChange={(event) => setLyrics(event.target.value)} />
          <div className="rounded-xl border border-white/10 bg-black/30 p-3">
            <p className="mb-2 text-sm font-semibold">Line Highlighting Preview</p>
            <div className="max-h-56 space-y-1 overflow-y-auto text-xs">
              {lines.map((line, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveLine(index)}
                  className={`block w-full rounded px-2 py-1 text-left ${activeLine === index ? 'bg-cyan-500/20 text-cyan-200' : 'text-slate-300'}`}
                >
                  {index + 1}. {line || ' '}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      <button
        type="button"
        onClick={() => setIsAssistantOpen((open) => !open)}
        className="fixed bottom-24 right-4 z-50 rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg"
      >
        {isAssistantOpen ? 'Hide AI Helper' : 'AI Helper'}
      </button>

      {isAssistantOpen && (
        <aside className="fixed bottom-40 right-4 z-50 w-[320px] space-y-3 rounded-2xl border border-cyan-400/30 bg-slate-950/95 p-4 shadow-2xl">
          <p className="text-sm font-bold text-cyan-200">Floating AI Prompt Assistant</p>

          <div>
            <p className="text-xs text-slate-400">Quick prompt chips</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {PROMPT_TEMPLATES.map((template) => (
                <button key={template} type="button" className="badge" onClick={() => setPrompt(template)}>
                  {template.slice(0, MAX_TEMPLATE_PREVIEW_LENGTH)}...
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-400">Genre + mood suggestions</p>
            <p className="mt-1 text-xs">Genres: {genreSuggestions.join(', ')}</p>
            <p className="text-xs">Moods: {moodSuggestions.join(', ')}</p>
          </div>

          <div>
            <p className="text-xs text-slate-400">Smart autocomplete</p>
            <div className="mt-1 space-y-1">
              {smartAutocomplete.map((entry) => (
                <button key={entry} type="button" className="block w-full rounded bg-white/5 px-2 py-1 text-left text-xs" onClick={() => setPrompt(entry)}>
                  {entry}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-400">Rewrite suggestions</p>
            <div className="mt-1 space-y-1">
              {rewriteSuggestions.map((entry) => (
                <button key={entry} type="button" className="block w-full rounded bg-white/5 px-2 py-1 text-left text-xs" onClick={() => setPrompt(entry)}>
                  {entry}
                </button>
              ))}
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
