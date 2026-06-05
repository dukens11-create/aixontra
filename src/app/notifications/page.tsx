const notifications = [
  'New follower: FutureDrill followed you.',
  'Like: Midnight Kompa Signals received 120 new likes.',
  'Comment: New comment on Chrome Street Psalms.',
  'Remix: Your track was remixed into Neon Sunrise Mix.',
  'Purchase: Afrobeat Heatwave Kit sold for $79.',
  'Payout update: Stripe payout scheduled for Friday.',
  'Collaboration invite: Join Neon Camp Session room.',
];

export default function NotificationsPage() {
  return (
    <div className="space-y-4 pb-6">
      <section className="card bg-white/5"><h1>Notification Center</h1><p className="muted">Follower, engagement, remix, purchase, payout, and collaboration updates.</p></section>
      {notifications.map((entry) => (
        <article key={entry} className="card bg-black/30"><p>{entry}</p></article>
      ))}
    </div>
  );
}
