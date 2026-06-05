'use client';

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useI18n } from '@/components/providers/I18nProvider';
import { getLyricLanguageName } from '@/lib/i18n/config';
import { usePlayerStore } from '@/stores/playerStore';
import { DEMO_AUDIO_URL, SUPPORTED_GENRES, SUPPORTED_LANGUAGES, songs } from '@/lib/platform/demoData';
import { toTrack } from '@/lib/platform/toTrack';
import { PLAN_CAPABILITIES, SubscriptionPlan } from '@/lib/platform/subscriptions';
import type { GenerationJobRecord } from '@/lib/queue/types';

const moods = ['Cinematic', 'Romantic', 'Dark', 'Energetic', 'Uplifting', 'Melancholic'];
const vocalStyles = ['Female', 'Male', 'Duo', 'Choir', 'Robotic'];

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ERRORS = 5;
const MIN_QUEUED_PROGRESS = 5;
const MIN_PROCESSING_PROGRESS = 10;

function QueueStatusPanel({
  job,
  onCancel,
  t,
  formatNumber,
}: {
  job: GenerationJobRecord;
  onCancel: () => void;
  t: (key: string, values?: Record<string, string | number>) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
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
            {job.status === 'QUEUED' && t('generate.queue.waiting')}
            {job.status === 'PROCESSING' && t('generate.queue.generating')}
            {job.status === 'COMPLETE' && t('generate.queue.complete')}
            {job.status === 'FAILED' && t('generate.queue.failed')}
            {job.status === 'CANCELLED' && t('generate.queue.cancelled')}
          </span>
        </div>
        {job.status === 'QUEUED' && (
          <button onClick={onCancel} className="text-xs text-red-400 hover:text-red-300 underline">
            {t('generate.queue.cancel')}
          </button>
        )}
      </div>

      {/* Queue position + ETA */}
      {job.status === 'QUEUED' && job.queuePosition !== null && (
        <p className="text-xs text-cyan-200">
          {t('generate.queue.position', { position: formatNumber(job.queuePosition) })}
          {job.estimatedWaitSeconds !== null && (
            <> · {t('generate.queue.estimatedWait', { minutes: formatNumber(Math.ceil(job.estimatedWaitSeconds / 60)) })}</>
          )}
        </p>
      )}

      {/* Progress bar */}
      {(job.status === 'QUEUED' || job.status === 'PROCESSING') && (
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <div
            className="h-2 rounded-full bg-cyan-400 transition-all duration-500"
            style={{ width: `${Math.max(pct, job.status === 'QUEUED' ? MIN_QUEUED_PROGRESS : MIN_PROCESSING_PROGRESS)}%` }}
          />
        </div>
      )}
      {(job.status === 'QUEUED' || job.status === 'PROCESSING') && (
        <p className="text-xs text-cyan-300">{t('generate.queue.completePercent', { percent: formatNumber(pct) })}</p>
      )}

      {/* Error */}
      {job.status === 'FAILED' && job.errorMessage && (
        <p className="text-xs text-red-400">{job.errorMessage}</p>
      )}
    </div>
  );
}

export default function GeneratePage() {
  const { formatNumber, locale, t } = useI18n();
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

  useEffect(() => {
    setLanguage((current) => (current === SUPPORTED_LANGUAGES[0] ? getLyricLanguageName(locale) : current));
  }, [locale]);

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
          if (!res.ok) {
            stopPolling();
            setLoading(false);
            toast.error(t('generate.messages.statusError'));
            return;
          }
          const job: GenerationJobRecord = await res.json();
          consecutiveErrors = 0;
          setCurrentJob(job);

          if (job.status === 'COMPLETE') {
            stopPolling();
            applyJobResult(job);
            setLoading(false);
            toast.success(t('generate.messages.generationComplete'));
          } else if (job.status === 'FAILED') {
            stopPolling();
            setLoading(false);
            toast.error(job.errorMessage ?? t('generate.messages.generationFailed'));
          } else if (job.status === 'CANCELLED') {
            stopPolling();
            setLoading(false);
          }
        } catch {
          consecutiveErrors += 1;
          if (consecutiveErrors >= MAX_POLL_ERRORS) {
            stopPolling();
            setLoading(false);
            toast.error(t('generate.messages.lostConnection'));
          }
        }
      }, POLL_INTERVAL_MS);
    },
    [stopPolling, applyJobResult, t],
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
      const message = error instanceof Error ? error.message : t('generate.messages.somethingWentWrong');
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
      toast(t('generate.messages.generationCancelled'));
    }
  };

  const publishSong = async () => {
    if (!draftId) {
      toast.error(t('generate.messages.generateFirst'));
      return;
    }
    const response = await fetch('/api/songs/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ draftId }),
    });
    const data = await response.json();
    if (!response.ok) {
      toast.error(data.error ?? t('generate.messages.publishFailed'));
      return;
    }
    toast.success(t('generate.messages.publishedToFeed'));
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
      toast.error(data.error ?? t('generate.messages.voiceModelSubmissionFailed'));
      return;
    }
    toast.success(data.message ?? t('generate.messages.voiceModelSubmitted'));
  };

  const requestUploadUrl = async (kind: 'cover' | 'video') => {
    const response = await fetch('/api/media/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'demo-user', kind, songId: draftId ?? undefined }),
    });
    const data = await response.json();
    if (!response.ok) {
      toast.error(data.error ?? t('generate.messages.uploadUrlRequestFailed'));
      return;
    }
    navigator.clipboard.writeText(data.upload.uploadUrl).catch(() => undefined);
    toast.success(t('generate.messages.secureUploadGenerated', { kind }));
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5 pb-6">
      <div className="card bg-white/5 backdrop-blur-sm">
        <h1 className="hero-title text-left text-3xl">{t('generate.title')}</h1>
        <p className="muted mt-2">{t('generate.description')}</p>
        <p className="mt-3 text-sm text-cyan-200">{t('generate.ownership')}</p>
        <div className="row mt-3">
          <span className="badge">{t('generate.plan')}: {plan}</span>
          <span className="badge">{t('generate.credits')}: {formatNumber(creditBalance)}</span>
        </div>
      </div>

      <form onSubmit={onSubmit} className="card space-y-4 bg-white/5 backdrop-blur-sm">
        <label className="block text-sm font-semibold">{t('generate.prompt')}</label>
        <textarea className="textarea min-h-28" value={prompt} onChange={(event) => setPrompt(event.target.value)} required />

        <label className="block text-sm font-semibold">{t('generate.lyrics')}</label>
        <textarea className="textarea min-h-24" value={lyrics} onChange={(event) => setLyrics(event.target.value)} />

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <select className="select" value={genre} onChange={(event) => setGenre(event.target.value)}>
            {SUPPORTED_GENRES.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
          </select>
          <select className="select" value={mood} onChange={(event) => setMood(event.target.value)}>
            {moods.map((entry) => <option key={entry} value={entry}>{t(`options.moods.${entry}`)}</option>)}
          </select>
          <select className="select" value={language} onChange={(event) => setLanguage(event.target.value)}>
            {SUPPORTED_LANGUAGES.map((entry) => <option key={entry} value={entry}>{t(`options.languages.${entry}`)}</option>)}
          </select>
          <select className="select" value={vocalStyle} onChange={(event) => setVocalStyle(event.target.value)}>
            {vocalStyles.map((entry) => <option key={entry} value={entry}>{t(`options.voiceStyles.${entry}`)}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">{t('generate.bpm')}: {formatNumber(bpm)}
            <input type="range" min={70} max={180} value={bpm} onChange={(event) => setBpm(Number(event.target.value))} className="mt-2 w-full" />
          </label>
          <label className="row justify-between rounded-xl border border-white/10 px-3 py-2 text-sm">
            {t('generate.instrumentalOnly')}
            <input type="checkbox" checked={instrumentalOnly} onChange={(event) => setInstrumentalOnly(event.target.checked)} />
          </label>
          <label className="block text-sm">{t('generate.length')}: {formatNumber(targetDurationSeconds)}
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

        <label className="block text-sm font-semibold">{t('generate.masteringPreset')}</label>
        <select className="select" value={masteringPreset} onChange={(event) => setMasteringPreset(event.target.value as typeof masteringPreset)}>
          <option value="LOUDNESS_NORMALIZATION">{t('generate.preset.LOUDNESS_NORMALIZATION')}</option>
          <option value="CLEAN_MIX">{t('generate.preset.CLEAN_MIX')}</option>
          <option value="RADIO_READY">{t('generate.preset.RADIO_READY')}</option>
        </select>

        {currentJob && (loading || currentJob.status === 'COMPLETE' || currentJob.status === 'FAILED' || currentJob.status === 'CANCELLED') && (
          <QueueStatusPanel job={currentJob} onCancel={cancelCurrentJob} t={t} formatNumber={formatNumber} />
        )}

        <div className="row">
          <button type="submit" className="btn" disabled={loading}>{t('generate.actions.generate')}</button>
          <button type="button" className="btn secondary" onClick={() => generate('regenerate')} disabled={loading}>{t('generate.actions.regenerate')}</button>
          <button type="button" className="btn secondary" onClick={() => generate('extend')} disabled={loading}>{t('generate.actions.extend')}</button>
          <button type="button" className="btn secondary" onClick={() => window.open(audioUrl, '_blank', 'noopener,noreferrer')}>{t('generate.actions.downloadMp3')}</button>
          {wavUrl && <button type="button" className="btn secondary" onClick={() => window.open(wavUrl, '_blank', 'noopener,noreferrer')}>{t('generate.actions.downloadWav')}</button>}
          <button type="button" className="btn" onClick={publishSong}>{t('generate.actions.publish')}</button>
        </div>
      </form>

      <div className="card bg-black/30">
        <h2>{t('generate.preview')}</h2>
        <audio controls src={audioUrl} className="mt-3 w-full" />
        {masteredAudioUrl && (
          <div className="mt-3">
            <p className="muted">{t('generate.masteredOutput')}</p>
            <audio controls src={masteredAudioUrl} className="mt-2 w-full" />
          </div>
        )}
        <div className="mt-3">
          <p className="text-sm font-semibold">{t('generate.stemsExport')}</p>
          {stemsUrls ? (
            <div className="row mt-2">
              {Object.entries(stemsUrls).map(([key, value]) => (
                value ? <button key={key} className="badge" onClick={() => window.open(value, '_blank', 'noopener,noreferrer')}>{key}</button> : null
              ))}
            </div>
          ) : (
            <p className="muted mt-2">{t('generate.stemsFallback')}</p>
          )}
        </div>
        <div className="row mt-3">
          <button className="badge" onClick={() => requestUploadUrl('cover')}>{t('generate.actions.secureCoverUpload')}</button>
          <button className="badge" onClick={() => requestUploadUrl('video')}>{t('generate.actions.secureVideoUpload')}</button>
        </div>
        <button className="btn mt-3" onClick={playPreview}>{t('generate.actions.playInGlobalPlayer')}</button>
      </div>

      <div className="card bg-black/30">
        <h2>{t('generate.voiceCloningConsent')}</h2>
        <p className="muted mt-2">{t('generate.consentDescription')}</p>
        <div className="mt-3 space-y-2">
          <input className="input" value={voiceModelName} onChange={(event) => setVoiceModelName(event.target.value)} placeholder={t('generate.voiceModelName')} />
          <input className="input" value={proofUrl} onChange={(event) => setProofUrl(event.target.value)} placeholder={t('generate.proofUrl')} />
          <label className="row text-sm">
            <input type="checkbox" checked={consentConfirmed} onChange={(event) => setConsentConfirmed(event.target.checked)} />
            {t('generate.consentConfirm')}
          </label>
          <button className="btn secondary" onClick={submitVoiceModel}>{t('generate.actions.submitVoiceModel')}</button>
        </div>
      </div>
    </div>
  );
}
