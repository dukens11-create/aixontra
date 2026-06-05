import SongRecommendationMetrics from '@/components/platform/SongRecommendationMetrics';
import { calculateTrendingScore, getTrendingSongs } from '@/lib/platform/recommendationEngine';

export default function TrendingPage() {
  const ranked = getTrendingSongs();

  return (
    <div className="space-y-4 pb-6">
      <section className="card bg-white/5"><h1>Trending</h1><p className="muted">Ranking signal combines plays, likes, comments, shares, remixes, watch time, and recency decay.</p></section>
      <section className="space-y-2">
        {ranked.map((song, index) => (
          <article key={song.id} className="card row justify-between bg-black/30">
            <div>
              <p className="text-sm text-cyan-300">#{index + 1}</p>
              <p className="font-semibold">{song.title}</p>
              <p className="muted">{song.creatorName}</p>
              <SongRecommendationMetrics song={song} className="muted" showLikes showShares showRemixes />
            </div>
            <span className="badge">Score {Math.round(calculateTrendingScore(song).score)}</span>
          </article>
        ))}
      </section>
    </div>
  );
}
