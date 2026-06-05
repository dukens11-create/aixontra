import { NextResponse } from 'next/server';
import {
  getFlaggedContent,
  getModerationAuditTrail,
  getModerationQueue,
  getUserReports,
  getWarnings,
} from '@/lib/moderation/moderationService';
import { ensureAdminRequest } from '@/lib/moderation/adminAuth';

export async function GET(request: Request) {
  const authError = ensureAdminRequest(request);
  if (authError) return authError;
  return NextResponse.json({
    moderationQueue: getModerationQueue(),
    userReports: getUserReports(),
    flaggedContent: getFlaggedContent(),
    warnings: getWarnings(),
    auditTrail: getModerationAuditTrail(),
  });
}
