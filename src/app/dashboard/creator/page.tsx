import { songs } from '@/lib/platform/demoData';

export default function CreatorDashboardPage() {
  return (
    <div className="space-y-4 pb-6">
      <section className="card bg-white/5">
        <h1>Creator Dashboard</h1>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-white/10 p-3"><p className="text-xl font-bold">154k</p><p className="muted">Plays</p></div>
          <div className="rounded-xl border border-white/10 p-3"><p className="text-xl font-bold">12.8k</p><p className="muted">Followers</p></div>
          <div className="rounded-xl border border-white/10 p-3"><p className="text-xl font-bold">$4,290</p><p className="muted">Earnings</p></div>
        </div>
      </section>

      <section className="card bg-white/5">
        <h2>Published songs & drafts</h2>
        <div className="mt-3 space-y-2">
          {songs.map((song, index) => (
            <div key={song.id} className="rounded-xl border border-white/10 p-3">
              <div className="row justify-between"><p className="font-semibold">{song.title}</p><span className="badge">{index === 0 ? 'Draft' : 'Published'}</span></div>
              <p className="muted">{song.genre} · {song.mood} · {song.plays} plays</p>
              <div className="row mt-2">
                <button className="badge">Edit metadata</button>
                <button className="badge">Delete / Unpublish</button>
                <input className="input max-w-sm" placeholder="Cover art upload URL" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card bg-white/5">
        <h2>Payout status</h2>
        <p className="muted mt-2">Stripe Connect onboarding placeholder: account linked, payouts pending KYC verification.</p>
      </section>

      <section className="card bg-white/5">
        <h2>AI video / visual tools</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button className="badge">Generate album cover</button>
          <button className="badge">Generate lyric video</button>
          <button className="badge">Create animated visualizer</button>
          <button className="badge">Create TikTok/Reels short</button>
        </div>
      </section>
    </div>
  );
}
