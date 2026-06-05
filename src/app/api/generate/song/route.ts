import { NextResponse } from 'next/server';
import { createGeneratedDraft, getCreditPacks, getUserGenerationContext, reserveGenerationCredits } from '@/lib/platform/platformStore';
import { getMusicProvider } from '@/lib/platform/generationProvider';

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.prompt?.trim()) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  const userId = typeof body.userId === 'string' && body.userId.trim() ? body.userId : 'demo-user';
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

  const provider = getMusicProvider();
  const generation = await provider.generate(body);
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
    stemsUrls: userContext.capabilities.stemsExport ? generation.stemsUrls : undefined,
    coverUrl: generation.coverUrl,
    videoUrl: generation.videoUrl,
    masteredAudioUrl: generation.masteredAudioUrl,
    generationStatus: generation.status,
  });

  return NextResponse.json({
    success: true,
    audioUrl: generation.audioUrl,
    wavUrl: generation.wavUrl,
    stemsUrls: userContext.capabilities.stemsExport ? generation.stemsUrls : null,
    masteredAudioUrl: generation.masteredAudioUrl,
    provider: generation.provider,
    generationStatus: generation.status,
    plan: userContext.plan,
    creditBalance: debit.balance,
    capabilities: userContext.capabilities,
    songDraft,
    message: generation.message,
  });
}
