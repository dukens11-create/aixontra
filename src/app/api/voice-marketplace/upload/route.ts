import { NextResponse } from 'next/server';
import { createVoiceModel } from '@/lib/platform/voiceMarketplace';

export async function POST(request: Request) {
  const body = await request.json();
  const tagCandidates: unknown[] = Array.isArray(body.tags) ? body.tags : [];
  const result = createVoiceModel({
    creatorId: typeof body.creatorId === 'string' ? body.creatorId : 'creator-1',
    title: typeof body.title === 'string' ? body.title : '',
    description: typeof body.description === 'string' ? body.description : '',
    category: typeof body.category === 'string' ? body.category : '',
    tags: tagCandidates.filter((tag): tag is string => typeof tag === 'string'),
    previewAudioUrl: typeof body.previewAudioUrl === 'string' ? body.previewAudioUrl : undefined,
    licenseType: body.licenseType === 'exclusive' || body.licenseType === 'subscription' ? body.licenseType : 'standard',
    priceUsd: Number(body.priceUsd) || 0,
    commercialUseEnabled: Boolean(body.commercialUseEnabled),
    royaltyPercent: Number(body.royaltyPercent) || 0,
    consentVerified: Boolean(body.consentVerified),
    consentProofUrl: typeof body.consentProofUrl === 'string' ? body.consentProofUrl : '',
  });

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    model: result.model,
    previewGeneration: {
      status: 'generated',
      storagePath: `voices/${result.model.id}/preview.mp3`,
      waveformPointCount: result.model.waveformPoints.length,
    },
  });
}
