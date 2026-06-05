import { NextResponse } from 'next/server';
import { submitVoiceModel } from '@/lib/platform/platformStore';
import { enforceRateLimit } from '@/lib/moderation/rateLimitMiddleware';
import { runModerationPipeline } from '@/lib/moderation/moderationService';

export async function POST(request: Request) {
  const body = await request.json();
  const userId = body.userId ?? 'demo-user';
  const rateLimit = await enforceRateLimit(request, 'voiceModelSubmit', userId);
  if (rateLimit.response) return rateLimit.response;

  const moderation = runModerationPipeline(
    {
      identifier: rateLimit.identifier,
      userId,
      targetId: typeof body.name === 'string' ? body.name : 'voice-model',
      text: [body.name, body.description].filter(Boolean).join(' '),
      requestPath: '/api/voice-models/submit',
      userAgent: request.headers.get('user-agent') ?? undefined,
    },
    ['botPattern', 'voiceImpersonationPlaceholder', 'explicitContentPlaceholder', 'spam']
  );

  const model = submitVoiceModel({
    userId,
    name: body.name ?? 'Untitled Voice Model',
    consentConfirmed: Boolean(body.consentConfirmed),
    proofUrl: typeof body.proofUrl === 'string' ? body.proofUrl : '',
  });

  if (!model) {
    return NextResponse.json({ error: 'Consent confirmation and proof URL are required before submission.' }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    model,
    moderation: moderation.results,
    message: 'Voice model submitted for admin review. Public use is blocked until approval.',
  });
}
