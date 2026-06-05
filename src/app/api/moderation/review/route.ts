import { NextResponse } from 'next/server';
import { issueAutomatedWarning, reviewModerationFlag } from '@/lib/moderation/moderationService';

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.flagId || !body.reviewerId || !body.resolution) {
    return NextResponse.json({ error: 'flagId, reviewerId, and resolution are required' }, { status: 400 });
  }

  const reviewed = reviewModerationFlag({
    flagId: body.flagId,
    reviewerId: body.reviewerId,
    resolution: body.resolution === 'DISMISSED' ? 'DISMISSED' : 'REVIEWED',
    note: typeof body.note === 'string' ? body.note : undefined,
  });
  if (!reviewed) {
    return NextResponse.json({ error: 'Flag not found' }, { status: 404 });
  }

  let warning = null;
  if (reviewed.status === 'REVIEWED' && reviewed.userId) {
    warning = issueAutomatedWarning({
      userId: reviewed.userId,
      reason: reviewed.reason,
    });
  }

  return NextResponse.json({ success: true, reviewed, warning });
}
