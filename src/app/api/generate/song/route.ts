import { NextResponse } from 'next/server';
import { createGeneratedDraft, getCreditPacks, getUserGenerationContext, recordGenerationCost, reserveGenerationCredits } from '@/lib/platform/platformStore';
import { generateWithFailover, getProviderHealth } from '@/lib/platform/generationProvider';

export async function POST(request: Request) {
  const buildStemsPayload = (
    canExportStems: boolean,
    stemsUrls: Record<'vocals' | 'drums' | 'bass' | 'melody' | 'instrumental' | 'fullMix', string>,
  ) => (canExportStems ? stemsUrls : undefined);

  const body = await request.json();
  if (!body.prompt?.trim()) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  if (typeof body.userId !== 'string' || !body.userId.trim()) {
    return NextResponse.json({ error: 'Authentication required: userId is missing.' }, { status: 401 });
  }
  const userId = body.userId.trim();
  const requestedDuration = typeof body.targetDurationSeconds === 'number' ? body.targetDurationSeconds : 120;
  const userContext = getUserGenerationContext(userId);
  if (requestedDuration > userContext.capabilities.maxSongLengthSeconds) {
    return NextResponse.json(
      {
        error: `Your ${userContext.plan} plan supports up to ${userContext.capabilities.maxSongLengthSeconds} seconds per song.`,
      },
      { status: 403 },
    );
  }

  const debit = reserveGenerationCredits(userId, userContext.generationCost);
  if (!debit.ok) {
    return NextResponse.json(
      { error: debit.message, creditBalance: userContext.creditBalance, packs: getCreditPacks() },
      { status: 402 },
    );
  }

  const generation = await generateWithFailover(body);
  const stemsPayload = buildStemsPayload(userContext.capabilities.stemsExport, generation.stemsUrls);
  const songDraft = createGeneratedDraft({
    prompt: body.prompt,
    lyrics: body.lyrics,
    genre: body.genre,
    mood: body.mood,
    language: body.language,
    bpm: body.bpm,
    vocalStyle: body.vocalStyle,
    instrumentalOnly: body.instrumentalOnly,
    originalSongId: body.originalSongId,
    audioUrl: generation.audioUrl,
    wavUrl: generation.wavUrl,
    stemsUrls: stemsPayload,
    coverUrl: generation.coverUrl,
    videoUrl: generation.videoUrl,
    masteredAudioUrl: generation.masteredAudioUrl,
    generationStatus: generation.status,
  });
  const providerHealth = await getProviderHealth();
  const costLedgerEntry = recordGenerationCost({
    userId,
    provider: generation.provider,
    amountUsd: generation.estimatedCostUsd ?? 0,
    promptPreview: body.prompt.slice(0, 80),
  });

  return NextResponse.json({
    success: true,
    audioUrl: generation.audioUrl,
    wavUrl: generation.wavUrl,
    stemsUrls: stemsPayload ?? null,
    masteredAudioUrl: generation.masteredAudioUrl,
    provider: generation.provider,
    providerHealth,
    estimatedCostUsd: generation.estimatedCostUsd ?? 0,
    generationCostEntryId: costLedgerEntry.id,
    failoverAttempts: generation.failoverAttempts ?? 0,
    generationStatus: generation.status,
    plan: userContext.plan,
    creditBalance: debit.balance,
    capabilities: userContext.capabilities,
    songDraft,
    message: generation.message,
  });
}
