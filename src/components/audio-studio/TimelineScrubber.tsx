'use client';

import { useCallback, useRef, useState } from 'react';

interface TimelineScrubberProps {
  duration: number;
  cursor: number;
  trimStart: number;
  trimEnd: number;
  splits: number[];
  onCursorChange: (time: number) => void;
  onTrimChange: (start: number, end: number) => void;
}

type DragMode = 'cursor' | 'trim-start' | 'trim-end' | null;

const toPercentage = (value: number, duration: number) => (duration > 0 ? (value / duration) * 100 : 0);

export function TimelineScrubber({
  duration,
  cursor,
  trimStart,
  trimEnd,
  splits,
  onCursorChange,
  onTrimChange,
}: TimelineScrubberProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [dragMode, setDragMode] = useState<DragMode>(null);

  const updateFromPointer = useCallback(
    (clientX: number) => {
      if (!trackRef.current || duration <= 0 || !dragMode) return;

      const rect = trackRef.current.getBoundingClientRect();
      const ratio = (clientX - rect.left) / rect.width;
      const time = Math.min(duration, Math.max(0, ratio * duration));

      if (dragMode === 'cursor') {
        onCursorChange(time);
        return;
      }

      if (dragMode === 'trim-start') {
        onTrimChange(Math.min(time, trimEnd), trimEnd);
        return;
      }

      onTrimChange(trimStart, Math.max(time, trimStart));
    },
    [dragMode, duration, onCursorChange, onTrimChange, trimEnd, trimStart],
  );

  return (
    <div className="space-y-2">
      <div
        ref={trackRef}
        className="relative h-16 rounded-lg border border-border bg-black/40"
        onMouseMove={(event) => updateFromPointer(event.clientX)}
        onMouseUp={() => setDragMode(null)}
        onMouseLeave={() => setDragMode(null)}
      >
        <div
          className="absolute top-0 h-full bg-cyan-500/20"
          style={{
            left: `${toPercentage(trimStart, duration)}%`,
            width: `${Math.max(toPercentage(trimEnd - trimStart, duration), 0)}%`,
          }}
        />

        {splits.map((split) => (
          <div
            key={split}
            className="absolute top-0 h-full w-[2px] bg-indigo-400"
            style={{ left: `${toPercentage(split, duration)}%` }}
          />
        ))}

        <button
          type="button"
          aria-label="Drag trim start"
          className="absolute top-0 h-full w-3 -translate-x-1/2 cursor-ew-resize bg-emerald-400/70"
          style={{ left: `${toPercentage(trimStart, duration)}%` }}
          onMouseDown={() => setDragMode('trim-start')}
        />

        <button
          type="button"
          aria-label="Drag trim end"
          className="absolute top-0 h-full w-3 -translate-x-1/2 cursor-ew-resize bg-emerald-400/70"
          style={{ left: `${toPercentage(trimEnd, duration)}%` }}
          onMouseDown={() => setDragMode('trim-end')}
        />

        <button
          type="button"
          aria-label="Drag playhead"
          className="absolute top-0 h-full w-2 -translate-x-1/2 cursor-ew-resize bg-yellow-300"
          style={{ left: `${toPercentage(cursor, duration)}%` }}
          onMouseDown={() => setDragMode('cursor')}
        />
      </div>

      <input
        aria-label="Timeline position"
        type="range"
        min={0}
        max={duration || 0}
        step={0.01}
        value={cursor}
        onChange={(event) => onCursorChange(Number(event.target.value))}
        className="w-full"
      />
    </div>
  );
}
