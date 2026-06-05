import { songs } from '@/lib/platform/demoData';
import { recommendationScore, rankSongs } from '@/lib/platform/recommendations';

export default function TrendingPage() {
  const ranked = rankSongs(songs);

  return (
    <div className="space-y-4 pb-6">
      <section className="card bg-white/5"><h1>Trending</h1><p className="muted">Ranking signal combines plays, likes, shares proxy, remixes, and growth approximation.</p></section>
      <section className="space-y-2">
        {ranked.map((song, index) => (
          <article key={song.id} className="card row justify-between bg-black/30">
            <div>
              <p className="text-sm text-cyan-300">#{index + 1}</p>
              <p className="font-semibold">{song.title}</p>
              <p className="muted">{song.creatorName} · {song.plays} plays · {song.likes} likes · {song.remixes} remixes</p>
            </div>
            <span className="badge">Score {Math.round(recommendationScore(song))}</span>
          </article>
        ))}
      </section>
    </div>
  );
}
