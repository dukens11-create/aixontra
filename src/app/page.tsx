'use client';

import Link from 'next/link';
import { useI18n } from '@/components/providers/I18nProvider';
import { songs } from '@/lib/platform/demoData';

export default function HomePage() {
  const { t, tm } = useI18n();
  const sections = tm('home.sections') as string[];

  return (
    <div className="space-y-10 pb-8">
      <section className="hero-section">
        <div className="hero-content">
          <p className="badge">{t('home.badge')}</p>
          <h1 className="hero-title">{t('home.title')}</h1>
          <p className="hero-description">
            {t('home.description')}
          </p>
          <div className="hero-actions">
            <Link href="/generate" className="btn">{t('home.startCreating')}</Link>
            <Link href="/feed" className="btn secondary">{t('home.exploreMusic')}</Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <article key={section} className="card bg-white/5 backdrop-blur-sm">
            <h3>{section}</h3>
            <p className="muted mt-2">{t('home.sectionDescription')}</p>
          </article>
        ))}
      </section>

      <section className="card bg-white/5 backdrop-blur-sm">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h2>{t('home.nowTrending')}</h2>
          <Link href="/trending" className="badge">{t('home.viewAll')}</Link>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {songs.slice(0, 3).map((song) => (
            <div key={song.id} className="rounded-2xl border border-white/10 bg-black/30 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={song.coverUrl} alt={song.title} className="h-36 w-full rounded-xl object-cover" />
              <p className="mt-3 font-semibold">{song.title}</p>
              <p className="muted">{song.creatorName} · {song.genre}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
