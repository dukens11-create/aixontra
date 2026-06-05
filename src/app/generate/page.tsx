'use client';

import { FormEvent, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { usePlayerStore } from '@/stores/playerStore';
import { DEMO_AUDIO_URL, SUPPORTED_GENRES, SUPPORTED_LANGUAGES, songs } from '@/lib/platform/demoData';
import { toTrack } from '@/lib/platform/toTrack';
import { PLAN_CAPABILITIES, SubscriptionPlan } from '@/lib/platform/subscriptions';
import {
  PROMPT_TEMPLATES,
  enhancePrompt,
  generateChorus,
  generateHook,
  lyricHelper,
  rewriteSuggestions,
  rhymeHelper,
  smartAutocomplete,
  suggestGenres,
  suggestMoods,
} from '@/lib/platform/promptAssistant';

const moods = ['Cinematic', 'Romantic', 'Dark', 'Energetic', 'Uplifting', 'Melancholic'];
const vocalStyles = ['Female', 'Male', 'Duo', 'Choir', 'Robotic'];

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
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantSeedWord, setAssistantSeedWord] = useState('night');
  const [assistantOutput, setAssistantOutput] = useState('');
  const [templateIndex, setTemplateIndex] = useState(0);

  const formPayload = useMemo(
    () => ({ userId: 'demo-user', prompt, lyrics, genre, mood, language, bpm, vocalStyle, instrumentalOnly, targetDurationSeconds, masteringPreset }),
    [prompt, lyrics, genre, mood, language, bpm, vocalStyle, instrumentalOnly, targetDurationSeconds, masteringPreset],
  );
  const quickPromptChips = useMemo(() => suggestGenres(prompt), [prompt]);
  const moodSuggestions = useMemo(() => suggestMoods(prompt), [prompt]);
  const rewrites = useMemo(() => rewriteSuggestions(prompt, genre, mood), [prompt, genre, mood]);
  const autocompleteSuggestions = useMemo(() => smartAutocomplete(prompt), [prompt]);
  const lyricTips = useMemo(() => lyricHelper(prompt), [prompt]);

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

  const applyTemplate = () => {
    const template = PROMPT_TEMPLATES[templateIndex % PROMPT_TEMPLATES.length]
      .replace('[genre]', genre.toLowerCase())
      .replace('[mood]', mood.toLowerCase());
    setPrompt(template);
    setTemplateIndex((value) => value + 1);
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

  return (
    <div className="mx-auto max-w-4xl space-y-5 pb-6">
      <div className="card bg-white/5 backdrop-blur-sm">
        <h1 className="hero-title text-left text-3xl">AIXENTRA Generator</h1>
        <p className="muted mt-2">Prompt-driven music generation with provider abstraction for future Suno/MusicGen swaps.</p>
        <p className="mt-3 text-sm text-cyan-200">You own your generations depending on your plan and license.</p>
        <div className="row mt-3">
          <span className="badge">Plan: {plan}</span>
          <span className="badge">Credits: {creditBalance}</span>
        </div>
      </div>

      <form onSubmit={onSubmit} className="card space-y-4 bg-white/5 backdrop-blur-sm">
        <div className="row items-center justify-between">
          <label className="block text-sm font-semibold">Prompt</label>
          <button type="button" className="badge" onClick={() => setPrompt(enhancePrompt(prompt, genre, mood))}>Improve Prompt</button>
        </div>
        <textarea className="textarea min-h-28" value={prompt} onChange={(event) => setPrompt(event.target.value)} required />
        <div className="row">
          {quickPromptChips.map((chip) => (
            <button key={chip} type="button" className="badge" onClick={() => setPrompt((value) => `${value}${value ? ' ' : ''}${chip}`)}>
              {chip}
            </button>
          ))}
          <button type="button" className="badge" onClick={applyTemplate}>Prompt template</button>
        </div>
        {rewrites.length > 0 && (
          <div className="rounded-xl border border-white/10 p-3">
            <p className="text-sm font-semibold">Rewrite suggestions</p>
            <div className="mt-2 space-y-2">
              {rewrites.map((rewrite, index) => (
                <button
                  key={index}
                  type="button"
                  className="block w-full rounded-lg border border-white/10 bg-white/5 p-2 text-left text-xs hover:bg-white/10"
                  onClick={() => setPrompt(rewrite)}
                >
                  {rewrite}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="rounded-xl border border-white/10 p-3">
          <p className="text-sm font-semibold">Smart autocomplete</p>
          <div className="row mt-2">
            {autocompleteSuggestions.map((suggestion) => (
              <button key={suggestion} type="button" className="badge" onClick={() => setPrompt(suggestion)}>
                {suggestion.slice(0, 36)}...
              </button>
            ))}
          </div>
        </div>

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
        className="fixed bottom-6 right-6 z-20 rounded-full bg-cyan-500 px-4 py-3 text-sm font-semibold text-black shadow-lg"
        onClick={() => setAssistantOpen((value) => !value)}
      >
        {assistantOpen ? 'Close AI Helper' : 'AI Helper'}
      </button>
      {assistantOpen && (
        <div className="fixed bottom-24 right-6 z-20 w-[22rem] space-y-3 rounded-2xl border border-cyan-500/40 bg-slate-950/95 p-4 text-sm shadow-2xl">
          <p className="font-semibold text-cyan-200">AIXENTRA Prompt Assistant</p>
          <div className="row">
            {quickPromptChips.map((entry) => (
              <button key={entry} type="button" className="badge" onClick={() => setGenre(entry)}>{entry}</button>
            ))}
          </div>
          <div className="row">
            {moodSuggestions.map((entry) => (
              <button key={entry} type="button" className="badge" onClick={() => setMood(entry)}>{entry}</button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className="btn secondary" onClick={() => setAssistantOutput(generateHook(prompt))}>Hook generator</button>
            <button type="button" className="btn secondary" onClick={() => setAssistantOutput(generateChorus(prompt, mood))}>Chorus generator</button>
            <button type="button" className="btn secondary" onClick={() => setAssistantOutput(lyricTips.join('\n'))}>Lyric helper</button>
            <button type="button" className="btn secondary" onClick={() => setPrompt(enhancePrompt(prompt, genre, mood))}>Prompt enhancer</button>
          </div>
          <div className="row">
            <input className="input" value={assistantSeedWord} onChange={(event) => setAssistantSeedWord(event.target.value)} placeholder="Rhyme seed" />
            <button type="button" className="badge" onClick={() => setAssistantOutput(rhymeHelper(assistantSeedWord).join(', '))}>Rhyme helper</button>
          </div>
          {assistantOutput && (
            <textarea className="textarea min-h-24 text-xs" value={assistantOutput} onChange={(event) => setAssistantOutput(event.target.value)} />
          )}
          {assistantOutput && (
            <div className="row">
              <button type="button" className="btn" onClick={() => setPrompt((value) => `${value}\n${assistantOutput}`)}>Append to prompt</button>
              <button type="button" className="btn secondary" onClick={() => setLyrics((value) => `${value}\n${assistantOutput}`)}>Append to lyrics</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
