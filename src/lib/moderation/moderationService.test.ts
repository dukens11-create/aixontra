import { beforeEach, describe, expect, it } from 'vitest';
import {
  __resetModerationStateForTests,
  createUserReport,
  getModerationAuditTrail,
  getModerationQueue,
  getUserReports,
  getWarnings,
  issueAutomatedWarning,
  runModerationPipeline,
} from './moderationService';

describe('moderationService', () => {
  beforeEach(() => {
    __resetModerationStateForTests();
  });

  it('creates duplicate-upload flag when fingerprint repeats', () => {
    runModerationPipeline(
      { identifier: 'ip-1', userId: 'u1', targetId: 'upload-1', contentHash: 'abc' },
      ['duplicateUpload']
    );
    const second = runModerationPipeline(
      { identifier: 'ip-2', userId: 'u2', targetId: 'upload-2', contentHash: 'abc' },
      ['duplicateUpload']
    );

    expect(second.createdFlags.length).toBe(1);
    expect(second.createdFlags[0].type).toBe('DUPLICATE_UPLOAD');
  });

  it('escalates warnings from warning to temp ban to permanent ban', () => {
    const first = issueAutomatedWarning({ userId: 'u1', reason: 'spam' });
    const second = issueAutomatedWarning({ userId: 'u1', reason: 'spam again' });
    const third = issueAutomatedWarning({ userId: 'u1', reason: 'spam repeatedly' });

    expect(first.action).toBe('WARNING');
    expect(second.action).toBe('TEMP_BAN');
    expect(third.action).toBe('PERMANENT_BAN');
    expect(getWarnings()).toHaveLength(3);
  });

  it('respects warning cooldown to avoid rapid escalation', () => {
    const first = issueAutomatedWarning({ userId: 'u1', reason: 'burst', cooldownMs: 60_000 });
    const second = issueAutomatedWarning({ userId: 'u1', reason: 'burst', cooldownMs: 60_000 });

    expect(first?.action).toBe('WARNING');
    expect(second).toBeNull();
    expect(getWarnings()).toHaveLength(1);
  });

  it('auto-categorizes user reports and records audit logs', () => {
    const report = createUserReport({
      targetId: 'song-123',
      targetType: 'song',
      reporterId: 'user-1',
      reason: 'Copyright infringement',
    });

    expect(report.category).toBe('COPYRIGHT');
    expect(getUserReports()).toHaveLength(1);
    expect(getModerationAuditTrail()[0].action).toBe('REPORT_CREATED');
  });

  it('flags spam-like report text into moderation queue', () => {
    runModerationPipeline(
      {
        identifier: 'ip-1',
        userId: 'reporter-1',
        targetId: 'song-1',
        text: 'buy followers buy followers click here',
      },
      ['spam']
    );

    expect(getModerationQueue()).toHaveLength(1);
    expect(getModerationQueue()[0].type).toBe('SPAM');
  });
});
