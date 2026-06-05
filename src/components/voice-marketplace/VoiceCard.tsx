import Link from 'next/link';
import { VoiceModel } from '@/lib/platform/voiceMarketplace';
import { VoicePreviewPlayer } from './VoicePreviewPlayer';

export function VoiceCard({ voice }: { voice: VoiceModel }) {
  return (
    <article className="card space-y-3 bg-black/30">
      <div className="row justify-between">
        <div>
          <h3>{voice.title}</h3>
          <p className="muted">{voice.category} · {voice.licenseType} license</p>
        </div>
        <span className="badge">{voice.moderationStatus}</span>
      </div>
      <p>{voice.description}</p>
      <VoicePreviewPlayer audioUrl={voice.previewAudioUrl} waveformPoints={voice.waveformPoints} title={voice.title} />
      <div className="row justify-between">
        <p className="text-lg font-semibold">${voice.priceUsd}</p>
        <p className="muted">Royalty {voice.royaltyPercent}%</p>
      </div>
      <div className="row justify-between">
        <p className="muted">{voice.commercialUseEnabled ? 'Commercial use enabled' : 'Non-commercial only'}</p>
        <p className="muted">Trending score: {voice.trendingScore}</p>
      </div>
      <div className="row">
        <Link href={`/marketplace/voices/${voice.id}`} className="badge">View voice</Link>
        <Link href={`/marketplace/voices/creator/${voice.creator.id}`} className="badge">Creator profile</Link>
      </div>
    </article>
  );
}
