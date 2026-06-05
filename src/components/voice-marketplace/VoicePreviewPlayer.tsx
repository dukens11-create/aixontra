"use client";

import { useEffect, useMemo, useRef, useState } from 'react';

// 128 bins gives a smooth low-cost spectrum for compact card previews.
const FREQUENCY_BUFFER_SIZE = 128;

type Props = {
  audioUrl: string;
  waveformPoints: number[];
  title: string;
};

export function VoicePreviewPlayer({ audioUrl, waveformPoints, title }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const waveformBars = useMemo(() => waveformPoints.slice(0, 40), [waveformPoints]);

  useEffect(() => {
    const audio = audioRef.current;
    const canvas = canvasRef.current;
    if (!audio || !canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const drawStatic = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width / waveformBars.length;
      waveformBars.forEach((bar, index) => {
        const barHeight = (bar / 100) * canvas.height;
        context.fillStyle = 'rgba(139, 92, 246, 0.65)';
        context.fillRect(index * width, canvas.height - barHeight, Math.max(2, width - 1), barHeight);
      });
    };

    drawStatic();

    let animationContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let source: MediaElementAudioSourceNode | null = null;
    const buffer = new Uint8Array(FREQUENCY_BUFFER_SIZE);

    const drawAnimated = () => {
      if (!analyser) return;
      analyser.getByteFrequencyData(buffer);
      context.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width / buffer.length;
      buffer.forEach((value, index) => {
        const barHeight = (value / 255) * canvas.height;
        context.fillStyle = 'rgba(6, 182, 212, 0.75)';
        context.fillRect(index * width, canvas.height - barHeight, Math.max(1, width - 0.5), barHeight);
      });
      rafRef.current = window.requestAnimationFrame(drawAnimated);
    };

    const enableAnalyzer = async () => {
      try {
        if (!animationContext) {
          animationContext = new window.AudioContext();
          source = animationContext.createMediaElementSource(audio);
          analyser = animationContext.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);
          analyser.connect(animationContext.destination);
        }
        if (animationContext.state === 'suspended') await animationContext.resume();
        drawAnimated();
      } catch (error) {
        console.error('Voice waveform analyzer failed:', error);
        setError('Waveform analyzer unavailable for this preview source.');
      }
    };

    const onPlay = () => {
      setIsPlaying(true);
      void enableAnalyzer();
    };
    const onPause = () => {
      setIsPlaying(false);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      drawStatic();
    };
    const onEnded = onPause;
    const onError = () => {
      setError('Audio preview failed to load. Ensure the source allows CORS for waveform analysis.');
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (animationContext) {
        void animationContext.close().catch((cleanupError) => {
          console.error('Audio context cleanup failed:', cleanupError);
        });
      }
    };
  }, [waveformBars]);

  return (
    <div className="space-y-2">
      <audio ref={audioRef} controls preload="none" src={audioUrl} crossOrigin="anonymous" className="w-full" aria-label={`${title} audio preview`}>
        Your browser does not support the audio element.
      </audio>
      <canvas ref={canvasRef} width={560} height={92} className="h-20 w-full rounded-xl border border-white/10 bg-black/30" aria-label={`${title} waveform preview`} />
      {error ? <p className="muted">{error}</p> : <p className="muted">{isPlaying ? 'Web Audio API waveform live preview enabled.' : 'Press play to animate waveform.'}</p>}
    </div>
  );
}
