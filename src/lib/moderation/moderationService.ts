type ModerationSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type ModerationFlagType =
  | 'SPAM'
  | 'FAKE_PLAY'
  | 'BOT_PATTERN'
  | 'DUPLICATE_UPLOAD'
  | 'VOICE_IMPERSONATION_PLACEHOLDER'
  | 'EXPLICIT_CONTENT_PLACEHOLDER';

type ModerationFlagStatus = 'PENDING' | 'REVIEWED' | 'DISMISSED';
type WarningAction = 'WARNING' | 'TEMP_BAN' | 'PERMANENT_BAN';
type ReportCategory = 'SPAM' | 'ABUSE' | 'COPYRIGHT' | 'IMPERSONATION' | 'EXPLICIT' | 'OTHER';

type ModerationContext = {
  identifier: string;
  userId?: string;
  targetId?: string;
  text?: string;
  contentHash?: string;
  requestPath?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
};

type DetectionResult = {
  type: ModerationFlagType;
  flagged: boolean;
  severity: ModerationSeverity;
  confidence: number;
  reason: string;
  details?: Record<string, unknown>;
};

type ModerationFlag = {
  id: string;
  type: ModerationFlagType;
  status: ModerationFlagStatus;
  severity: ModerationSeverity;
  confidence: number;
  reason: string;
  userId?: string;
  targetId?: string;
  details?: Record<string, unknown>;
  createdAt: string;
  reviewedAt?: string;
};

type UserReport = {
  id: string;
  targetId: string;
  targetType: 'song' | 'comment' | 'voice_model' | 'user';
  reporterId: string;
  reason: string;
  description?: string;
  category: ReportCategory;
  status: 'PENDING' | 'REVIEWED';
  createdAt: string;
};

type WarningRecord = {
  id: string;
  userId: string;
  reason: string;
  action: WarningAction;
  strikeCount: number;
  createdAt: string;
};

type ModerationActionLog = {
  id: string;
  action:
    | 'FLAG_CREATED'
    | 'FLAG_REVIEWED'
    | 'REPORT_CREATED'
    | 'WARNING_ISSUED'
    | 'TEMP_BAN_ISSUED'
    | 'PERMANENT_BAN_ISSUED';
  targetId?: string;
  actorId: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

const flags: ModerationFlag[] = [];
const reports: UserReport[] = [];
const warnings: WarningRecord[] = [];
const auditLog: ModerationActionLog[] = [];
const strikeCountByUser = new Map<string, number>();
const lastWarningAtByUser = new Map<string, number>();
const playEventsByKey = new Map<string, number[]>();
const requestsByIdentifier = new Map<string, number[]>();
const knownContentHashes = new Map<string, string>();
const recentUserText = new Map<string, string>();
const SPAM_KEYWORDS = ['free money', 'click here', 'buy followers', 'promo code'];
const MAX_PLAYS_PER_MINUTE = 20;
const CRITICAL_PLAYS_PER_MINUTE = 40;
const MAX_REQUESTS_PER_MINUTE = 60;

const nowIso = () => new Date().toISOString();

const createFlag = (result: DetectionResult, context: ModerationContext) => {
  if (!result.flagged) return null;
  const flag: ModerationFlag = {
    id: `flag-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: result.type,
    status: 'PENDING',
    severity: result.severity,
    confidence: result.confidence,
    reason: result.reason,
    userId: context.userId,
    targetId: context.targetId,
    details: result.details,
    createdAt: nowIso(),
  };
  flags.unshift(flag);
  logModerationAction({
    action: 'FLAG_CREATED',
    actorId: context.userId ?? 'system',
    targetId: flag.id,
    metadata: { type: flag.type, severity: flag.severity, reason: flag.reason },
  });
  return flag;
};

const logModerationAction = (entry: Omit<ModerationActionLog, 'id' | 'createdAt'>) => {
  const log: ModerationActionLog = {
    ...entry,
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: nowIso(),
  };
  auditLog.unshift(log);
  return log;
};

const detectSpam = (context: ModerationContext): DetectionResult => {
  const text = (context.text ?? '').trim().toLowerCase();
  if (!text) {
    return { type: 'SPAM', flagged: false, severity: 'LOW', confidence: 0, reason: 'No text to analyze' };
  }

  const repeatedChars = /(.)\1{6,}/.test(text);
  const repeatedWords = /\b(\w+)\b(?:\s+\1\b){2,}/.test(text);
  const keywordHit = SPAM_KEYWORDS.some((word) => text.includes(word));
  const previous = context.userId ? recentUserText.get(context.userId) : undefined;
  if (context.userId) recentUserText.set(context.userId, text);
  const duplicateMessage = Boolean(previous && previous === text);

  const flagged = repeatedChars || repeatedWords || keywordHit || duplicateMessage;
  return {
    type: 'SPAM',
    flagged,
    severity: keywordHit ? 'HIGH' : duplicateMessage ? 'MEDIUM' : 'LOW',
    confidence: flagged ? 0.8 : 0.2,
    reason: flagged ? 'Spam-like text pattern detected' : 'No spam signals detected',
    details: { repeatedChars, repeatedWords, keywordHit, duplicateMessage },
  };
};

const detectFakePlay = (context: ModerationContext): DetectionResult => {
  if (!context.targetId) {
    return { type: 'FAKE_PLAY', flagged: false, severity: 'LOW', confidence: 0, reason: 'No target to analyze' };
  }
  const key = `${context.identifier}:${context.targetId}`;
  const currentTs = Date.now();
  const oneMinuteAgo = currentTs - 60_000;
  const events = (playEventsByKey.get(key) ?? []).filter((ts) => ts >= oneMinuteAgo);
  events.push(currentTs);
  playEventsByKey.set(key, events);

  const flagged = events.length > MAX_PLAYS_PER_MINUTE;
  return {
    type: 'FAKE_PLAY',
    flagged,
    severity: events.length > CRITICAL_PLAYS_PER_MINUTE ? 'CRITICAL' : 'HIGH',
    confidence: flagged ? 0.9 : 0.25,
    reason: flagged ? 'Unnatural repeated plays detected for this track' : 'Play pattern appears normal',
    details: { playsInLastMinute: events.length },
  };
};

const detectBotPattern = (context: ModerationContext): DetectionResult => {
  const key = context.identifier;
  const now = Date.now();
  const oneMinuteAgo = now - 60_000;
  const events = (requestsByIdentifier.get(key) ?? []).filter((ts) => ts >= oneMinuteAgo);
  events.push(now);
  requestsByIdentifier.set(key, events);

  const agent = (context.userAgent ?? '').toLowerCase();
  const suspiciousAgent = !agent || /(bot|crawler|spider|curl|python-requests)/.test(agent);
  const burstTraffic = events.length > MAX_REQUESTS_PER_MINUTE;
  const flagged = suspiciousAgent || burstTraffic;

  return {
    type: 'BOT_PATTERN',
    flagged,
    severity: burstTraffic ? 'CRITICAL' : 'HIGH',
    confidence: flagged ? 0.85 : 0.2,
    reason: flagged ? 'Suspicious request behavior suggests automation' : 'No bot behavior detected',
    details: { suspiciousAgent, burstTraffic, requestsInLastMinute: events.length },
  };
};

const detectDuplicateUpload = (context: ModerationContext): DetectionResult => {
  const hash = context.contentHash?.trim();
  if (!hash) {
    return {
      type: 'DUPLICATE_UPLOAD',
      flagged: false,
      severity: 'LOW',
      confidence: 0,
      reason: 'No content hash provided for duplicate detection',
    };
  }

  const existingTargetId = knownContentHashes.get(hash);
  const isDuplicate = Boolean(existingTargetId && existingTargetId !== context.targetId);
  if (!existingTargetId && context.targetId) knownContentHashes.set(hash, context.targetId);

  return {
    type: 'DUPLICATE_UPLOAD',
    flagged: isDuplicate,
    severity: 'MEDIUM',
    confidence: isDuplicate ? 0.95 : 0.25,
    reason: isDuplicate ? 'Upload fingerprint matches existing content' : 'No duplicate upload detected',
    details: { existingTargetId: existingTargetId ?? null },
  };
};

const detectVoiceImpersonationPlaceholder = (_context: ModerationContext): DetectionResult => ({
  type: 'VOICE_IMPERSONATION_PLACEHOLDER',
  flagged: false,
  severity: 'LOW',
  confidence: 0.1,
  reason: 'Voice impersonation ML detector placeholder (integration TODO)',
});

const detectExplicitContentPlaceholder = (_context: ModerationContext): DetectionResult => ({
  type: 'EXPLICIT_CONTENT_PLACEHOLDER',
  flagged: false,
  severity: 'LOW',
  confidence: 0.1,
  reason: 'Explicit content moderation placeholder (integration TODO)',
});

const categorizeReport = (reason: string): ReportCategory => {
  const text = reason.toLowerCase();
  if (text.includes('spam')) return 'SPAM';
  if (text.includes('copyright') || text.includes('dmca')) return 'COPYRIGHT';
  if (text.includes('impersonation') || text.includes('identity')) return 'IMPERSONATION';
  if (text.includes('explicit') || text.includes('nsfw')) return 'EXPLICIT';
  if (text.includes('abuse') || text.includes('harass') || text.includes('hate')) return 'ABUSE';
  return 'OTHER';
};

export const runModerationPipeline = (
  context: ModerationContext,
  detectors: Array<
    | 'spam'
    | 'fakePlay'
    | 'botPattern'
    | 'duplicateUpload'
    | 'voiceImpersonationPlaceholder'
    | 'explicitContentPlaceholder'
  >
) => {
  const detectorMap = {
    spam: detectSpam,
    fakePlay: detectFakePlay,
    botPattern: detectBotPattern,
    duplicateUpload: detectDuplicateUpload,
    voiceImpersonationPlaceholder: detectVoiceImpersonationPlaceholder,
    explicitContentPlaceholder: detectExplicitContentPlaceholder,
  } as const;

  const results = detectors.map((name) => detectorMap[name](context));
  const createdFlags = results
    .map((result) => createFlag(result, context))
    .filter((item): item is ModerationFlag => Boolean(item));

  return { results, createdFlags };
};

export const createUserReport = (input: {
  targetId: string;
  targetType: UserReport['targetType'];
  reporterId: string;
  reason: string;
  description?: string;
}) => {
  const report: UserReport = {
    id: `report-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    targetId: input.targetId,
    targetType: input.targetType,
    reporterId: input.reporterId,
    reason: input.reason,
    description: input.description,
    category: categorizeReport(input.reason),
    status: 'PENDING',
    createdAt: nowIso(),
  };
  reports.unshift(report);
  logModerationAction({
    action: 'REPORT_CREATED',
    actorId: input.reporterId,
    targetId: report.id,
    metadata: { targetId: input.targetId, targetType: input.targetType, category: report.category },
  });
  return report;
};

const actionForStrike = (strikeCount: number): WarningAction =>
  strikeCount >= 3 ? 'PERMANENT_BAN' : strikeCount >= 2 ? 'TEMP_BAN' : 'WARNING';

const actionLogTypeForWarning = (action: WarningAction): ModerationActionLog['action'] => {
  if (action === 'WARNING') return 'WARNING_ISSUED';
  if (action === 'TEMP_BAN') return 'TEMP_BAN_ISSUED';
  return 'PERMANENT_BAN_ISSUED';
};

export const issueAutomatedWarning = (input: { userId: string; reason: string; cooldownMs?: number }) => {
  const now = Date.now();
  const cooldownMs = input.cooldownMs ?? 0;
  const lastWarningAt = lastWarningAtByUser.get(input.userId) ?? 0;
  if (cooldownMs > 0 && now - lastWarningAt < cooldownMs) {
    return null;
  }

  const nextStrike = (strikeCountByUser.get(input.userId) ?? 0) + 1;
  strikeCountByUser.set(input.userId, nextStrike);
  lastWarningAtByUser.set(input.userId, now);

  const action = actionForStrike(nextStrike);
  const warning: WarningRecord = {
    id: `warning-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId: input.userId,
    reason: input.reason,
    action,
    strikeCount: nextStrike,
    createdAt: nowIso(),
  };
  warnings.unshift(warning);
  logModerationAction({
    action: actionLogTypeForWarning(action),
    actorId: 'system',
    targetId: input.userId,
    metadata: { warningId: warning.id, reason: input.reason, strikeCount: nextStrike },
  });
  return warning;
};

export const reviewModerationFlag = (input: {
  flagId: string;
  reviewerId: string;
  resolution: 'REVIEWED' | 'DISMISSED';
  note?: string;
}) => {
  const flag = flags.find((item) => item.id === input.flagId);
  if (!flag) return null;
  flag.status = input.resolution;
  flag.reviewedAt = nowIso();
  logModerationAction({
    action: 'FLAG_REVIEWED',
    actorId: input.reviewerId,
    targetId: input.flagId,
    metadata: { resolution: input.resolution, note: input.note ?? null },
  });
  return flag;
};

export const getModerationQueue = () => flags.filter((flag) => flag.status === 'PENDING');
export const getFlaggedContent = () => flags;
export const getUserReports = () => reports;
export const getWarnings = () => warnings;
export const getModerationAuditTrail = () => auditLog;

export const __resetModerationStateForTests = () => {
  flags.length = 0;
  reports.length = 0;
  warnings.length = 0;
  auditLog.length = 0;
  strikeCountByUser.clear();
  lastWarningAtByUser.clear();
  playEventsByKey.clear();
  requestsByIdentifier.clear();
  knownContentHashes.clear();
  recentUserText.clear();
};
