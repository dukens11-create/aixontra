import { notFound } from 'next/navigation';
import { VoiceDetailView } from '@/components/voice-marketplace/VoiceDetailView';
import { getVoiceModelById } from '@/lib/platform/voiceMarketplace';

export default async function VoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const voice = getVoiceModelById(id);
  if (!voice) return notFound();
  return <VoiceDetailView voice={voice} />;
}
