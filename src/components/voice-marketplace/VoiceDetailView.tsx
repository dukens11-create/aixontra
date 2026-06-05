import Link from 'next/link';
import { VoiceModel, estimateRoyaltySettlement } from '@/lib/platform/voiceMarketplace';
import { VoicePreviewPlayer } from './VoicePreviewPlayer';

export function VoiceDetailView({ voice }: { voice: VoiceModel }) {
  const settlementPreview = estimateRoyaltySettlement(voice, voice.priceUsd);

  return (
    <div className="space-y-4 pb-6">
      <section className="card bg-white/5">
        <div className="row justify-between">
          <h1>{voice.title}</h1>
          <span className="badge">{voice.moderationStatus}</span>
        </div>
        <p className="mt-2">{voice.description}</p>
        <div className="row mt-3">
          <span className="badge">{voice.category}</span>
          {voice.tags.map((tag) => <span key={tag} className="badge">#{tag}</span>)}
        </div>
      </section>

      <section className="card bg-black/30">
        <h2>Voice preview</h2>
        <VoicePreviewPlayer audioUrl={voice.previewAudioUrl} waveformPoints={voice.waveformPoints} title={voice.title} />
      </section>

      <section className="card bg-white/5">
        <h2>Licensing & pricing</h2>
        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
          <p><span className="muted">License:</span> {voice.licenseType}</p>
          <p><span className="muted">Price:</span> ${voice.priceUsd}</p>
          <p><span className="muted">Commercial use:</span> {voice.commercialUseEnabled ? 'Allowed' : 'Disabled'}</p>
          <p><span className="muted">Creator royalty:</span> {voice.royaltyPercent}%</p>
        </div>
      </section>

      <section className="card bg-white/5">
        <h2>Moderation</h2>
        <p className="muted mt-2">Consent: {voice.consentVerified ? 'Verified' : 'Pending'} · Impersonation detection: {voice.impersonationDetectionStatus}</p>
        <p className="muted">Admin note: {voice.adminNote}</p>
      </section>

      <section className="card bg-white/5">
        <h2>Royalty settlement preview</h2>
        <p className="muted mt-2">{settlementPreview.note}</p>
        <div className="row mt-2">
          <span className="badge">Creator ${settlementPreview.creatorRoyaltyUsd.toFixed(2)}</span>
          <span className="badge">Platform ${settlementPreview.platformNetUsd.toFixed(2)}</span>
          <span className="badge">{settlementPreview.settlementStatus}</span>
        </div>
      </section>

      <div className="row">
        <Link href={`/marketplace/voices/creator/${voice.creator.id}`} className="badge">View creator profile</Link>
        <Link href="/marketplace/voices" className="badge">Back to voice marketplace</Link>
      </div>
    </div>
  );
}
