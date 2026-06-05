import { notFound } from 'next/navigation';
import Link from 'next/link';
import { VoiceCreatorProfile } from '@/components/voice-marketplace/VoiceCreatorProfile';
import { getVoiceCreatorById, getVoiceModels } from '@/lib/platform/voiceMarketplace';

export default async function VoiceCreatorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const creator = getVoiceCreatorById(id);
  if (!creator) return notFound();

  const portfolio = getVoiceModels().filter((voice) => voice.creator.id === creator.id && voice.moderationStatus === 'APPROVED');

  return (
    <div className="space-y-4 pb-6">
      <VoiceCreatorProfile creator={creator} portfolio={portfolio} />
      <div className="row">
        <Link href="/marketplace/voices" className="badge">Back to voice marketplace</Link>
      </div>
    </div>
  );
}
