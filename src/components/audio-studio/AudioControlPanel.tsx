'use client';

import { AudioEditorState, STEM_KEYS, StemKey } from '@/lib/audioStudio/editorState';
import { formatDuration } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface AudioControlPanelProps {
  state: AudioEditorState;
  canUndo: boolean;
  canRedo: boolean;
  chorusPrompt: string;
  onFadeInChange: (fadeIn: number) => void;
  onFadeOutChange: (fadeOut: number) => void;
  onVolumeChange: (volume: number) => void;
  onStemMuteToggle: (stem: StemKey) => void;
  onStemSoloToggle: (stem: StemKey) => void;
  onSplit: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onRequestVocalIsolation: () => void;
  onChorusPromptChange: (value: string) => void;
  onReplaceChorus: () => void;
}

export function AudioControlPanel({
  state,
  canUndo,
  canRedo,
  chorusPrompt,
  onFadeInChange,
  onFadeOutChange,
  onVolumeChange,
  onStemMuteToggle,
  onStemSoloToggle,
  onSplit,
  onUndo,
  onRedo,
  onRequestVocalIsolation,
  onChorusPromptChange,
  onReplaceChorus,
}: AudioControlPanelProps) {
  const editDuration = Math.max(state.trimEnd - state.trimStart, 0);

  return (
    <div className="space-y-4">
      <section className="card space-y-3 bg-black/40">
        <div className="row justify-between">
          <h2 className="text-lg font-semibold">Edit controls</h2>
          <span className="badge">Trimmed length {formatDuration(editDuration)}</span>
        </div>

        <div className="row">
          <Button variant="secondary" onClick={onSplit}>Split @ cursor (S)</Button>
          <Button variant="outline" disabled={!canUndo} onClick={onUndo}>Undo (⌘/Ctrl+Z)</Button>
          <Button variant="outline" disabled={!canRedo} onClick={onRedo}>Redo (⌘/Ctrl+Y)</Button>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block text-muted-foreground">Fade In ({state.fadeIn.toFixed(2)}s)</span>
          <input
            type="range"
            min={0}
            max={Math.max(editDuration, 0.01)}
            step={0.01}
            value={state.fadeIn}
            onChange={(event) => onFadeInChange(Number(event.target.value))}
            className="w-full"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-muted-foreground">Fade Out ({state.fadeOut.toFixed(2)}s)</span>
          <input
            type="range"
            min={0}
            max={Math.max(editDuration, 0.01)}
            step={0.01}
            value={state.fadeOut}
            onChange={(event) => onFadeOutChange(Number(event.target.value))}
            className="w-full"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-muted-foreground">Volume ({state.volume.toFixed(2)}x)</span>
          <input
            type="range"
            min={0}
            max={2}
            step={0.01}
            value={state.volume}
            onChange={(event) => onVolumeChange(Number(event.target.value))}
            className="w-full"
          />
        </label>
      </section>

      <section className="card space-y-3 bg-black/40">
        <h3 className="text-base font-semibold">Stem mute / solo</h3>
        <p className="muted">Placeholder controls: values are saved and will drive playback/export once real multi-stem files are integrated.</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {STEM_KEYS.map((stem) => (
            <div key={stem} className="rounded-lg border border-border bg-black/40 p-3">
              <p className="text-sm font-medium capitalize">{stem}</p>
              <div className="mt-2 row">
                <Button variant={state.stems[stem].muted ? 'destructive' : 'outline'} size="sm" onClick={() => onStemMuteToggle(stem)}>
                  Mute
                </Button>
                <Button variant={state.stems[stem].solo ? 'default' : 'outline'} size="sm" onClick={() => onStemSoloToggle(stem)}>
                  Solo
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card space-y-3 bg-black/40">
        <h3 className="text-base font-semibold">Vocal isolation + chorus tools</h3>
        <div className="row">
          <Button variant="outline" onClick={onRequestVocalIsolation}>Vocal isolation (placeholder)</Button>
          {state.vocalIsolationRequested && <span className="badge">Request queued for ML provider integration</span>}
        </div>

        <label className="block text-sm">
          <span className="mb-1 block text-muted-foreground">Replace chorus instructions</span>
          <textarea
            className="textarea"
            placeholder="e.g. Replace with an energetic bilingual hook"
            value={chorusPrompt}
            onChange={(event) => onChorusPromptChange(event.target.value)}
          />
        </label>

        <Button variant="secondary" onClick={onReplaceChorus} disabled={!chorusPrompt.trim()}>
          Replace chorus in selected trim range
        </Button>
        {state.chorusReplacement && (
          <p className="muted">
            Chorus replacement queued for {formatDuration(state.chorusReplacement.start)} - {formatDuration(state.chorusReplacement.end)}
          </p>
        )}
      </section>
    </div>
  );
}
