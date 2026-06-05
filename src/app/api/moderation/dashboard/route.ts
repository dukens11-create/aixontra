import { NextResponse } from 'next/server';
import {
  getFlaggedContent,
  getModerationAuditTrail,
  getModerationQueue,
  getUserReports,
  getWarnings,
} from '@/lib/moderation/moderationService';

export async function GET() {
  return NextResponse.json({
    moderationQueue: getModerationQueue(),
    userReports: getUserReports(),
    flaggedContent: getFlaggedContent(),
    warnings: getWarnings(),
    auditTrail: getModerationAuditTrail(),
  });
}
