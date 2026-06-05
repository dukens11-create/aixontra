'use client';

import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import SongRecommendationMetrics from '@/components/platform/SongRecommendationMetrics';
import { toTrack } from '@/lib/platform/toTrack';
import { usePlayerStore } from '@/stores/playerStore';
import { DEFAULT_RECOMMENDATION_USER_ID, getPersonalizedFeed } from '@/lib/platform/recommendationEngine';

const DEFAULT_HISTORY_WATCH_TIME_SECONDS = 45;

export default function FeedPage() {
  const [page, setPage] = useState(1);
  const play = usePlayerStore((state) => state.play);
  const addToQueue = usePlayerStore((state) => state.addToQueue);

  const personalizedFeed = useMemo(() => getPersonalizedFeed({ userId: DEFAULT_RECOMMENDATION_USER_ID, limit: 6 }), []);
  const feedSongs = useMemo(
    () => Array.from({ length: page }).flatMap(() => personalizedFeed.songs),
    [page, personalizedFeed.songs],
  );

  const action = (message: string) => toast.success(message);
  const trackListen = useCallback(async (songId: string) => {
    try {
      await fetch('/api/recommendations/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: DEFAULT_RECOMMENDATION_USER_ID,
          songId,
          watchTimeSeconds: DEFAULT_HISTORY_WATCH_TIME_SECONDS,
          completed: false,
        }),
      });
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to record listening history', error);
      }
    }
  }, []);

  return (
    <div className="space-y-4 pb-6">
      <div className="card bg-white/5 backdrop-blur-sm">
        <h1>Discovery Feed</h1>
        <p className="muted">
          Personalized ranking blends plays, likes, comments, shares, remixes, watch time, and recency with listening history analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="card bg-black/30">
          <p className="font-semibold">Top genres</p>
          <p className="muted mt-2">{personalizedFeed.historyAnalysis.topGenres.join(', ') || 'Still learning'}</p>
        </div>
        <div className="card bg-black/30">
          <p className="font-semibold">Top creators</p>
          <p className="muted mt-2">{personalizedFeed.historyAnalysis.topCreators.join(', ') || 'Still learning'}</p>
        </div>
        <div className="card bg-black/30">
          <p className="font-semibold">ML-ready placeholders</p>
          <p className="muted mt-2">Collaborative filtering + taste embeddings are scaffolded for future model integration.</p>
        </div>
      </div>

      {personalizedFeed.songs.length === 0 ? <div className="card bg-black/30">No tracks yet. Follow creators or generate your first song.</div> : <div className="space-y-4">
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
                <SongRecommendationMetrics
                  song={song}
                  className="muted"
                  showLikes
                  showComments
                  showShares
                  showRemixes
                />
                <p className="muted">Recommendation score: {Math.round(song.score)}</p>
                <ul className="mt-3 space-y-1 text-sm text-slate-200">
                  {song.reasons.map((reason) => (
                    <li key={reason}>• {reason}</li>
                  ))}
                </ul>
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
                    void trackListen(song.id);
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
