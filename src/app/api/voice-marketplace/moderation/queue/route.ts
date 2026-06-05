import { NextResponse } from 'next/server';
import { getVoiceApprovalQueue } from '@/lib/platform/voiceMarketplace';

export async function GET() {
  return NextResponse.json({
    queue: getVoiceApprovalQueue(),
    impersonationDetection: {
      status: 'PLACEHOLDER_ONLY',
      todo: 'Connect model-based impersonation classifier and confidence score.',
    },
  });
}
