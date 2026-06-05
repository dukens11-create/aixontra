import { describe, expect, it } from 'vitest';
import {
  createReferralCode,
  createSubscription,
  createTip,
  getMonetizationDashboard,
  trackReferralReward,
} from './monetization';

describe('monetization', () => {
  it('calculates tip fee and net payout', () => {
    const tip = createTip({ creatorId: 'creator-tip-test', supporterId: 'fan-1', amount: 10 });
    expect(tip.platformFee).toBe(0.8);
    expect(tip.netAmount).toBe(9.2);
  });

  it('creates recurring subscriptions with fee calculation', () => {
    const result = createSubscription({ creatorId: 'creator-sub-test', subscriberId: 'fan-2', tierId: 'tier-supporter' });
    expect(result).not.toBeNull();
    expect(result?.subscription.netAmount).toBeLessThan(result?.subscription.grossAmount ?? 0);
    expect(result?.subscription.recurringStatus).toBe('ACTIVE');
  });

  it('tracks referral rewards and exposes them in dashboard stats', () => {
    const creatorId = 'creator-ref-test';
    const code = createReferralCode(creatorId);
    const reward = trackReferralReward({
      creatorId,
      referralCode: code,
      referredUserId: 'fan-3',
      conversionAmount: 50,
    });
    expect(reward).not.toBeNull();
    expect(reward?.rewardAmount).toBe(5);
    const dashboard = getMonetizationDashboard(creatorId);
    expect(dashboard.referralStats.totalReferrals).toBeGreaterThan(0);
    expect(dashboard.payoutAnalytics.revenueBySource.REFERRAL_REWARD).toBeGreaterThan(0);
  });
});
