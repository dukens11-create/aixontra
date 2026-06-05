import { VoiceCreator, VoiceModel } from '@/lib/platform/voiceMarketplace';
import { VoiceCard } from './VoiceCard';

export function VoiceCreatorProfile({ creator, portfolio }: { creator: VoiceCreator; portfolio: VoiceModel[] }) {
  return (
    <div className="space-y-4">
      <section className="card bg-white/5">
        <div className="row justify-between">
          <div className="row">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={creator.avatarUrl} alt={creator.stageName} className="h-16 w-16 rounded-full object-cover" />
            <div>
              <h1>{creator.stageName}</h1>
              <p className="muted">{creator.bio}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">${creator.totalRoyaltyEarningsUsd.toFixed(2)}</p>
            <p className="muted">Royalty earnings (placeholder)</p>
          </div>
        </div>
        <p className="muted mt-3">Settlement wallet: {creator.payoutWalletHint} · payout integration TODO</p>
      </section>
      <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {portfolio.length === 0 ? <p className="muted">No approved voices in this portfolio yet.</p> : portfolio.map((voice) => <VoiceCard key={voice.id} voice={voice} />)}
      </section>
    </div>
  );
}
