'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { Button } from '@/components/ui/button';
import { AudioControlPanel } from '@/components/audio-studio/AudioControlPanel';
import { TimelineScrubber } from '@/components/audio-studio/TimelineScrubber';
import { WaveformRenderer } from '@/components/audio-studio/WaveformRenderer';
import {
  createHistoryState,
  createInitialAudioEditorState,
  markSaved,
  pushHistoryState,
  redoHistoryState,
  replaceChorus,
  requestVocalIsolation,
  setCursor,
  setDuration,
  setFadeIn,
  setFadeOut,
  setTrimRange,
  setVolume,
  splitAtCursor,
  toggleStemMute,
  toggleStemSolo,
  undoHistoryState,
  AudioEditorState,
} from '@/lib/audioStudio/editorState';
import { audioBufferToWavBlob, extractWaveformPeaks, renderEditedAudio } from '@/lib/audioStudio/audioProcessing';
import { formatDuration } from '@/lib/utils';

const PERSISTENCE_KEY = 'aixentra:audio-studio:state';

export default function AudioStudioPage() {
  return (
    <AuthGuard>
      <AudioStudioWorkspace />
    </AuthGuard>
  );
}

function AudioStudioWorkspace() {
  const [history, setHistory] = useState(() => createHistoryState(createInitialAudioEditorState()));
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioName, setAudioName] = useState('session.wav');
  const [waveformPeaks, setWaveformPeaks] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExportingAudio, setIsExportingAudio] = useState(false);
  const [chorusPrompt, setChorusPrompt] = useState('');
  const [restoredState, setRestoredState] = useState<AudioEditorState | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const state = history.present;

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const updateEditor = useCallback((updater: (current: AudioEditorState) => AudioEditorState) => {
    setHistory((previous) => pushHistoryState(previous, updater(previous.present)));
  }, []);

  const updateEditorWithoutHistory = useCallback((updater: (current: AudioEditorState) => AudioEditorState) => {
    setHistory((previous) => ({
      ...previous,
      present: updater(previous.present),
    }));
  }, []);

  useEffect(() => {
    const persisted = window.localStorage.getItem(PERSISTENCE_KEY);
    if (!persisted) return;

    try {
      setRestoredState(JSON.parse(persisted) as AudioEditorState);
    } catch {
      setRestoredState(null);
    }
  }, []);

  useEffect(() => {
    const player = audioRef.current;
    if (!player) return;

    player.volume = Math.min(state.volume, 1);
  }, [state.volume]);

  useEffect(() => {
    const player = audioRef.current;
    if (!player) return;

    const onTimeUpdate = () => {
      if (player.currentTime >= state.trimEnd) {
        player.pause();
        player.currentTime = state.trimEnd;
        setIsPlaying(false);
      }
      updateEditorWithoutHistory((current) => setCursor(current, player.currentTime));
    };

    const onPause = () => setIsPlaying(false);

    player.addEventListener('timeupdate', onTimeUpdate);
    player.addEventListener('pause', onPause);

    return () => {
      player.removeEventListener('timeupdate', onTimeUpdate);
      player.removeEventListener('pause', onPause);
    };
  }, [state.trimEnd, updateEditorWithoutHistory]);

  const togglePlayback = useCallback(async () => {
    const player = audioRef.current;
    if (!player || !audioUrl) return;

    const currentlyPlaying = !player.paused;
    if (currentlyPlaying) {
      player.pause();
      setIsPlaying(false);
      return;
    }

    if (player.currentTime < state.trimStart || player.currentTime > state.trimEnd) {
      player.currentTime = state.trimStart;
    }

    try {
      await player.play();
      setIsPlaying(true);
    } catch {
      setError('Playback failed. Please interact with the page and try again.');
    }
  }, [audioUrl, state.trimEnd, state.trimStart]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement;

      if (isTyping) return;

      if (event.code === 'Space') {
        event.preventDefault();
        void togglePlayback();
        return;
      }

      const modifier = event.metaKey || event.ctrlKey;
      if (modifier && event.key.toLowerCase() === 'z' && !event.shiftKey) {
        event.preventDefault();
        setHistory((previous) => undoHistoryState(previous));
        return;
      }

      if ((modifier && event.key.toLowerCase() === 'y') || (modifier && event.shiftKey && event.key.toLowerCase() === 'z')) {
        event.preventDefault();
        setHistory((previous) => redoHistoryState(previous));
        return;
      }

      if (event.key.toLowerCase() === 's') {
        event.preventDefault();
        updateEditor((current) => splitAtCursor(current));
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [togglePlayback, updateEditor]);

  const handleFileLoad = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    setStatus(null);

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    try {
      const objectUrl = URL.createObjectURL(file);
      const arrayBuffer = await file.arrayBuffer();
      const audioContext = new window.AudioContext();
      const decoded = await audioContext.decodeAudioData(arrayBuffer);
      await audioContext.close();

      setAudioUrl(objectUrl);
      setAudioName(file.name);
      setAudioBuffer(decoded);
      setWaveformPeaks(extractWaveformPeaks(decoded));

      const baseState = setDuration(createInitialAudioEditorState(decoded.duration), decoded.duration);
      const nextState = restoredState ? setDuration(restoredState, decoded.duration) : baseState;

      setHistory(createHistoryState(nextState));
      setStatus('Audio loaded. Drag trim handles, split sections, and press Space to audition.');
    } catch {
      setError('Could not decode this audio file. Please upload a valid WAV/MP3/OGG file.');
    } finally {
      setLoading(false);
    }
  }, [audioUrl, restoredState]);

  const handleSaveState = useCallback(() => {
    const saved = markSaved(state);
    setHistory((previous) => ({ ...previous, present: saved }));
    window.localStorage.setItem(PERSISTENCE_KEY, JSON.stringify(saved));
    setStatus('Session state saved locally.');
  }, [state]);

  const handleExportState = useCallback(() => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${audioName.replace(/\.[^/.]+$/, '')}-edit-state.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus('Edit state exported as JSON.');
  }, [audioName, state]);

  const handleExportAudio = useCallback(async () => {
    if (!audioBuffer) return;

    setIsExportingAudio(true);
    setError(null);

    try {
      const renderedBuffer = await renderEditedAudio(audioBuffer, state);
      const wavBlob = audioBufferToWavBlob(renderedBuffer);
      const url = URL.createObjectURL(wavBlob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${audioName.replace(/\.[^/.]+$/, '')}-edited.wav`;
      anchor.click();
      URL.revokeObjectURL(url);
      setStatus('Edited audio exported to WAV.');
    } catch {
      setError('Audio export failed. Try reducing fade values and export again.');
    } finally {
      setIsExportingAudio(false);
    }
  }, [audioBuffer, audioName, state]);

  const sectionCount = useMemo(() => state.splits.length + 1, [state.splits.length]);

  return (
    <div className="space-y-4 pb-24">
      <section className="card space-y-3 bg-gradient-to-br from-slate-950 to-slate-900">
        <div className="row justify-between">
          <div>
            <h1>Audio Studio</h1>
            <p className="muted">Professional browser-based DAW workflow for AIXENTRA creators.</p>
          </div>
          <div className="row">
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              Load audio
            </Button>
            <input
              ref={fileInputRef}
              className="hidden"
              type="file"
              accept="audio/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void handleFileLoad(file);
                }
                event.currentTarget.value = '';
              }}
            />
            <Button variant="secondary" onClick={togglePlayback} disabled={!audioUrl}>
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            <Button variant="outline" onClick={handleSaveState}>Save</Button>
            <Button variant="outline" onClick={handleExportState}>Export state</Button>
            <Button onClick={handleExportAudio} disabled={!audioBuffer || isExportingAudio}>
              {isExportingAudio ? 'Exporting…' : 'Export audio'}
            </Button>
          </div>
        </div>

        {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}

        <div className="row">
          <span className="badge">Timeline sections: {sectionCount}</span>
          <span className="badge">Duration: {formatDuration(state.duration)}</span>
          <span className="badge">Trim: {formatDuration(state.trimStart)} - {formatDuration(state.trimEnd)}</span>
          {state.lastSavedAt && <span className="badge">Saved {new Date(state.lastSavedAt).toLocaleTimeString()}</span>}
        </div>
      </section>

      {loading && <section className="card bg-black/40">Loading audio and rendering waveform…</section>}
      {error && <section className="card border-red-500/50 bg-red-950/20 text-red-200">{error}</section>}
      {status && <section className="card border-cyan-500/40 bg-cyan-950/20 text-cyan-100">{status}</section>}

      {!audioBuffer && !loading && (
        <section className="card bg-black/30">
          <h2>Empty studio</h2>
          <p className="muted mt-2">
            Import a file to enable waveform visualization, trim/split editing, fades, stem control placeholders, keyboard shortcuts,
            and timeline export.
          </p>
          <ul className="muted mt-3 list-disc space-y-1 pl-5">
            <li>Space = play/pause</li>
            <li>S = split at cursor</li>
            <li>Ctrl/⌘+Z and Ctrl/⌘+Y = undo/redo</li>
          </ul>
        </section>
      )}

      {audioBuffer && (
        <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
          <section className="card space-y-4 bg-black/35">
            <WaveformRenderer
              peaks={waveformPeaks}
              duration={state.duration}
              cursor={state.cursor}
              trimStart={state.trimStart}
              trimEnd={state.trimEnd}
              splits={state.splits}
              onSeek={(time) => {
                updateEditorWithoutHistory((current) => setCursor(current, time));
                if (audioRef.current) {
                  audioRef.current.currentTime = time;
                }
              }}
            />

            <TimelineScrubber
              duration={state.duration}
              cursor={state.cursor}
              trimStart={state.trimStart}
              trimEnd={state.trimEnd}
              splits={state.splits}
              onCursorChange={(time) => {
                updateEditorWithoutHistory((current) => setCursor(current, time));
                if (audioRef.current) {
                  audioRef.current.currentTime = time;
                }
              }}
              onTrimChange={(start, end) => {
                updateEditor((current) => setTrimRange(current, start, end));
              }}
            />

            <div className="row text-sm text-muted-foreground">
              <span>Cursor: {formatDuration(state.cursor)}</span>
              <span>Fade in/out: {state.fadeIn.toFixed(2)}s / {state.fadeOut.toFixed(2)}s</span>
            </div>
          </section>

          <AudioControlPanel
            state={state}
            canUndo={canUndo}
            canRedo={canRedo}
            chorusPrompt={chorusPrompt}
            onFadeInChange={(value) => updateEditor((current) => setFadeIn(current, value))}
            onFadeOutChange={(value) => updateEditor((current) => setFadeOut(current, value))}
            onVolumeChange={(value) => updateEditor((current) => setVolume(current, value))}
            onStemMuteToggle={(stem) => updateEditor((current) => toggleStemMute(current, stem))}
            onStemSoloToggle={(stem) => updateEditor((current) => toggleStemSolo(current, stem))}
            onSplit={() => updateEditor((current) => splitAtCursor(current))}
            onUndo={() => setHistory((previous) => undoHistoryState(previous))}
            onRedo={() => setHistory((previous) => redoHistoryState(previous))}
            onRequestVocalIsolation={() => updateEditor((current) => requestVocalIsolation(current))}
            onChorusPromptChange={setChorusPrompt}
            onReplaceChorus={() => {
              updateEditor((current) => replaceChorus(current, current.trimStart, current.trimEnd, chorusPrompt));
            }}
          />
        </div>
      )}

      <section className="card bg-black/30">
        <h2>Architecture summary</h2>
        <ul className="muted mt-2 list-disc space-y-1 pl-5">
          <li>Reusable components: waveform renderer, draggable timeline scrubber, and modular control panel.</li>
          <li>Web Audio API pipeline: decode input, apply trim + fade + volume via OfflineAudioContext, export WAV.</li>
          <li>Edit operations use a typed undo/redo history stack for deterministic timeline state transitions.</li>
          <li>Session persistence supports save/restore and JSON export for downstream provider integration.</li>
        </ul>
        <h3 className="mt-4 text-lg">Follow-up integration TODOs</h3>
        <ul className="muted mt-2 list-disc space-y-1 pl-5">
          <li>Attach real multi-stem assets to apply mute/solo during playback and export.</li>
          <li>Replace vocal isolation placeholder with production ML/provider endpoint.</li>
          <li>Connect chorus replacement action to generative audio regeneration workflow.</li>
        </ul>
      </section>
    </div>
  );
}
