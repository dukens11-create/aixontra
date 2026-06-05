'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { songs } from '@/lib/platform/demoData';
import { usePlayerStore } from '@/stores/playerStore';

export default function FeedPage() {
  const [page, setPage] = useState(1);
  const play = usePlayerStore((state) => state.play);
  const addToQueue = usePlayerStore((state) => state.addToQueue);

  const feedSongs = useMemo(() => Array.from({ length: page }).flatMap(() => songs), [page]);

  const action = (message: string) => toast.success(message);

  return (
    <div className="space-y-4 pb-6">
      <div className="card bg-white/5 backdrop-blur-sm">
        <h1>Discovery Feed</h1>
        <p className="muted">Vertical, mobile-first discovery optimized for fast swipe/scroll sessions.</p>
      </div>

      <div className="space-y-4">
        {feedSongs.map((song, index) => (
          <motion.article
            key={`${song.id}-${index}`}
            className="card min-h-[78vh] bg-black/40"
            initial={{ opacity: 0.65, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-20%' }}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={song.coverUrl} alt={song.title} className="h-[52vh] w-full rounded-2xl object-cover" />
                <audio src={song.audioUrl} controls autoPlay={index === 0} className="mt-3 w-full" />
                <h2 className="mt-3">{song.title}</h2>
                <p className="muted">{song.creatorName} · {song.genre} · {song.mood}</p>
                <p className="muted">{song.likes} likes · {song.plays} plays · {song.comments} comments · {song.remixes} remixes</p>
              </div>
              <div className="flex flex-row gap-2 md:flex-col">
                <button className="badge" onClick={() => action('Liked song')}>Like</button>
                <button className="badge" onClick={() => action('Comment opened')}>Comment</button>
                <Link href={`/remix/${song.id}`} className="badge">Remix</Link>
                <button className="badge" onClick={() => action('Shared')}>Share</button>
                <button className="badge" onClick={() => action('Following creator')}>Follow</button>
                <button className="badge" onClick={() => action('Saved to playlist')}>Save</button>
                <button
                  className="badge"
                  onClick={() => {
                    addToQueue(song as any);
                    play(song as any);
                  }}
                >
                  Play
                </button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      <button className="btn w-full" onClick={() => setPage((current) => current + 1)}>Load more</button>
    </div>
  );
}
