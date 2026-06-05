import { marketplaceItems } from '@/lib/platform/demoData';

export default function MarketplacePage() {
  return (
    <div className="space-y-4 pb-6">
      <section className="card bg-white/5">
        <h1>Marketplace</h1>
        <p className="muted">Beats, AI songs, vocal packs, voice models, and license products with Stripe Connect-ready split architecture.</p>
      </section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {marketplaceItems.map((item) => (
          <article key={item.id} className="card bg-black/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.cover} alt={item.title} className="h-44 w-full rounded-xl object-cover" />
            <h3 className="mt-3">{item.title}</h3>
            <p className="muted">{item.type} · {item.licenseType} · by {item.seller}</p>
            <p className="mt-2">{item.description}</p>
            <audio controls src={item.previewAudioUrl} className="mt-3 w-full" />
            <div className="row mt-3 justify-between">
              <p className="text-lg font-semibold">${item.price}</p>
              <button className="btn">Buy</button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
