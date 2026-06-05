import { NextResponse } from 'next/server';
import { reviewVoiceModel } from '@/lib/platform/voiceMarketplace';

export async function POST(request: Request, context: { params: Promise<{ voiceId: string }> }) {
  const { voiceId } = await context.params;
  const body = await request.json();
  const action = body.action === 'reject' ? 'reject' : 'approve';
  const updated = reviewVoiceModel(voiceId, action);

  if (!updated) {
    return NextResponse.json({ error: 'Voice model not found.' }, { status: 404 });
  }

  return NextResponse.json({ success: true, model: updated });
}
