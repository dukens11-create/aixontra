import { NextResponse } from 'next/server';
import { submitVoiceModel } from '@/lib/platform/platformStore';

export async function POST(request: Request) {
  const body = await request.json();
  const model = submitVoiceModel({
    userId: body.userId ?? 'demo-user',
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
    message: 'Voice model submitted for admin review. Public use is blocked until approval.',
  });
}
