'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { songs } from '@/lib/platform/demoData';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('all');
  const [mood, setMood] = useState('all');
  const [language, setLanguage] = useState('all');

  const filtered = useMemo(() => songs.filter((song) => {
    const matchesQuery = `${song.title} ${song.creatorName}`.toLowerCase().includes(query.toLowerCase());
    const matchesGenre = genre === 'all' || song.genre === genre;
    const matchesMood = mood === 'all' || song.mood === mood;
    const matchesLanguage = language === 'all' || song.language === language;
    return matchesQuery && matchesGenre && matchesMood && matchesLanguage;
  }), [query, genre, mood, language]);

  return (
    <div className="space-y-4 pb-6">
      <section className="card bg-white/5"><h1>Search</h1><p className="muted">Find songs and creators by title, creator, genre, mood, and language.</p></section>
      <section className="card space-y-3 bg-white/5">
        <input className="input" placeholder="Search songs or creators" value={query} onChange={(event) => setQuery(event.target.value)} />
        <div className="grid grid-cols-3 gap-2">
          <input className="input" placeholder="Genre filter" value={genre} onChange={(event) => setGenre(event.target.value || 'all')} />
          <input className="input" placeholder="Mood filter" value={mood} onChange={(event) => setMood(event.target.value || 'all')} />
          <input className="input" placeholder="Language filter" value={language} onChange={(event) => setLanguage(event.target.value || 'all')} />
        </div>
      </section>
      <section className="space-y-2">
        {filtered.length === 0 ? <div className="card">No results found.</div> : filtered.map((song) => (
          <div key={song.id} className="card row justify-between bg-black/30">
            <div><p className="font-semibold">{song.title}</p><p className="muted">{song.creatorName} · {song.genre} · {song.mood} · {song.language}</p></div>
            <Link className="badge" href={`/creator/${song.creatorId}`}>Creator</Link>
          </div>
        ))}
      </section>
    </div>
  );
}
