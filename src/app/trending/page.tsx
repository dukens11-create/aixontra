import { songs } from '@/lib/platform/demoData';

export default function TrendingPage() {
  const LIKE_WEIGHT = 3;
  const REMIX_WEIGHT = 4;
  const score = (song: (typeof songs)[number]) => song.plays + song.likes * LIKE_WEIGHT + song.remixes * REMIX_WEIGHT;
  const ranked = [...songs].sort((a, b) => score(b) - score(a));

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
            <span className="badge">Growth +{Math.max(5, Math.floor(song.likes / 100))}%</span>
          </article>
        ))}
      </section>
    </div>
  );
}
