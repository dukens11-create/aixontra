import { NextResponse } from 'next/server';
import { createGeneratedDraft } from '@/lib/platform/platformStore';
import { getMusicProvider } from '@/lib/platform/generationProvider';

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.prompt?.trim()) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
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
  });

  return NextResponse.json({
    success: true,
    audioUrl: generation.audioUrl,
    provider: generation.provider,
    songDraft,
    message: generation.message,
  });
}
