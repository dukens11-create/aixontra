export default function AdminPage() {
  return (
    <div className="space-y-4 pb-6">
      <section className="card bg-white/5"><h1>Admin Ops Dashboard</h1><p className="muted">Moderation and platform operations controls.</p></section>
      <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="card bg-black/30"><h2>Users & creators</h2><p className="muted mt-2">Approve creators, ban users (placeholder action).</p><div className="row mt-3"><button className="badge">Approve creator</button><button className="badge">Ban user</button></div></div>
        <div className="card bg-black/30"><h2>Song moderation</h2><p className="muted mt-2">Remove unsafe/copyrighted content and feature songs.</p><div className="row mt-3"><button className="badge">Flag removal</button><button className="badge">Feature song</button></div></div>
        <div className="card bg-black/30"><h2>Platform analytics</h2><p className="muted mt-2">DAU: 12,203 · Streams: 1.9M · GMV: $38,200</p></div>
        <div className="card bg-black/30"><h2>Marketplace transactions</h2><p className="muted mt-2">Latest payouts and purchases (Stripe Connect placeholder table).</p></div>
      </section>
    </div>
  );
}
