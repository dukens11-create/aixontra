'use client';

import { FormEvent, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { usePlayerStore } from '@/stores/playerStore';
import { DEMO_AUDIO_URL, SUPPORTED_GENRES, SUPPORTED_LANGUAGES, songs } from '@/lib/platform/demoData';
import { toTrack } from '@/lib/platform/toTrack';
import { PLAN_CAPABILITIES, SubscriptionPlan } from '@/lib/platform/subscriptions';

const moods = ['Cinematic', 'Romantic', 'Dark', 'Energetic', 'Uplifting', 'Melancholic'];
const vocalStyles = ['Female', 'Male', 'Duo', 'Choir', 'Robotic'];
const GENERATION_POLL_TIMEOUT_MS = 180_000;
const GENERATION_POLL_INTERVAL_MS = 1_000;

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
  const [generationStatus, setGenerationStatus] = useState<'IDLE' | 'QUEUED' | 'PROCESSING' | 'COMPLETE' | 'FAILED'>('IDLE');
  const [generationJobId, setGenerationJobId] = useState<string | null>(null);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [etaSeconds, setEtaSeconds] = useState<number | null>(null);
  const [generationCostUsd, setGenerationCostUsd] = useState<number | null>(null);
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

  const formPayload = useMemo(
    () => ({ userId: 'demo-user', prompt, lyrics, genre, mood, language, bpm, vocalStyle, instrumentalOnly, targetDurationSeconds, masteringPreset }),
    [prompt, lyrics, genre, mood, language, bpm, vocalStyle, instrumentalOnly, targetDurationSeconds, masteringPreset],
  );

  const generate = async (mode: 'generate' | 'regenerate' | 'extend') => {
    setLoading(true);
    setProgress(15);
    setGenerationStatus('QUEUED');
    setGenerationCostUsd(null);
    try {
      const response = await fetch('/api/generate/song', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formPayload, mode }),
      });
      setProgress(35);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Failed to generate');
      setCreditBalance(data.creditBalance ?? creditBalance);
      setPlan(data.plan ?? plan);
      setGenerationJobId(data.jobId);
      setQueuePosition(typeof data.queuePosition === 'number' ? data.queuePosition : null);
      setEtaSeconds(typeof data.etaSeconds === 'number' ? data.etaSeconds : null);
      setProgress(Math.max(35, Number(data.progress ?? 35)));

      const pollStart = Date.now();
      let generationCompleted = false;
      while (Date.now() - pollStart < GENERATION_POLL_TIMEOUT_MS) {
        const pollResponse = await fetch(`/api/generate/song/status/${data.jobId}`, { cache: 'no-store' });
        const pollData = await pollResponse.json();
        if (!pollResponse.ok) throw new Error(pollData.error ?? 'Failed to fetch generation status');

        const job = pollData.job;
        setGenerationStatus(job.status);
        setProgress(Number(job.progress ?? 0));
        setQueuePosition(typeof job.queuePosition === 'number' ? job.queuePosition : null);
        setEtaSeconds(typeof job.etaSeconds === 'number' ? job.etaSeconds : null);

        if (job.status === 'COMPLETE') {
          setAudioUrl(job.result.audioUrl);
          setWavUrl(job.result.wavUrl ?? null);
          setStemsUrls(job.result.stemsUrls ?? null);
          setMasteredAudioUrl(job.result.masteredAudioUrl ?? null);
          setDraftId(job.result.songDraft.id);
          setGenerationCostUsd(typeof job.result.costUsd === 'number' ? job.result.costUsd : null);
          setProgress(100);
          toast.success('Generation complete');
          generationCompleted = true;
          break;
        }

        if (job.status === 'FAILED') {
          throw new Error(job.error ?? 'Generation failed');
        }

        await new Promise((resolve) => setTimeout(resolve, GENERATION_POLL_INTERVAL_MS));
      }

      if (!generationCompleted) {
        throw new Error('Generation polling timed out. Please retry.');
      }
    } catch (error: any) {
      setGenerationStatus('FAILED');
      toast.error(error.message ?? 'Something went wrong');
    } finally {
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 350);
    }
  };

  const cancelGeneration = async () => {
    if (!generationJobId) return;
    const response = await fetch('/api/generate/song/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: generationJobId }),
    });
    const data = await response.json();
    if (!response.ok) {
      toast.error(data.error ?? 'Unable to cancel generation');
      return;
    }
    setGenerationStatus('FAILED');
    setLoading(false);
    setProgress(0);
    toast.success('Generation cancelled');
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
        <label className="block text-sm font-semibold">Prompt</label>
        <textarea className="textarea min-h-28" value={prompt} onChange={(event) => setPrompt(event.target.value)} required />

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
          <div className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 p-3 text-sm space-y-1">
            <p>Generating... {progress}%</p>
            {generationStatus === 'QUEUED' && queuePosition ? <p>Queue position: {queuePosition}</p> : null}
            {generationStatus === 'QUEUED' && etaSeconds ? <p>ETA: ~{etaSeconds}s</p> : null}
            <p>Status: {generationStatus}</p>
          </div>
        )}

        <div className="row">
          <button type="submit" className="btn" disabled={loading}>Generate</button>
          <button type="button" className="btn secondary" onClick={() => generate('regenerate')} disabled={loading}>Regenerate</button>
          <button type="button" className="btn secondary" onClick={() => generate('extend')} disabled={loading}>Extend</button>
          {loading && generationJobId ? <button type="button" className="btn secondary" onClick={cancelGeneration}>Cancel</button> : null}
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
          {generationCostUsd !== null ? <p className="muted mb-2">Estimated GPU cost: ${generationCostUsd.toFixed(4)}</p> : null}
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
    </div>
  );
}
