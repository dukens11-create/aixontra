type RevenueSource = 'TIP' | 'SUBSCRIPTION' | 'REFERRAL_REWARD' | 'AD_REVENUE_PLACEHOLDER';
type PayoutStatus = 'PENDING' | 'SCHEDULED' | 'IN_TRANSIT' | 'PAID' | 'FAILED';
type StripeConnectStatus = 'NOT_LINKED' | 'PENDING_VERIFICATION' | 'VERIFIED';

type RevenueEvent = {
  id: string;
  creatorId: string;
  source: RevenueSource;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  attribution: string;
  createdAt: string;
};

type PayoutRecord = {
  id: string;
  creatorId: string;
  amount: number;
  currency: 'USD';
  status: PayoutStatus;
  scheduledFor: string;
  processedAt?: string;
  destinationLabel: string;
};

type ReferralReward = {
  id: string;
  creatorId: string;
  referralCode: string;
  referredUserId: string;
  conversionAmount: number;
  rewardAmount: number;
  status: 'PENDING' | 'PAID';
  createdAt: string;
};

type SubscriptionTier = {
  id: string;
  name: string;
  amountUsd: number;
  billingPeriod: 'MONTHLY' | 'YEARLY';
  perks: string[];
};

type SubscriptionRecord = {
  id: string;
  creatorId: string;
  subscriberId: string;
  tierId: string;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  recurringStatus: 'ACTIVE' | 'CANCELLED';
  nextBillingDate: string;
  createdAt: string;
};

type TipRecord = {
  id: string;
  creatorId: string;
  supporterId: string;
  amount: number;
  platformFee: number;
  netAmount: number;
  message?: string;
  createdAt: string;
};

type CreatorMonetizationState = {
  creatorId: string;
  stripeConnectStatus: StripeConnectStatus;
  stripeAccountId?: string;
  linkedEmail?: string;
  bankAccounts: Array<{ id: string; bankName: string; last4: string; status: 'PENDING' | 'VERIFIED' }>;
  referralCodes: string[];
  referralRewards: ReferralReward[];
  tips: TipRecord[];
  subscriptions: SubscriptionRecord[];
  payouts: PayoutRecord[];
  revenueEvents: RevenueEvent[];
};

const TIP_FEE_RATE = 0.08;
const SUBSCRIPTION_FEE_RATE = 0.12;
const REFERRAL_REWARD_RATE = 0.1;

const subscriptionTiers: SubscriptionTier[] = [
  { id: 'tier-supporter', name: 'Supporter', amountUsd: 4.99, billingPeriod: 'MONTHLY', perks: ['Support badge', 'Monthly drops'] },
  { id: 'tier-superfan', name: 'Superfan', amountUsd: 14.99, billingPeriod: 'MONTHLY', perks: ['Exclusive previews', 'Behind-the-scenes access'] },
  { id: 'tier-annual', name: 'Annual VIP', amountUsd: 99.99, billingPeriod: 'YEARLY', perks: ['Yearly savings', 'Priority requests'] },
];

const creatorStates = new Map<string, CreatorMonetizationState>();

const roundToCents = (amount: number) => Number(amount.toFixed(2));

const appendRevenueEvent = (state: CreatorMonetizationState, event: Omit<RevenueEvent, 'id' | 'createdAt'>) => {
  const record: RevenueEvent = {
    id: `revenue-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: new Date().toISOString(),
    ...event,
  };
  state.revenueEvents.unshift(record);
  return record;
};

const seedDemoRevenue = (state: CreatorMonetizationState) => {
  if (state.revenueEvents.length > 0) return;
  const now = new Date();
  const months = [0, 1, 2, 3, 4, 5];
  months.forEach((monthOffset) => {
    const baseDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 10).toISOString();
    const tipNet = roundToCents(80 + monthOffset * 7);
    const subNet = roundToCents(220 + monthOffset * 18);
    const adNet = roundToCents(35 + monthOffset * 3);
    state.revenueEvents.unshift(
      {
        id: `seed-tip-${monthOffset}`,
        creatorId: state.creatorId,
        source: 'TIP',
        grossAmount: roundToCents(tipNet / (1 - TIP_FEE_RATE)),
        platformFee: roundToCents((tipNet / (1 - TIP_FEE_RATE)) * TIP_FEE_RATE),
        netAmount: tipNet,
        attribution: 'stream_tip',
        createdAt: baseDate,
      },
      {
        id: `seed-sub-${monthOffset}`,
        creatorId: state.creatorId,
        source: 'SUBSCRIPTION',
        grossAmount: roundToCents(subNet / (1 - SUBSCRIPTION_FEE_RATE)),
        platformFee: roundToCents((subNet / (1 - SUBSCRIPTION_FEE_RATE)) * SUBSCRIPTION_FEE_RATE),
        netAmount: subNet,
        attribution: 'creator_membership',
        createdAt: baseDate,
      },
      {
        id: `seed-ad-${monthOffset}`,
        creatorId: state.creatorId,
        source: 'AD_REVENUE_PLACEHOLDER',
        grossAmount: adNet,
        platformFee: 0,
        netAmount: adNet,
        attribution: 'ad_network_placeholder',
        createdAt: baseDate,
      },
    );
  });
  state.referralCodes.push('NEONKREYOL10');
  state.referralRewards.push({
    id: 'reward-seed-1',
    creatorId: state.creatorId,
    referralCode: 'NEONKREYOL10',
    referredUserId: 'fan-204',
    conversionAmount: 39.99,
    rewardAmount: 4,
    status: 'PAID',
    createdAt: new Date(now.getFullYear(), now.getMonth() - 1, 14).toISOString(),
  });
  state.referralRewards.push({
    id: 'reward-seed-2',
    creatorId: state.creatorId,
    referralCode: 'NEONKREYOL10',
    referredUserId: 'fan-391',
    conversionAmount: 19.99,
    rewardAmount: 2,
    status: 'PENDING',
    createdAt: new Date(now.getFullYear(), now.getMonth(), 2).toISOString(),
  });
  state.payouts.push({
    id: 'payout-seed-paid',
    creatorId: state.creatorId,
    amount: 420.12,
    currency: 'USD',
    status: 'PAID',
    scheduledFor: new Date(now.getFullYear(), now.getMonth() - 1, 20).toISOString(),
    processedAt: new Date(now.getFullYear(), now.getMonth() - 1, 21).toISOString(),
    destinationLabel: 'First Federal •••• 4242',
  });
  state.payouts.push({
    id: 'payout-seed-pending',
    creatorId: state.creatorId,
    amount: 183.4,
    currency: 'USD',
    status: 'SCHEDULED',
    scheduledFor: new Date(now.getFullYear(), now.getMonth(), 28).toISOString(),
    destinationLabel: 'First Federal •••• 4242',
  });
};

const ensureCreatorState = (creatorId: string): CreatorMonetizationState => {
  const existing = creatorStates.get(creatorId);
  if (existing) return existing;
  const created: CreatorMonetizationState = {
    creatorId,
    stripeConnectStatus: 'NOT_LINKED',
    bankAccounts: [],
    referralCodes: [],
    referralRewards: [],
    tips: [],
    subscriptions: [],
    payouts: [],
    revenueEvents: [],
  };
  if (creatorId === 'demo-user') {
    created.stripeConnectStatus = 'PENDING_VERIFICATION';
    created.stripeAccountId = 'acct_demo_placeholder';
    created.linkedEmail = 'creator@aixontra.com';
    created.bankAccounts.push({ id: 'bank-demo-1', bankName: 'First Federal', last4: '4242', status: 'VERIFIED' });
    seedDemoRevenue(created);
  }
  creatorStates.set(creatorId, created);
  return created;
};

const getLast6MonthKey = () => {
  const keys: string[] = [];
  const now = new Date();
  for (let index = 5; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    keys.push(date.toISOString().slice(0, 7));
  }
  return keys;
};

export const getSubscriptionTiers = () => subscriptionTiers;

export const linkStripeConnectAccount = (creatorId: string, email: string) => {
  const state = ensureCreatorState(creatorId);
  state.linkedEmail = email;
  state.stripeConnectStatus = 'PENDING_VERIFICATION';
  state.stripeAccountId = state.stripeAccountId ?? `acct_placeholder_${Date.now()}`;
  return {
    stripeConnectStatus: state.stripeConnectStatus,
    stripeAccountId: state.stripeAccountId,
    onboardingUrl: `https://connect.stripe.com/express/onboarding/${state.stripeAccountId}`,
  };
};

export const verifyStripeConnectAccount = (creatorId: string) => {
  const state = ensureCreatorState(creatorId);
  if (!state.stripeAccountId) return null;
  state.stripeConnectStatus = 'VERIFIED';
  return {
    stripeConnectStatus: state.stripeConnectStatus,
    stripeAccountId: state.stripeAccountId,
  };
};

export const addBankAccount = (creatorId: string, bankName: string, last4: string) => {
  const state = ensureCreatorState(creatorId);
  const account = {
    id: `bank-${Date.now()}`,
    bankName,
    last4,
    status: state.stripeConnectStatus === 'VERIFIED' ? 'VERIFIED' as const : 'PENDING' as const,
  };
  state.bankAccounts.unshift(account);
  return account;
};

export const createTip = (input: { creatorId: string; supporterId: string; amount: number; message?: string }) => {
  const state = ensureCreatorState(input.creatorId);
  const platformFee = roundToCents(input.amount * TIP_FEE_RATE);
  const netAmount = roundToCents(input.amount - platformFee);
  const tip: TipRecord = {
    id: `tip-${Date.now()}`,
    creatorId: input.creatorId,
    supporterId: input.supporterId,
    amount: roundToCents(input.amount),
    platformFee,
    netAmount,
    message: input.message,
    createdAt: new Date().toISOString(),
  };
  state.tips.unshift(tip);
  appendRevenueEvent(state, {
    creatorId: input.creatorId,
    source: 'TIP',
    grossAmount: tip.amount,
    platformFee,
    netAmount,
    attribution: 'stream_tip',
  });
  return tip;
};

export const createSubscription = (input: { creatorId: string; subscriberId: string; tierId: string }) => {
  const state = ensureCreatorState(input.creatorId);
  const tier = subscriptionTiers.find((entry) => entry.id === input.tierId);
  if (!tier) return null;
  const grossAmount = tier.amountUsd;
  const platformFee = roundToCents(grossAmount * SUBSCRIPTION_FEE_RATE);
  const netAmount = roundToCents(grossAmount - platformFee);
  const nextBillingDate = new Date();
  if (tier.billingPeriod === 'YEARLY') {
    nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
  } else {
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
  }
  const subscription: SubscriptionRecord = {
    id: `sub-${Date.now()}`,
    creatorId: input.creatorId,
    subscriberId: input.subscriberId,
    tierId: tier.id,
    grossAmount,
    platformFee,
    netAmount,
    recurringStatus: 'ACTIVE',
    nextBillingDate: nextBillingDate.toISOString(),
    createdAt: new Date().toISOString(),
  };
  state.subscriptions.unshift(subscription);
  appendRevenueEvent(state, {
    creatorId: input.creatorId,
    source: 'SUBSCRIPTION',
    grossAmount,
    platformFee,
    netAmount,
    attribution: `subscription_${tier.billingPeriod.toLowerCase()}`,
  });
  return { subscription, tier };
};

const generateReferralCode = (creatorId: string) => `${creatorId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase() || 'AIX'}${Math.floor(Math.random() * 900 + 100)}`;

export const createReferralCode = (creatorId: string) => {
  const state = ensureCreatorState(creatorId);
  const referralCode = generateReferralCode(creatorId);
  state.referralCodes.unshift(referralCode);
  return referralCode;
};

export const trackReferralReward = (input: { creatorId: string; referralCode: string; referredUserId: string; conversionAmount: number }) => {
  const state = ensureCreatorState(input.creatorId);
  if (!state.referralCodes.includes(input.referralCode)) return null;
  const rewardAmount = roundToCents(input.conversionAmount * REFERRAL_REWARD_RATE);
  const reward: ReferralReward = {
    id: `reward-${Date.now()}`,
    creatorId: input.creatorId,
    referralCode: input.referralCode,
    referredUserId: input.referredUserId,
    conversionAmount: roundToCents(input.conversionAmount),
    rewardAmount,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };
  state.referralRewards.unshift(reward);
  appendRevenueEvent(state, {
    creatorId: input.creatorId,
    source: 'REFERRAL_REWARD',
    grossAmount: rewardAmount,
    platformFee: 0,
    netAmount: rewardAmount,
    attribution: 'affiliate_referral',
  });
  return reward;
};

export const addAdRevenuePlaceholder = (input: { creatorId: string; amount: number; sourceLabel?: string }) => {
  const state = ensureCreatorState(input.creatorId);
  return appendRevenueEvent(state, {
    creatorId: input.creatorId,
    source: 'AD_REVENUE_PLACEHOLDER',
    grossAmount: roundToCents(input.amount),
    platformFee: 0,
    netAmount: roundToCents(input.amount),
    attribution: input.sourceLabel ?? 'ad_network_placeholder',
  });
};

const getAvailablePayoutAmount = (state: CreatorMonetizationState) => {
  const paidOut = state.payouts.reduce((sum, payout) => {
    if (payout.status === 'PAID' || payout.status === 'IN_TRANSIT' || payout.status === 'SCHEDULED') return sum + payout.amount;
    return sum;
  }, 0);
  const earned = state.revenueEvents.reduce((sum, event) => sum + event.netAmount, 0);
  return roundToCents(Math.max(0, earned - paidOut));
};

export const scheduleCreatorPayout = (creatorId: string) => {
  const state = ensureCreatorState(creatorId);
  const bankAccount = state.bankAccounts[0];
  if (!bankAccount) return null;
  const amount = getAvailablePayoutAmount(state);
  if (amount <= 0) return null;
  const scheduledFor = new Date();
  scheduledFor.setDate(scheduledFor.getDate() + 2);
  const payout: PayoutRecord = {
    id: `payout-${Date.now()}`,
    creatorId,
    amount,
    currency: 'USD',
    status: state.stripeConnectStatus === 'VERIFIED' ? 'SCHEDULED' : 'PENDING',
    scheduledFor: scheduledFor.toISOString(),
    destinationLabel: `${bankAccount.bankName} •••• ${bankAccount.last4}`,
  };
  state.payouts.unshift(payout);
  return payout;
};

export const getMonetizationDashboard = (creatorId: string) => {
  const state = ensureCreatorState(creatorId);
  const monthTotals = new Map<string, number>(getLast6MonthKey().map((key) => [key, 0]));
  state.revenueEvents.forEach((event) => {
    const key = event.createdAt.slice(0, 7);
    if (monthTotals.has(key)) monthTotals.set(key, roundToCents((monthTotals.get(key) ?? 0) + event.netAmount));
  });

  const revenueBySource = state.revenueEvents.reduce<Record<RevenueSource, number>>(
    (accumulator, event) => {
      accumulator[event.source] = roundToCents(accumulator[event.source] + event.netAmount);
      return accumulator;
    },
    { TIP: 0, SUBSCRIPTION: 0, REFERRAL_REWARD: 0, AD_REVENUE_PLACEHOLDER: 0 },
  );

  const pendingRewards = state.referralRewards.filter((reward) => reward.status === 'PENDING');
  const paidRewards = state.referralRewards.filter((reward) => reward.status === 'PAID');

  return {
    stripeConnect: {
      status: state.stripeConnectStatus,
      accountId: state.stripeAccountId ?? null,
      email: state.linkedEmail ?? null,
    },
    bankAccounts: state.bankAccounts,
    revenueChart: Array.from(monthTotals.entries()).map(([month, amount]) => ({ month, amount })),
    payoutHistory: state.payouts.filter((payout) => payout.status === 'PAID' || payout.status === 'FAILED'),
    pendingPayouts: state.payouts.filter((payout) => payout.status === 'PENDING' || payout.status === 'SCHEDULED' || payout.status === 'IN_TRANSIT'),
    referralStats: {
      activeCodes: state.referralCodes.length,
      codes: state.referralCodes,
      totalReferrals: state.referralRewards.length,
      pendingRewards: roundToCents(pendingRewards.reduce((sum, reward) => sum + reward.rewardAmount, 0)),
      paidRewards: roundToCents(paidRewards.reduce((sum, reward) => sum + reward.rewardAmount, 0)),
      rewards: state.referralRewards,
    },
    subscriptionTiers,
    payoutAnalytics: {
      totalRevenue: roundToCents(Object.values(revenueBySource).reduce((sum, value) => sum + value, 0)),
      availableForPayout: getAvailablePayoutAmount(state),
      revenueBySource,
      attribution: state.revenueEvents.slice(0, 8).map((event) => ({
        source: event.source,
        attribution: event.attribution,
        netAmount: event.netAmount,
        createdAt: event.createdAt,
      })),
    },
  };
};
