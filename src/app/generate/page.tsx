'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { usePlayerStore } from '@/stores/playerStore';
import { DEMO_AUDIO_URL, SUPPORTED_GENRES, SUPPORTED_LANGUAGES, songs } from '@/lib/platform/demoData';
import { toTrack } from '@/lib/platform/toTrack';
import { PLAN_CAPABILITIES, SubscriptionPlan } from '@/lib/platform/subscriptions';
import {
  QUICK_PROMPT_CHIPS,
  PROMPT_TEMPLATES,
  enhancePrompt,
  generateChorusIdea,
  generateHookIdea,
  getGenreSuggestions,
  getLyricHelper,
  getMoodSuggestions,
  getRewriteSuggestions,
  getRhymeSuggestions,
  getSmartAutocomplete,
} from '@/lib/platform/promptAssistant';

const moods = ['Cinematic', 'Romantic', 'Dark', 'Energetic', 'Uplifting', 'Melancholic'];
const vocalStyles = ['Female', 'Male', 'Duo', 'Choir', 'Robotic'];
const DEFAULT_TEMPLATE_THEME = 'new beginnings';

export default function GeneratePage() {
  const play = usePlayerStore((state) => state.play);
  const addToQueue = usePlayerStore((state) => state.addToQueue);

  const [prompt, setPrompt] = useState('A futuristic kompa anthem for late-night city drives.');
  const [lyrics, setLyrics] = useState('Nan lannwit la nou leve, limyè neon nan syèl la...');
  const [genre, setGenre] = useState<string>(SUPPORTED_GENRES[0]);
  const [mood, setMood] = useState(moods[0]);
  const [language, setLanguage] = useState<string>(SUPPORTED_LANGUAGES[0]);
  const [bpm, setBpm] = useState(110);
  const [vocalStyle, setVocalStyle] = useState(vocalStyles[0]);
  const [instrumentalOnly, setInstrumentalOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string>(DEMO_AUDIO_URL);
  const [wavUrl, setWavUrl] = useState<string | null>(null);
  const [stemsUrls, setStemsUrls] = useState<Partial<Record<'vocals' | 'drums' | 'bass' | 'melody' | 'instrumental' | 'fullMix', string>> | null>(null);
  const [masteredAudioUrl, setMasteredAudioUrl] = useState<string | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [creditBalance, setCreditBalance] = useState<number>(PLAN_CAPABILITIES.FREE.monthlyCredits);
  const [plan, setPlan] = useState<SubscriptionPlan>('FREE');
  const [targetDurationSeconds, setTargetDurationSeconds] = useState<number>(120);
  const [masteringPreset, setMasteringPreset] = useState<'LOUDNESS_NORMALIZATION' | 'CLEAN_MIX' | 'RADIO_READY'>('LOUDNESS_NORMALIZATION');
  const [voiceModelName, setVoiceModelName] = useState('My Voice Signature');
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [proofUrl, setProofUrl] = useState('');
  const [showPromptAssistant, setShowPromptAssistant] = useState(false);
  const [assistantOutput, setAssistantOutput] = useState('');
  const [rhymeWord, setRhymeWord] = useState('night');

  const formPayload = useMemo(
    () => ({ userId: 'demo-user', prompt, lyrics, genre, mood, language, bpm, vocalStyle, instrumentalOnly, targetDurationSeconds, masteringPreset }),
    [prompt, lyrics, genre, mood, language, bpm, vocalStyle, instrumentalOnly, targetDurationSeconds, masteringPreset],
  );

  const generate = async (mode: 'generate' | 'regenerate' | 'extend') => {
    setLoading(true);
    setProgress(15);
    try {
      const response = await fetch('/api/generate/song', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formPayload, mode }),
      });
      setProgress(65);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Failed to generate');
      setAudioUrl(data.audioUrl);
      setWavUrl(data.wavUrl ?? null);
      setStemsUrls(data.stemsUrls ?? null);
      setMasteredAudioUrl(data.masteredAudioUrl ?? null);
      setCreditBalance(data.creditBalance ?? creditBalance);
      setPlan(data.plan ?? plan);
      setDraftId(data.songDraft.id);
      setProgress(100);
      toast.success(data.message ?? 'Generation complete');
    } catch (error: any) {
      toast.error(error.message ?? 'Something went wrong');
    } finally {
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 350);
    }
  };

  const publishSong = async () => {
    if (!draftId) {
      toast.error('Generate a track first.');
      return;
    }
    const response = await fetch('/api/songs/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ draftId }),
    });
    const data = await response.json();
    if (!response.ok) {
      toast.error(data.error ?? 'Publish failed');
      return;
    }
    toast.success('Published to feed.');
  };

  const playPreview = () => {
    const track = toTrack({
      ...songs[0],
      id: draftId ?? songs[0].id,
      title: `Generated: ${genre} ${mood}`,
      prompt,
      lyrics,
      genre,
      mood,
      language,
      bpm,
      audioUrl,
    });
    addToQueue(track);
    play(track);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    generate('generate');
  };

  const submitVoiceModel = async () => {
    const response = await fetch('/api/voice-models/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'demo-user', name: voiceModelName, consentConfirmed, proofUrl }),
    });
    const data = await response.json();
    if (!response.ok) {
      toast.error(data.error ?? 'Voice model submission failed');
      return;
    }
    toast.success(data.message ?? 'Voice model submitted');
  };

  const requestUploadUrl = async (kind: 'cover' | 'video') => {
    const response = await fetch('/api/media/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'demo-user', kind, songId: draftId ?? undefined }),
    });
    const data = await response.json();
    if (!response.ok) {
      toast.error(data.error ?? 'Upload URL request failed');
      return;
    }
    navigator.clipboard.writeText(data.upload.uploadUrl).catch(() => undefined);
    toast.success(`Secure ${kind} upload URL generated and copied`);
  };

  const applyTemplate = (template: string) => {
    const themed = template
      .replace('{genre}', genre)
      .replace('{language}', language)
      .replace('{mood}', mood)
      .replace('{theme}', prompt.trim() || DEFAULT_TEMPLATE_THEME);
    setPrompt((current) => (current.trim() ? `${current} ${themed}` : themed));
  };

  const improvePrompt = () => {
    setPrompt((current) => enhancePrompt(current, genre, mood, language));
    setAssistantOutput('Prompt enhanced with style, mood, and language guidance.');
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5 pb-6">
      <div className="card bg-white/5 backdrop-blur-sm">
        <h1 className="hero-title text-left text-3xl">AIXENTRA Generator</h1>
        <p className="muted mt-2">Prompt-driven music generation with provider abstraction for future Suno/MusicGen swaps.</p>
        <p className="mt-3 text-sm text-cyan-200">You own your generations depending on your plan and license.</p>
        <div className="row mt-3">
          <span className="badge">Plan: {plan}</span>
          <span className="badge">Credits: {creditBalance}</span>
          <Link href="/lyrics-studio" className="badge">AI Lyrics Studio</Link>
        </div>
      </div>

      <form onSubmit={onSubmit} className="card space-y-4 bg-white/5 backdrop-blur-sm">
        <label className="block text-sm font-semibold">Prompt</label>
        <textarea className="textarea min-h-28" value={prompt} onChange={(event) => setPrompt(event.target.value)} required />
        <div className="row flex-wrap">
          {QUICK_PROMPT_CHIPS.map((chip) => (
            <button key={chip} type="button" className="badge" onClick={() => setPrompt((current) => `${current.trim()} ${chip}`.trim())}>
              {chip}
            </button>
          ))}
        </div>
        <button type="button" className="btn secondary" onClick={improvePrompt}>Improve Prompt</button>

        <label className="block text-sm font-semibold">Lyrics</label>
        <textarea className="textarea min-h-24" value={lyrics} onChange={(event) => setLyrics(event.target.value)} />

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <select className="select" value={genre} onChange={(event) => setGenre(event.target.value)}>
            {SUPPORTED_GENRES.map((entry) => <option key={entry}>{entry}</option>)}
          </select>
          <select className="select" value={mood} onChange={(event) => setMood(event.target.value)}>
            {moods.map((entry) => <option key={entry}>{entry}</option>)}
          </select>
          <select className="select" value={language} onChange={(event) => setLanguage(event.target.value)}>
            {SUPPORTED_LANGUAGES.map((entry) => <option key={entry}>{entry}</option>)}
          </select>
          <select className="select" value={vocalStyle} onChange={(event) => setVocalStyle(event.target.value)}>
            {vocalStyles.map((entry) => <option key={entry}>{entry}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">BPM: {bpm}
            <input type="range" min={70} max={180} value={bpm} onChange={(event) => setBpm(Number(event.target.value))} className="mt-2 w-full" />
          </label>
          <label className="row justify-between rounded-xl border border-white/10 px-3 py-2 text-sm">
            Instrumental only
            <input type="checkbox" checked={instrumentalOnly} onChange={(event) => setInstrumentalOnly(event.target.checked)} />
          </label>
          <label className="block text-sm">Length (seconds): {targetDurationSeconds}
            <input
              type="range"
              min={30}
              max={480}
              value={targetDurationSeconds}
              onChange={(event) => setTargetDurationSeconds(Number(event.target.value))}
              className="mt-2 w-full"
            />
          </label>
        </div>

        <label className="block text-sm font-semibold">Mastering preset</label>
        <select className="select" value={masteringPreset} onChange={(event) => setMasteringPreset(event.target.value as typeof masteringPreset)}>
          <option value="LOUDNESS_NORMALIZATION">Loudness normalization</option>
          <option value="CLEAN_MIX">Clean mix</option>
          <option value="RADIO_READY">Radio-ready master</option>
        </select>

        {loading && (
          <div className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 p-3 text-sm">Generating... {progress}%</div>
        )}

        <div className="row">
          <button type="submit" className="btn" disabled={loading}>Generate</button>
          <button type="button" className="btn secondary" onClick={() => generate('regenerate')} disabled={loading}>Regenerate</button>
          <button type="button" className="btn secondary" onClick={() => generate('extend')} disabled={loading}>Extend</button>
          <button type="button" className="btn secondary" onClick={() => window.open(audioUrl, '_blank', 'noopener,noreferrer')}>Download MP3</button>
          {wavUrl && <button type="button" className="btn secondary" onClick={() => window.open(wavUrl, '_blank', 'noopener,noreferrer')}>Download WAV</button>}
          <button type="button" className="btn" onClick={publishSong}>Publish</button>
        </div>
      </form>

      <div className="card bg-black/30">
        <h2>Preview</h2>
        <audio controls src={audioUrl} className="mt-3 w-full" />
        {masteredAudioUrl && (
          <div className="mt-3">
            <p className="muted">Mastered output</p>
            <audio controls src={masteredAudioUrl} className="mt-2 w-full" />
          </div>
        )}
        <div className="mt-3">
          <p className="text-sm font-semibold">Stems export</p>
          {stemsUrls ? (
            <div className="row mt-2">
              {Object.entries(stemsUrls).map(([key, value]) => (
                value ? <button key={key} className="badge" onClick={() => window.open(value, '_blank', 'noopener,noreferrer')}>{key}</button> : null
              ))}
            </div>
          ) : (
            <p className="muted mt-2">Stems become available on plans with stems export enabled.</p>
          )}
        </div>
        <div className="row mt-3">
          <button className="badge" onClick={() => requestUploadUrl('cover')}>Secure cover upload URL</button>
          <button className="badge" onClick={() => requestUploadUrl('video')}>Secure video upload URL</button>
        </div>
        <button className="btn mt-3" onClick={playPreview}>Play in global player</button>
      </div>

      <div className="card bg-black/30">
        <h2>Voice cloning consent</h2>
        <p className="muted mt-2">Consent + proof are required. Voice models remain private until admin approval.</p>
        <div className="mt-3 space-y-2">
          <input className="input" value={voiceModelName} onChange={(event) => setVoiceModelName(event.target.value)} placeholder="Voice model name" />
          <input className="input" value={proofUrl} onChange={(event) => setProofUrl(event.target.value)} placeholder="Proof or permission URL" />
          <label className="row text-sm">
            <input type="checkbox" checked={consentConfirmed} onChange={(event) => setConsentConfirmed(event.target.checked)} />
            I confirm I own this voice or have explicit permission.
          </label>
          <button className="btn secondary" onClick={submitVoiceModel}>Submit voice model for review</button>
        </div>
      </div>

      <button
        type="button"
        className="btn fixed bottom-24 right-5 z-50"
        onClick={() => setShowPromptAssistant((current) => !current)}
      >
        {showPromptAssistant ? 'Close AI Helper' : 'AI Helper'}
      </button>

      {showPromptAssistant && (
        <div className="card fixed bottom-40 right-5 z-50 w-[min(92vw,26rem)] space-y-3 border border-cyan-400/30 bg-black/85 backdrop-blur">
          <h3 className="text-lg font-semibold">Prompt Assistant</h3>
          <p className="muted text-xs">Templates, autocomplete, rewrite, and lyric ideation tools.</p>
          <div className="space-y-2">
            <p className="text-xs font-semibold">Prompt templates</p>
            <div className="grid gap-2">
              {PROMPT_TEMPLATES.map((template) => (
                <button key={template} type="button" className="badge text-left" onClick={() => applyTemplate(template)}>
                  {template}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold">Genre suggestions</p>
            <div className="row flex-wrap">
              {getGenreSuggestions(prompt).map((entry) => (
                <button key={entry} type="button" className="badge" onClick={() => setGenre(entry)}>{entry}</button>
              ))}
            </div>
            <p className="text-xs font-semibold">Mood suggestions</p>
            <div className="row flex-wrap">
              {getMoodSuggestions(prompt).map((entry) => (
                <button key={entry} type="button" className="badge" onClick={() => setMood(entry)}>{entry}</button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold">Smart autocomplete</p>
            <div className="grid gap-1">
              {getSmartAutocomplete(prompt).slice(0, 3).map((entry) => (
                <button key={entry} type="button" className="badge text-left" onClick={() => setPrompt((current) => `${current.trim()} ${entry}`.trim())}>
                  {entry}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className="btn secondary" onClick={() => setAssistantOutput(generateHookIdea(prompt, mood))}>Hook Generator</button>
            <button type="button" className="btn secondary" onClick={() => setAssistantOutput(generateChorusIdea(prompt))}>Chorus Generator</button>
            <button type="button" className="btn secondary" onClick={() => setAssistantOutput(getLyricHelper(prompt).join('\n'))}>Lyric Helper</button>
            <button type="button" className="btn secondary" onClick={() => setAssistantOutput(getRewriteSuggestions(prompt).join('\n'))}>Rewrite Suggestions</button>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold">Rhyme helper</label>
            <div className="row">
              <input className="input" value={rhymeWord} onChange={(event) => setRhymeWord(event.target.value)} />
              <button type="button" className="badge" onClick={() => setAssistantOutput(`Rhymes: ${getRhymeSuggestions(rhymeWord).join(', ') || 'No matches'}`)}>
                Find Rhymes
              </button>
            </div>
          </div>
          {assistantOutput && <pre aria-label="AI prompt assistant suggestions" className="max-h-36 overflow-auto rounded-xl border border-white/10 bg-black/50 p-2 text-xs whitespace-pre-wrap">{assistantOutput}</pre>}
        </div>
      )}
    </div>
  );
}
