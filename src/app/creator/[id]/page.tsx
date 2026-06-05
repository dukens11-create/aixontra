import Link from 'next/link';
import { creators, songs } from '@/lib/platform/demoData';

export default async function CreatorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const creator = creators.find((entry) => entry.id === id) ?? creators[0];
  const creatorSongs = songs.filter((song) => song.creatorId === creator.id);

  return (
    <div className="space-y-4 pb-6">
      <section className="card overflow-hidden bg-white/5 backdrop-blur-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={creator.bannerUrl} alt={creator.stageName} className="h-40 w-full rounded-xl object-cover" />
        <div className="-mt-10 row px-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={creator.avatarUrl} alt={creator.stageName} className="h-20 w-20 rounded-full border-4 border-slate-950 object-cover" />
          <div>
            <h1>{creator.stageName} {creator.verified ? '✔' : ''}</h1>
            <p className="muted">{creator.bio}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl border border-white/10 p-2"><p className="text-lg font-semibold">{creator.followers.toLocaleString()}</p><p className="muted">Followers</p></div>
          <div className="rounded-xl border border-white/10 p-2"><p className="text-lg font-semibold">{creator.monthlyListeners.toLocaleString()}</p><p className="muted">Monthly listeners</p></div>
          <div className="rounded-xl border border-white/10 p-2"><p className="text-lg font-semibold">{creator.totalPlays.toLocaleString()}</p><p className="muted">Total plays</p></div>
        </div>
        <div className="row mt-4">
          <button className="btn">Follow</button>
          <button className="btn secondary">Tip / Support</button>
        </div>
      </section>

      <section className="card bg-white/5 backdrop-blur-sm">
        <h2>Songs</h2>
        <div className="mt-3 space-y-2">
          {creatorSongs.map((song) => (
            <div key={song.id} className="row justify-between rounded-xl border border-white/10 p-3">
              <div>
                <p className="font-semibold">{song.title}</p>
                <p className="muted">{song.genre} · {song.mood}</p>
              </div>
              <Link href={`/remix/${song.id}`} className="badge">Remix</Link>
            </div>
          ))}
        </div>
      </section>

      <section className="card bg-white/5 backdrop-blur-sm">
        <h2>Remix lineage</h2>
        <p className="muted mt-2">{creatorSongs[0]?.title} → Midnight Kompa Signals (Club Edit) → Neon Sunrise Festival Mix</p>
      </section>
    </div>
  );
}
