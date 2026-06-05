'use client';

import { useEffect, useMemo, useRef } from 'react';
import { usePlayerStore } from '@/stores/playerStore';
import { PlayerState, Track } from '@/types';
import {
  setMediaSessionMetadata,
  registerMediaSessionHandlers,
  updateMediaSessionPosition,
  setMediaSessionPlaybackState,
} from '@/lib/mobile/mediaSession';

const toSrc = (track: Track | null) => track?.audio_path ?? null;

export function GlobalPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    queue,
    play,
    pause,
    next,
    previous,
    seek,
    setVolume,
    setMode,
    mode,
  } = usePlayerStore();

  const src = useMemo(() => toSrc(currentTrack), [currentTrack]);

  useEffect(() => {
    if (!audioRef.current || !src) return;
    if (audioRef.current.src !== src) {
      audioRef.current.src = src;
    }
    if (isPlaying) {
      audioRef.current.play().catch(() => pause());
    } else {
      audioRef.current.pause();
    }
  }, [src, isPlaying, pause]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      seek(audio.currentTime);
      updateMediaSessionPosition(audio.currentTime, audio.duration || 0);
    };
    const onEnded = () => next();

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
  }, [next, seek]);

  // ── Media Session API – lock screen & notification controls ──────────────
  useEffect(() => {
    if (!currentTrack) return;

    setMediaSessionMetadata({
      title: currentTrack.title,
      artist: currentTrack.creator?.display_name ?? 'AIXENTRA',
      coverUrl: currentTrack.cover_path ?? undefined,
    });

    registerMediaSessionHandlers({
      onPlay: () => play(),
      onPause: () => pause(),
      onNextTrack: () => next(),
      onPreviousTrack: () => previous(),
      onSeek: (time) => {
        if (audioRef.current) audioRef.current.currentTime = time;
        seek(time);
      },
    });
  }, [currentTrack, play, pause, next, previous, seek]);

  useEffect(() => {
    setMediaSessionPlaybackState(isPlaying ? 'playing' : 'paused');
  }, [isPlaying]);

  if (!currentTrack) return <audio ref={audioRef} preload="metadata" />;

  return (
    <>
      <audio ref={audioRef} preload="metadata" />
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-3 py-2 text-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={currentTrack.cover_path ?? '/logo.svg'} alt={currentTrack.title} className="h-10 w-10 rounded-lg object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{currentTrack.title}</p>
            <p className="truncate text-xs text-slate-400">{currentTrack.creator?.display_name ?? 'AIXENTRA'}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="badge" onClick={previous}>Prev</button>
            <button className="badge" onClick={() => (isPlaying ? pause() : play())}>{isPlaying ? 'Pause' : 'Play'}</button>
            <button className="badge" onClick={next}>Next</button>
          </div>
          <input
            aria-label="Song progress"
            type="range"
            min={0}
            max={audioRef.current?.duration || 0}
            value={currentTime}
            onChange={(event) => {
              const value = Number(event.target.value);
              if (audioRef.current) audioRef.current.currentTime = value;
              seek(value);
            }}
            className="hidden w-28 md:block"
          />
          <input
            aria-label="Volume"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            className="w-16"
          />
          <select
            value={mode}
            onChange={(event) => setMode(event.target.value as PlayerState['mode'])}
            className="hidden rounded-lg bg-slate-900 p-1 text-xs md:block"
          >
            <option value="normal">Queue</option>
            <option value="repeat-one">Repeat 1</option>
            <option value="repeat-all">Repeat All</option>
            <option value="shuffle">Shuffle</option>
          </select>
          <span className="hidden text-xs text-slate-500 md:block">{queue.length} queued</span>
        </div>
      </div>
    </>
  );
}
