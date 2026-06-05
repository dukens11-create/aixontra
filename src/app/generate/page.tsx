'use client';

import { FormEvent, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { usePlayerStore } from '@/stores/playerStore';
import { DEMO_AUDIO_URL, SUPPORTED_GENRES, SUPPORTED_LANGUAGES, songs } from '@/lib/platform/demoData';

const moods = ['Cinematic', 'Romantic', 'Dark', 'Energetic', 'Uplifting', 'Melancholic'];
const vocalStyles = ['Female', 'Male', 'Duo', 'Choir', 'Robotic'];

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
  const [audioUrl, setAudioUrl] = useState<string>(DEMO_AUDIO_URL);
  const [draftId, setDraftId] = useState<string | null>(null);

  const formPayload = useMemo(
    () => ({ prompt, lyrics, genre, mood, language, bpm, vocalStyle, instrumentalOnly }),
    [prompt, lyrics, genre, mood, language, bpm, vocalStyle, instrumentalOnly],
  );

  const generate = async (mode: 'generate' | 'regenerate' | 'extend') => {
    setLoading(true);
    setProgress(15);
    try {
      const response = await fetch('/api/generate/song', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formPayload, mode }),
      });
      setProgress(65);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Failed to generate');
      setAudioUrl(data.audioUrl);
      setDraftId(data.songDraft.id);
      setProgress(100);
      toast.success(data.message ?? 'Generation complete');
    } catch (error: any) {
      toast.error(error.message ?? 'Something went wrong');
    } finally {
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 350);
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
    const track = {
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
    } as any;
    addToQueue(track);
    play(track);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    generate('generate');
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5 pb-6">
      <div className="card bg-white/5 backdrop-blur-sm">
        <h1 className="hero-title text-left text-3xl">AIXENTRA Generator</h1>
        <p className="muted mt-2">Prompt-driven music generation with provider abstraction for future Suno/MusicGen swaps.</p>
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
        </div>

        {loading && (
          <div className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 p-3 text-sm">Generating... {progress}%</div>
        )}

        <div className="row">
          <button type="submit" className="btn" disabled={loading}>Generate</button>
          <button type="button" className="btn secondary" onClick={() => generate('regenerate')} disabled={loading}>Regenerate</button>
          <button type="button" className="btn secondary" onClick={() => generate('extend')} disabled={loading}>Extend</button>
          <a className="btn secondary" href={audioUrl} download>Download MP3</a>
          <button type="button" className="btn" onClick={publishSong}>Publish</button>
        </div>
      </form>

      <div className="card bg-black/30">
        <h2>Preview</h2>
        <audio controls src={audioUrl} className="mt-3 w-full" />
        <button className="btn mt-3" onClick={playPreview}>Play in global player</button>
      </div>
    </div>
  );
}
