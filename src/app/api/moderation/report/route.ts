import { NextResponse } from 'next/server';
import { reportSong } from '@/lib/platform/platformStore';
import { enforceRateLimit } from '@/lib/moderation/rateLimitMiddleware';
import { createUserReport, REPORT_TARGET_TYPES, runModerationPipeline } from '@/lib/moderation/moderationService';

export async function POST(request: Request) {
  const body = await request.json();
  const rateLimit = await enforceRateLimit(request, 'moderationReport');
  if (rateLimit.response) return rateLimit.response;
  const userId = `anon:${rateLimit.identifier}`;

  let targetId = '';
  if (typeof body.targetId === 'string') {
    targetId = body.targetId;
  } else if (typeof body.songId === 'string') {
    targetId = body.songId;
  }
  if (!targetId || !body.reason) {
    return NextResponse.json({ error: 'targetId/songId and reason are required' }, { status: 400 });
  }

  if (body.targetType && !REPORT_TARGET_TYPES.includes(body.targetType)) {
    return NextResponse.json({ error: `Invalid targetType. Use one of: ${REPORT_TARGET_TYPES.join(', ')}` }, { status: 400 });
  }
  const targetType = REPORT_TARGET_TYPES.includes(body.targetType) ? body.targetType : 'song';
  const report = createUserReport({
    targetId,
    targetType,
    reporterId: userId,
    reason: String(body.reason),
    description: typeof body.description === 'string' ? body.description : undefined,
  });

  if (targetType === 'song') {
    reportSong(targetId, String(body.reason));
  }

  const moderation = runModerationPipeline(
    {
      identifier: rateLimit.identifier,
      userId,
      targetId,
      text: [body.reason, body.description].filter(Boolean).join(' '),
      requestPath: '/api/moderation/report',
      userAgent: request.headers.get('user-agent') ?? undefined,
    },
    ['spam', 'botPattern', 'explicitContentPlaceholder']
  );

  return NextResponse.json({
    success: true,
    report,
    moderationStatus: moderation.createdFlags.length > 0 ? 'FLAGGED' : 'PENDING',
    detections: moderation.results,
    moderationQueueCount: moderation.createdFlags.length,
  });
}
