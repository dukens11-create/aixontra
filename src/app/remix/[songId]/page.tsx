'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { songs } from '@/lib/platform/demoData';

export default function RemixEditorPage() {
  const { songId } = useParams<{ songId: string }>();
  const original = songs.find((song) => song.id === songId) ?? songs[0];

  const [prompt, setPrompt] = useState(`${original.prompt} with a festival build-up remix.`);
  const [genre, setGenre] = useState(original.genre);
  const [mood, setMood] = useState(original.mood);
  const [lyrics, setLyrics] = useState(original.lyrics);
  const [bpm, setBpm] = useState(original.bpm + 4);

  const saveRemix = () => toast.success('Remix draft saved and linked to original.');

  return (
    <div className="space-y-4 pb-6">
      <section className="card bg-white/5"><h1>Remix Editor</h1><p className="muted">Original song: {original.title}</p></section>
      <section className="card space-y-3 bg-white/5">
        <textarea className="textarea" value={prompt} onChange={(event) => setPrompt(event.target.value)} />
        <div className="grid grid-cols-3 gap-2">
          <input className="input" value={genre} onChange={(event) => setGenre(event.target.value)} />
          <input className="input" value={mood} onChange={(event) => setMood(event.target.value)} />
          <input className="input" type="number" value={bpm} onChange={(event) => setBpm(Number(event.target.value))} />
        </div>
        <textarea className="textarea" value={lyrics} onChange={(event) => setLyrics(event.target.value)} />
        <div className="row">
          <button className="btn" onClick={saveRemix}>Save remix</button>
          <button className="btn secondary">Generate remix audio</button>
        </div>
      </section>
      <section className="card bg-black/30">
        <h2>Remix lineage tree</h2>
        <p className="muted mt-2">{original.title} → {original.title} (Remix Draft) → {original.title} (Festival Remix)</p>
      </section>
    </div>
  );
}
