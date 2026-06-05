import Link from 'next/link';
import {
  challenges,
  challengeSubmissions,
  remixNodes,
} from '@/lib/platform/viralGrowthData';
import { RemixChainView } from '@/components/RemixChain';

type Params = Promise<{ id: string }>;

export default async function ChallengeDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const challenge = challenges.find((c) => c.id === id);

  if (!challenge) {
    return (
      <div className="card text-center py-16">
        <p className="text-4xl mb-3">🔍</p>
        <h2>Challenge not found</h2>
        <Link href="/challenges" className="btn mt-4 inline-block">Back to Challenges</Link>
      </div>
    );
  }

  const subs = challengeSubmissions.filter((s) => s.challengeId === id);
  const sorted = [...subs].sort((a, b) => b.votes - a.votes);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="card overflow-hidden p-0">
        <div className="relative h-48 overflow-hidden rounded-t-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={challenge.coverUrl}
            alt={challenge.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-white">{challenge.title}</h1>
            <p className="text-cyan-300 font-mono text-sm mt-1">{challenge.hashtag}</p>
          </div>
        </div>
        <div className="p-4 flex flex-col gap-2">
          <p className="text-muted-foreground">{challenge.description}</p>
          <div className="flex flex-wrap gap-2 mt-1">
            <span className="badge">🎵 {challenge.submissionCount} submissions</span>
            <span className="badge">by {challenge.creatorName}</span>
            {challenge.prizePool && (
              <span className="badge text-yellow-400">💰 ${challenge.prizePool} prize pool</span>
            )}
          </div>
          <div className="flex gap-2 mt-2">
            <Link href="/challenges" className="btn secondary text-sm">← Back</Link>
          </div>
        </div>
      </div>

      {/* Submissions */}
      <div className="card flex flex-col gap-3">
        <h2>🎵 Submissions ({subs.length})</h2>
        {sorted.length === 0 ? (
          <p className="muted text-sm">No submissions yet. Be the first to join!</p>
        ) : (
          <div className="flex flex-col gap-2">
            {sorted.map((sub, i) => (
              <div key={sub.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-black/20 px-3 py-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-bold text-cyan-300 w-5 text-center">#{i + 1}</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{sub.songTitle}</p>
                    <p className="muted text-xs">by {sub.creatorName}</p>
                  </div>
                </div>
                <span className="badge shrink-0">🗳 {sub.votes.toLocaleString()} votes</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Remix Chain (for context) */}
      <div className="card flex flex-col gap-3">
        <h2>🔀 Related Remix Chain</h2>
        <p className="muted text-xs">Tracks that have been remixed and evolved from the challenge source.</p>
        <RemixChainView nodes={remixNodes} />
      </div>
    </div>
  );
}
