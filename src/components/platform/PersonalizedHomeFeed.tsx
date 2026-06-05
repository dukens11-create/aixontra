'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_RECOMMENDATION_USER_ID, type RecommendationFeed } from '@/lib/platform/recommendationEngine';

const FEED_ENDPOINT = `/api/recommendations/feed?userId=${DEFAULT_RECOMMENDATION_USER_ID}&limit=4`;

export default function PersonalizedHomeFeed() {
  const [feed, setFeed] = useState<RecommendationFeed | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFeed = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(FEED_ENDPOINT, { signal, cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Unable to load recommendations right now.');
      }

      const data = (await response.json()) as RecommendationFeed;
      setFeed(data);
    } catch (loadError) {
      if (signal?.aborted) return;
      setError(loadError instanceof Error ? loadError.message : 'Unable to load recommendations right now.');
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadFeed(controller.signal);
    return () => controller.abort();
  }, [loadFeed]);

  return (
    <section className="card space-y-4 bg-white/5 backdrop-blur-sm">
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p className="badge">Personalized home feed</p>
          <h2 className="mt-3">For your ears</h2>
          <p className="muted mt-2">
            Combining listening history analysis, trending momentum, and ready-for-ML placeholders.
          </p>
        </div>
        <Link href="/feed" className="badge">Open feed</Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="h-36 animate-pulse rounded-xl bg-white/10" />
              <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-white/10" />
              <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-white/10" />
            </div>
          ))}
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-950/30 p-4">
          <p className="font-semibold">Recommendations are taking a breather.</p>
          <p className="muted mt-2">{error}</p>
          <button className="btn mt-3" onClick={() => void loadFeed()}>
            Retry
          </button>
        </div>
      ) : null}

      {!isLoading && !error && feed?.songs.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <p className="font-semibold">No recommendations yet.</p>
          <p className="muted mt-2">Play a few tracks and the recommendation engine will tune the feed.</p>
        </div>
      ) : null}

      {!isLoading && !error && feed ? (
        <>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {feed.songs.map((song) => (
              <article key={song.id} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={song.coverUrl} alt={song.title} className="h-40 w-full rounded-xl object-cover" />
                <div className="mt-3">
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <h3>{song.title}</h3>
                    <span className="badge">Score {Math.round(song.score)}</span>
                  </div>
                  <p className="muted mt-2">{song.creatorName} · {song.genre} · {song.mood}</p>
                  <p className="muted mt-2">
                    {song.plays.toLocaleString()} plays · {(song.shares ?? 0).toLocaleString()} shares · {Math.round(song.averageWatchTimeSeconds ?? 0)}s avg watch
                  </p>
                  <ul className="mt-3 space-y-1 text-sm text-slate-200">
                    {song.reasons.map((reason) => (
                      <li key={reason}>• {reason}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="font-semibold">Listening history analysis</p>
              <p className="muted mt-2">
                Top genres: {feed.historyAnalysis.topGenres.join(', ') || 'Not enough history yet'}
              </p>
              <p className="muted mt-2">
                Top creators: {feed.historyAnalysis.topCreators.join(', ') || 'Still learning'}
              </p>
              <p className="muted mt-2">
                Avg watch time: {Math.round(feed.historyAnalysis.averageWatchTimeSeconds)}s · Completion rate:{' '}
                {Math.round(feed.historyAnalysis.completionRate * 100)}%
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="font-semibold">Collaborative filtering</p>
              <p className="muted mt-2">{feed.placeholders.collaborativeFiltering.message}</p>
              <p className="muted mt-2">Next: {feed.placeholders.collaborativeFiltering.readyFor.join(', ')}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="font-semibold">Taste embeddings</p>
              <p className="muted mt-2">
                Placeholder vector dimensions: {feed.placeholders.userTasteEmbeddings.dimensions}
              </p>
              <p className="muted mt-2">
                Seed signals: {feed.placeholders.userTasteEmbeddings.seedSignals.join(', ')}
              </p>
              <Link href="/trending" className="badge mt-3 inline-flex">See trending inputs</Link>
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
