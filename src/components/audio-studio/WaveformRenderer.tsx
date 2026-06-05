'use client';

import { useEffect, useRef } from 'react';

interface WaveformRendererProps {
  peaks: number[];
  duration: number;
  cursor: number;
  trimStart: number;
  trimEnd: number;
  splits: number[];
  onSeek: (time: number) => void;
}

const xForTime = (time: number, duration: number, width: number) => {
  if (duration <= 0 || width <= 0) return 0;
  return (time / duration) * width;
};

export function WaveformRenderer({
  peaks,
  duration,
  cursor,
  trimStart,
  trimEnd,
  splits,
  onSeek,
}: WaveformRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const ratio = window.devicePixelRatio || 1;

    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);

    const context = canvas.getContext('2d');
    if (!context) return;

    context.scale(ratio, ratio);
    context.clearRect(0, 0, width, height);
    context.fillStyle = '#090d1f';
    context.fillRect(0, 0, width, height);

    if (peaks.length === 0) {
      context.fillStyle = '#64748b';
      context.font = '12px sans-serif';
      context.fillText('Load audio to render waveform', 12, height / 2);
      return;
    }

    const trimStartX = xForTime(trimStart, duration, width);
    const trimEndX = xForTime(trimEnd, duration, width);

    context.fillStyle = '#111827';
    context.fillRect(0, 0, trimStartX, height);
    context.fillRect(trimEndX, 0, width - trimEndX, height);

    context.strokeStyle = '#22d3ee';
    context.lineWidth = 1;
    context.beginPath();

    const bars = peaks.length;
    for (let index = 0; index < bars; index += 1) {
      const x = (index / bars) * width;
      const normalizedPeak = peaks[index] ?? 0;
      const barHeight = Math.max(normalizedPeak * (height * 0.9), 1);
      const yTop = (height - barHeight) / 2;
      context.moveTo(x, yTop);
      context.lineTo(x, yTop + barHeight);
    }

    context.stroke();

    context.strokeStyle = '#6366f1';
    context.lineWidth = 2;
    for (const split of splits) {
      const splitX = xForTime(split, duration, width);
      context.beginPath();
      context.moveTo(splitX, 0);
      context.lineTo(splitX, height);
      context.stroke();
    }

    context.strokeStyle = '#34d399';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(trimStartX, 0);
    context.lineTo(trimStartX, height);
    context.moveTo(trimEndX, 0);
    context.lineTo(trimEndX, height);
    context.stroke();

    const cursorX = xForTime(cursor, duration, width);
    context.strokeStyle = '#facc15';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(cursorX, 0);
    context.lineTo(cursorX, height);
    context.stroke();
  }, [cursor, duration, peaks, splits, trimEnd, trimStart]);

  return (
    <button
      type="button"
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const ratio = (event.clientX - rect.left) / rect.width;
        onSeek(Math.max(0, ratio) * duration);
      }}
      className="relative h-44 w-full overflow-hidden rounded-xl border border-border bg-black/60"
      aria-label="Waveform timeline"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </button>
  );
}
