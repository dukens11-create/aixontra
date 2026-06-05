import { songs } from '@/lib/platform/demoData';

export default function LibraryPage() {
  return (
    <div className="space-y-4 pb-6">
      <section className="card bg-white/5"><h1>Playlists & Library</h1><p className="muted">Create playlists, save songs, manage likes, and track listening history.</p></section>
      <section className="card bg-white/5">
        <div className="row"><input className="input max-w-sm" placeholder="New playlist name" /><button className="btn">Create playlist</button></div>
      </section>
      <section className="card bg-white/5">
        <h2>Saved songs</h2>
        {songs.map((song) => (
          <div key={song.id} className="row mt-2 justify-between rounded-xl border border-white/10 p-2">
            <p>{song.title}</p>
            <div className="row"><button className="badge">Add to playlist</button><button className="badge">Remove</button></div>
          </div>
        ))}
      </section>
      <section className="card bg-white/5"><h2>Listening history</h2><p className="muted mt-2">Today: Midnight Kompa Signals • Chrome Street Psalms • Pulse of Tomorrow</p></section>
    </div>
  );
}
