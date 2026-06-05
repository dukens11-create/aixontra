import Link from 'next/link';
import { songs } from '@/lib/platform/demoData';
import { recommendationScore, rankSongs } from '@/lib/platform/recommendations';
import { dailyTrendingSnapshot, challenges } from '@/lib/platform/viralGrowthData';
import { rankChallenges } from '@/lib/services/viralGrowthService';

export default function TrendingPage() {
  const ranked = rankSongs(songs);
  const snapshot = dailyTrendingSnapshot;
  const trendingChallenges = rankChallenges(challenges).slice(0, 3);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <section className="card bg-white/5">
        <h1>Daily Trending</h1>
        <p className="muted">
          Updated daily — top tracks, rising creators, and hottest challenges for{' '}
          <span className="text-cyan-300">{snapshot.date}</span>.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <Link href="/leaderboard" className="badge">🏆 Leaderboard</Link>
          <Link href="/challenges" className="badge">⚡ Challenges</Link>
          <Link href="/achievements" className="badge">🎖️ Achievements</Link>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {/* Top Tracks */}
        <section className="card flex flex-col gap-3">
          <h2 className="text-lg">🔥 Top Tracks</h2>
          <div className="flex flex-col gap-2">
            {snapshot.topTracks.map((track, i) => (
              <div key={track.songId} className="flex items-center justify-between gap-2 rounded-xl border border-border bg-black/20 px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-bold text-cyan-300 w-5 text-center">#{i + 1}</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{track.title}</p>
                    <p className="muted text-xs">{track.creatorName}</p>
                  </div>
                </div>
                <span className="badge shrink-0">{track.score.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Rising Creators */}
        <section className="card flex flex-col gap-3">
          <h2 className="text-lg">📈 Rising Creators</h2>
          <div className="flex flex-col gap-2">
            {snapshot.topCreators.map((creator, i) => (
              <div key={creator.creatorId} className="flex items-center justify-between gap-2 rounded-xl border border-border bg-black/20 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-purple-300 w-5 text-center">#{i + 1}</span>
                  <p className="font-semibold text-sm">{creator.name}</p>
                </div>
                <span className="badge text-green-400 border-green-500/30">+{creator.followerGain} followers</span>
              </div>
            ))}
          </div>
          <Link href="/leaderboard" className="btn secondary text-center text-sm mt-1">Full Leaderboard →</Link>
        </section>

        {/* Hot Challenges */}
        <section className="card flex flex-col gap-3">
          <h2 className="text-lg">⚡ Hot Challenges</h2>
          <div className="flex flex-col gap-2">
            {snapshot.topChallenges.map((c, i) => (
              <div key={c.challengeId} className="flex items-center justify-between gap-2 rounded-xl border border-border bg-black/20 px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-bold text-yellow-300 w-5 text-center">#{i + 1}</span>
                  <p className="font-semibold text-sm truncate">{c.title}</p>
                </div>
                <span className="badge">+{c.newSubmissions} today</span>
              </div>
            ))}
          </div>
          <Link href="/challenges" className="btn secondary text-center text-sm mt-1">All Challenges →</Link>
        </section>
      </div>

      {/* All Tracks Ranked */}
      <section className="card flex flex-col gap-3">
        <h2>All Tracks Ranked</h2>
        <p className="muted text-xs">Score = plays + likes×3 + comments×4 + remixes×5 + recency boost</p>
        <div className="flex flex-col gap-2">
          {ranked.map((song, index) => (
            <article key={song.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-black/20 px-3 py-2.5">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-sm font-bold text-cyan-300 w-6 text-center">#{index + 1}</span>
                <div className="min-w-0">
                  <p className="font-semibold truncate">{song.title}</p>
                  <p className="muted text-xs">{song.creatorName} · {song.plays.toLocaleString()} plays · {song.likes.toLocaleString()} likes · {song.remixes} remixes</p>
                </div>
              </div>
              <span className="badge shrink-0">Score {Math.round(recommendationScore(song))}</span>
            </article>
          ))}
        </div>
      </section>

      {/* Active Challenges Preview */}
      <section className="card flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2>Active Challenges</h2>
          <Link href="/challenges" className="badge">View all →</Link>
        </div>
        <div className="flex flex-col gap-2">
          {trendingChallenges.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-black/20 px-3 py-2.5">
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{c.title}</p>
                <p className="muted text-xs">{c.hashtag} · {c.submissionCount} submissions</p>
              </div>
              <div className="flex gap-2 shrink-0">
                {c.prizePool && <span className="badge text-yellow-400">💰 ${c.prizePool}</span>}
                <Link href="/challenges" className="badge">Join →</Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
