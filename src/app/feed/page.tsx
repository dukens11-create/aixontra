'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { songs } from '@/lib/platform/demoData';
import { toTrack } from '@/lib/platform/toTrack';
import { usePlayerStore } from '@/stores/playerStore';
import { rankSongs, recommendationScore } from '@/lib/platform/recommendations';

export default function FeedPage() {
  const [page, setPage] = useState(1);
  const play = usePlayerStore((state) => state.play);
  const addToQueue = usePlayerStore((state) => state.addToQueue);

  const rankedSongs = useMemo(() => rankSongs(songs), []);
  const feedSongs = useMemo(() => Array.from({ length: page }).flatMap(() => rankedSongs), [page, rankedSongs]);

  const action = (message: string) => toast.success(message);

  return (
    <div className="space-y-4 pb-6">
      <div className="card bg-white/5 backdrop-blur-sm">
        <h1>Discovery Feed</h1>
        <p className="muted">Vertical, mobile-first discovery optimized for fast swipe/scroll sessions. Ranking score = plays + likes*3 + comments*4 + remixes*5 + recentBoost.</p>
      </div>

      {rankedSongs.length === 0 ? <div className="card bg-black/30">No tracks yet. Follow creators or generate your first song.</div> : <div className="space-y-4">
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
                <audio src={song.audioUrl} controls className="mt-3 w-full" />
                <h2 className="mt-3">{song.title}</h2>
                <p className="muted">{song.creatorName} · {song.genre} · {song.mood}</p>
                <p className="muted">{song.likes} likes · {song.plays} plays · {song.comments} comments · {song.remixes} remixes</p>
                <p className="muted">Recommendation score: {Math.round(recommendationScore(song))}</p>
              </div>
              <div className="flex flex-row gap-2 md:flex-col">
                <button className="badge" onClick={() => action('Liked song')}>Like</button>
                <button className="badge" onClick={() => action('Comment opened')}>Comment</button>
                <Link href={`/remix/${song.id}`} className="badge">Remix</Link>
                <button className="badge" onClick={() => action('Shared to TikTok placeholder')}>TikTok</button>
                <button className="badge" onClick={() => action('Shared to YouTube Shorts placeholder')}>YouTube Shorts</button>
                <button className="badge" onClick={() => action('Shared to Instagram Reels placeholder')}>Instagram Reels</button>
                <button className="badge" onClick={() => action('Copy link placeholder')}>Copy Link</button>
                <button className="badge" onClick={() => action('Short clip download placeholder')}>Short Clip</button>
                <button className="badge" onClick={() => action('Following creator')}>Follow</button>
                <button className="badge" onClick={() => action('Saved to playlist')}>Save</button>
                <button
                  className="badge"
                  onClick={() => {
                    const track = toTrack(song);
                    addToQueue(track);
                    play(track);
                  }}
                >
                  Play
                </button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>}

      <button className="btn w-full" onClick={() => setPage((current) => current + 1)}>Load more</button>
    </div>
  );
}
