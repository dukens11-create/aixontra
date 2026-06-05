'use client';

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { usePlayerStore } from '@/stores/playerStore';
import { DEMO_AUDIO_URL, SUPPORTED_GENRES, SUPPORTED_LANGUAGES, songs } from '@/lib/platform/demoData';
import { toTrack } from '@/lib/platform/toTrack';
import { PLAN_CAPABILITIES, SubscriptionPlan } from '@/lib/platform/subscriptions';
import type { GenerationJobRecord } from '@/lib/queue/types';

const moods = ['Cinematic', 'Romantic', 'Dark', 'Energetic', 'Uplifting', 'Melancholic'];
const vocalStyles = ['Female', 'Male', 'Duo', 'Choir', 'Robotic'];

const POLL_INTERVAL_MS = 2000;

function QueueStatusPanel({
  job,
  onCancel,
}: {
  job: GenerationJobRecord;
  onCancel: () => void;
}) {
  const isActive = job.status === 'QUEUED' || job.status === 'PROCESSING';
  const pct = job.progress;

  return (
    <div className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 p-4 space-y-3">
      {/* Status badge row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isActive && (
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500" />
            </span>
          )}
          <span className="text-sm font-semibold">
            {job.status === 'QUEUED' && 'Waiting in queue…'}
            {job.status === 'PROCESSING' && 'Generating…'}
            {job.status === 'COMPLETE' && '✓ Generation complete'}
            {job.status === 'FAILED' && '✗ Generation failed'}
            {job.status === 'CANCELLED' && 'Cancelled'}
          </span>
        </div>
        {job.status === 'QUEUED' && (
          <button onClick={onCancel} className="text-xs text-red-400 hover:text-red-300 underline">
            Cancel
          </button>
        )}
      </div>

      {/* Queue position + ETA */}
      {job.status === 'QUEUED' && job.queuePosition !== null && (
        <p className="text-xs text-cyan-200">
          Position in queue: <strong>#{job.queuePosition}</strong>
          {job.estimatedWaitSeconds !== null && (
            <> · Est. wait: <strong>~{Math.ceil(job.estimatedWaitSeconds / 60)} min</strong></>
          )}
        </p>
      )}

      {/* Progress bar */}
      {(job.status === 'QUEUED' || job.status === 'PROCESSING') && (
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <div
            className="h-2 rounded-full bg-cyan-400 transition-all duration-500"
            style={{ width: `${Math.max(pct, job.status === 'QUEUED' ? 5 : 10)}%` }}
          />
        </div>
      )}
      {(job.status === 'QUEUED' || job.status === 'PROCESSING') && (
        <p className="text-xs text-cyan-300">{pct}% complete</p>
      )}

      {/* Error */}
      {job.status === 'FAILED' && job.errorMessage && (
        <p className="text-xs text-red-400">{job.errorMessage}</p>
      )}
    </div>
  );
}

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

  // Queue job tracking state
  const [currentJob, setCurrentJob] = useState<GenerationJobRecord | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const applyJobResult = useCallback(
    (job: GenerationJobRecord) => {
      if (!job.result) return;
      setAudioUrl(job.result.audioUrl);
      setWavUrl(job.result.wavUrl ?? null);
      setStemsUrls(job.result.stemsUrls ?? null);
      setMasteredAudioUrl(job.result.masteredAudioUrl ?? null);
      setDraftId(job.result.songDraftId ?? null);
    },
    [],
  );

  const startPolling = useCallback(
    (jobId: string) => {
      stopPolling();
      let consecutiveErrors = 0;
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/generate/${jobId}`);
          if (!res.ok) { stopPolling(); return; }
          const job: GenerationJobRecord = await res.json();
          consecutiveErrors = 0;
          setCurrentJob(job);

          if (job.status === 'COMPLETE') {
            stopPolling();
            applyJobResult(job);
            setLoading(false);
            toast.success('Generation complete!');
          } else if (job.status === 'FAILED') {
            stopPolling();
            setLoading(false);
            toast.error(job.errorMessage ?? 'Generation failed');
          } else if (job.status === 'CANCELLED') {
            stopPolling();
            setLoading(false);
          }
        } catch {
          consecutiveErrors += 1;
          if (consecutiveErrors >= 5) {
            stopPolling();
            setLoading(false);
            toast.error('Lost connection to the generation service. Please refresh and try again.');
          }
        }
      }, POLL_INTERVAL_MS);
    },
    [stopPolling, applyJobResult],
  );

  useEffect(() => () => stopPolling(), [stopPolling]);

  const formPayload = useMemo(
    () => ({ userId: 'demo-user', prompt, lyrics, genre, mood, language, bpm, vocalStyle, instrumentalOnly, targetDurationSeconds, masteringPreset }),
    [prompt, lyrics, genre, mood, language, bpm, vocalStyle, instrumentalOnly, targetDurationSeconds, masteringPreset],
  );

  const generate = async (mode: 'generate' | 'regenerate' | 'extend') => {
    setLoading(true);
    setCurrentJob(null);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formPayload, mode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Failed to enqueue generation');
      setCreditBalance(data.creditBalance ?? creditBalance);
      setPlan(data.plan ?? plan);
      // Seed an initial job record from the enqueue response
      setCurrentJob({
        jobId: data.jobId,
        userId: formPayload.userId,
        status: data.status,
        progress: 0,
        queuePosition: data.queuePosition,
        estimatedWaitSeconds: data.estimatedWaitSeconds,
        result: null,
        errorMessage: null,
        enqueuedAt: new Date().toISOString(),
        startedAt: null,
        completedAt: null,
      });
      startPolling(data.jobId);
    } catch (error: unknown) {
      setLoading(false);
      const message = error instanceof Error ? error.message : 'Something went wrong';
      toast.error(message);
    }
  };

  const cancelCurrentJob = async () => {
    if (!currentJob) return;
    const res = await fetch(`/api/generate/${currentJob.jobId}/cancel`, { method: 'POST' });
    if (res.ok) {
      stopPolling();
      setCurrentJob((prev) => prev ? { ...prev, status: 'CANCELLED' } : prev);
      setLoading(false);
      toast('Generation cancelled.');
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

        {currentJob && (loading || currentJob.status === 'COMPLETE' || currentJob.status === 'FAILED' || currentJob.status === 'CANCELLED') && (
          <QueueStatusPanel job={currentJob} onCancel={cancelCurrentJob} />
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
    </div>
  );
}
