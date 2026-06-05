import { NextResponse } from 'next/server';
import { submitVerificationRequest } from '@/lib/platform/platformStore';

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.userId || !body.legalName || !body.stageName || !body.reason) {
    return NextResponse.json({ error: 'userId, legalName, stageName, and reason are required' }, { status: 400 });
  }

  const verificationRequest = submitVerificationRequest({
    userId: body.userId,
    legalName: body.legalName,
    stageName: body.stageName,
    idUploadPlaceholder: body.idUploadPlaceholder ?? 'pending-upload',
    links: Array.isArray(body.links) ? body.links : [],
    reason: body.reason,
  });
  return NextResponse.json({ success: true, verificationRequest });
}
