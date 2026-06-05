import Link from 'next/link';
import PersonalizedHomeFeed from '@/components/platform/PersonalizedHomeFeed';
import SongRecommendationMetrics from '@/components/platform/SongRecommendationMetrics';
import { getTrendingSongs } from '@/lib/platform/recommendationEngine';

const sections = [
  'AI song generation',
  'Viral feed',
  'Creator monetization',
  'Remix community',
  'Marketplace',
  'AI video tools',
];

export default function HomePage() {
  const trendingSongs = getTrendingSongs({ limit: 3 });

  return (
    <div className="space-y-10 pb-8">
      <section className="hero-section">
        <div className="hero-content">
          <p className="badge">The Future of Sound Starts Here.</p>
          <h1 className="hero-title">Create, Stream, Remix, and Monetize AI Music.</h1>
          <p className="hero-description">
            AIXENTRA is the next-generation AI music platform for creators, fans, and the future of sound.
          </p>
          <div className="hero-actions">
            <Link href="/generate" className="btn">Start Creating</Link>
            <Link href="/feed" className="btn secondary">Explore Music</Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <article key={section} className="card bg-white/5 backdrop-blur-sm">
            <h3>{section}</h3>
            <p className="muted mt-2">Production-ready scaffolding with reusable UI and backend placeholders.</p>
          </article>
        ))}
      </section>

      <PersonalizedHomeFeed />

      <section className="card bg-white/5 backdrop-blur-sm">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h2>Now trending</h2>
          <Link href="/trending" className="badge">View all</Link>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {trendingSongs.map((song) => (
            <div key={song.id} className="rounded-2xl border border-white/10 bg-black/30 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={song.coverUrl} alt={song.title} className="h-36 w-full rounded-xl object-cover" />
              <p className="mt-3 font-semibold">{song.title}</p>
              <p className="muted">{song.creatorName} · {song.genre}</p>
              <SongRecommendationMetrics song={song} className="muted mt-1" showWatchTime showShares />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
