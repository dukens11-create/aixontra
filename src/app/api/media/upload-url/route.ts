import { NextResponse } from 'next/server';
import { createSecureUploadUrl } from '@/lib/platform/storageService';
import { enforceRateLimit } from '@/lib/moderation/rateLimitMiddleware';
import { runModerationPipeline } from '@/lib/moderation/moderationService';

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.userId || !body.kind) {
    return NextResponse.json({ error: 'userId and kind are required' }, { status: 400 });
  }
  const rateLimit = await enforceRateLimit(request, 'upload', body.userId);
  if (rateLimit.response) return rateLimit.response;
  const upload = createSecureUploadUrl({ userId: body.userId, kind: body.kind, songId: body.songId });

  const moderation = runModerationPipeline(
    {
      identifier: rateLimit.identifier,
      userId: body.userId,
      targetId: upload.path,
      contentHash: typeof body.contentHash === 'string' ? body.contentHash : undefined,
      requestPath: '/api/media/upload-url',
      userAgent: request.headers.get('user-agent') ?? undefined,
      metadata: { kind: body.kind, songId: body.songId ?? null },
    },
    ['duplicateUpload', 'botPattern']
  );

  const duplicateFlag = moderation.createdFlags.find((flag) => flag.type === 'DUPLICATE_UPLOAD');
  if (duplicateFlag) {
    return NextResponse.json(
      { error: 'Duplicate upload fingerprint detected', moderation: moderation.results, flag: duplicateFlag },
      { status: 409 }
    );
  }

  return NextResponse.json({ success: true, upload, moderation: moderation.results });
}
