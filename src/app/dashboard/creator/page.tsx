'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { songs } from '@/lib/platform/demoData';
import { getSubscriptionTiers } from '@/lib/platform/monetization';

export default function CreatorDashboardPage() {
  const creatorId = 'demo-user';
  const [legalName, setLegalName] = useState('');
  const [stageName, setStageName] = useState('NeonKreyol');
  const [reason, setReason] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED'>('NOT_SUBMITTED');
  const [dashboardData, setDashboardData] = useState<null | {
    stripeConnect: { status: 'NOT_LINKED' | 'PENDING_VERIFICATION' | 'VERIFIED'; accountId: string | null; email: string | null };
    bankAccounts: Array<{ id: string; bankName: string; last4: string; status: 'PENDING' | 'VERIFIED' }>;
    revenueChart: Array<{ month: string; amount: number }>;
    payoutHistory: Array<{ id: string; amount: number; status: string; processedAt?: string; destinationLabel: string }>;
    pendingPayouts: Array<{ id: string; amount: number; status: string; scheduledFor: string; destinationLabel: string }>;
    referralStats: {
      activeCodes: number;
      codes: string[];
      totalReferrals: number;
      pendingRewards: number;
      paidRewards: number;
    };
    payoutAnalytics: {
      totalRevenue: number;
      availableForPayout: number;
      revenueBySource: Record<'TIP' | 'SUBSCRIPTION' | 'REFERRAL_REWARD' | 'AD_REVENUE_PLACEHOLDER', number>;
      attribution: Array<{ source: string; attribution: string; netAmount: number; createdAt: string }>;
    };
  }>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [stripeEmail, setStripeEmail] = useState('creator@aixontra.com');
  const [bankName, setBankName] = useState('First Federal');
  const [bankLast4, setBankLast4] = useState('4242');

  const subscriptionTiers = getSubscriptionTiers();

  const topSongs = songs.slice(0, 3);

  const loadDashboard = useCallback(async () => {
    setDashboardLoading(true);
    setDashboardError(null);
    try {
      const response = await fetch(`/api/monetization/dashboard?creatorId=${creatorId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Failed to load monetization dashboard');
      setDashboardData(data.dashboard);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load dashboard';
      setDashboardError(message);
      toast.error(message);
    } finally {
      setDashboardLoading(false);
    }
  }, [creatorId]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const requestVerification = async (event: FormEvent) => {
    event.preventDefault();
    const response = await fetch('/api/verification/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'demo-user',
        legalName,
        stageName,
        reason,
        links: ['https://instagram.com/example'],
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      toast.error(data.error ?? 'Verification request failed');
      return;
    }
    setVerificationStatus(data.verificationRequest.status);
    toast.success('Verification request submitted');
  };

  const linkStripe = async () => {
    const response = await fetch('/api/monetization/stripe-connect/link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creatorId, email: stripeEmail }),
    });
    const data = await response.json();
    if (!response.ok) {
      toast.error(data.error ?? 'Stripe Connect link failed');
      return;
    }
    toast.success('Stripe Connect account link placeholder created');
    await loadDashboard();
  };

  const verifyStripe = async () => {
    const response = await fetch('/api/monetization/stripe-connect/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creatorId }),
    });
    const data = await response.json();
    if (!response.ok) {
      toast.error(data.error ?? 'Stripe Connect verification failed');
      return;
    }
    toast.success('Stripe Connect verification placeholder marked as verified');
    await loadDashboard();
  };

  const addBank = async (event: FormEvent) => {
    event.preventDefault();
    const response = await fetch('/api/monetization/bank-accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creatorId, bankName, last4: bankLast4 }),
    });
    const data = await response.json();
    if (!response.ok) {
      toast.error(data.error ?? 'Bank account add failed');
      return;
    }
    toast.success('Bank account placeholder added');
    await loadDashboard();
  };

  const schedulePayout = async () => {
    const response = await fetch('/api/monetization/payouts/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creatorId }),
    });
    const data = await response.json();
    if (!response.ok) {
      toast.error(data.error ?? 'Unable to schedule payout');
      return;
    }
    toast.success('Payout scheduled');
    await loadDashboard();
  };

  const createReferralCode = async () => {
    const response = await fetch('/api/monetization/referrals/code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creatorId }),
    });
    const data = await response.json();
    if (!response.ok) {
      toast.error(data.error ?? 'Failed to create referral code');
      return;
    }
    toast.success(`Referral code created: ${data.referralCode}`);
    await loadDashboard();
  };

  return (
    <div className="space-y-4 pb-6">
      <section className="card bg-white/5">
        <h1>Creator Dashboard</h1>
        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
          <div className="rounded-xl border border-white/10 p-3"><p className="text-xl font-bold">154k</p><p className="muted">Plays</p></div>
          <div className="rounded-xl border border-white/10 p-3"><p className="text-xl font-bold">8.3k</p><p className="muted">Likes</p></div>
          <div className="rounded-xl border border-white/10 p-3"><p className="text-xl font-bold">1.2k</p><p className="muted">Comments</p></div>
          <div className="rounded-xl border border-white/10 p-3"><p className="text-xl font-bold">4.1k</p><p className="muted">Saves</p></div>
          <div className="rounded-xl border border-white/10 p-3"><p className="text-xl font-bold">2.4k</p><p className="muted">Downloads</p></div>
          <div className="rounded-xl border border-white/10 p-3"><p className="text-xl font-bold">$4,290</p><p className="muted">Earnings</p></div>
          <div className="rounded-xl border border-white/10 p-3"><p className="text-xl font-bold">US, FR, HT</p><p className="muted">Audience countries</p></div>
          <div className="rounded-xl border border-white/10 p-3"><p className="text-xl font-bold">+18%</p><p className="muted">Growth chart placeholder</p></div>
        </div>
      </section>

      <section className="card bg-white/5">
        <h2>Top songs</h2>
        <div className="mt-3 space-y-2">
          {topSongs.map((song) => (
            <div key={song.id} className="rounded-xl border border-white/10 p-3">
              <div className="row justify-between"><p className="font-semibold">{song.title}</p><span className="badge">Royalty split: 100%</span></div>
              <p className="muted">{song.genre} · {song.mood} · {song.plays} plays</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card bg-white/5">
        <h2>Artist verification request</h2>
        <p className="muted mt-2">Status: {verificationStatus}</p>
        <form className="mt-3 space-y-2" onSubmit={requestVerification}>
          <input className="input" placeholder="Legal name" value={legalName} onChange={(event) => setLegalName(event.target.value)} required />
          <input className="input" placeholder="Stage name" value={stageName} onChange={(event) => setStageName(event.target.value)} required />
          <input className="input" type="file" aria-label="ID upload placeholder" />
          <textarea className="textarea" placeholder="Reason for verification" value={reason} onChange={(event) => setReason(event.target.value)} required />
          <button type="submit" className="btn secondary">Submit verification request</button>
        </form>
      </section>

      <section className="card bg-white/5">
        <h2>Monetization dashboard</h2>
        <p className="muted mt-2">Creator payouts, Stripe Connect, tips, subscriptions, referral rewards, ad revenue placeholders, and payout analytics.</p>
        {dashboardLoading ? (
          <div className="mt-3 rounded-xl border border-white/10 p-3"><p className="muted">Loading monetization dashboard...</p></div>
        ) : dashboardError ? (
          <div className="mt-3 rounded-xl border border-red-500/40 p-3">
            <p className="text-red-300">{dashboardError}</p>
            <button type="button" className="btn secondary mt-2" onClick={() => void loadDashboard()}>Retry</button>
          </div>
        ) : !dashboardData ? (
          <div className="mt-3 rounded-xl border border-white/10 p-3"><p className="muted">No monetization data yet.</p></div>
        ) : (
          <div className="mt-3 space-y-3">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              <div className="rounded-xl border border-white/10 p-3"><p className="text-xl font-bold">${dashboardData.payoutAnalytics.totalRevenue.toFixed(2)}</p><p className="muted">Total revenue</p></div>
              <div className="rounded-xl border border-white/10 p-3"><p className="text-xl font-bold">${dashboardData.payoutAnalytics.availableForPayout.toFixed(2)}</p><p className="muted">Pending payouts</p></div>
              <div className="rounded-xl border border-white/10 p-3"><p className="text-xl font-bold">{dashboardData.referralStats.totalReferrals}</p><p className="muted">Referral conversions</p></div>
              <div className="rounded-xl border border-white/10 p-3"><p className="text-xl font-bold">{dashboardData.stripeConnect.status}</p><p className="muted">Stripe Connect status</p></div>
            </div>

            <div className="rounded-xl border border-white/10 p-3">
              <div className="row justify-between"><h3>Revenue chart (6-month net)</h3><span className="badge">Placeholder bars</span></div>
              <div className="mt-3 space-y-2">
                {dashboardData.revenueChart.map((entry) => {
                  const scale = Math.max(...dashboardData.revenueChart.map((item) => item.amount), 1);
                  return (
                    <div key={entry.month} className="grid grid-cols-[68px_1fr_auto] items-center gap-2">
                      <span className="muted">{entry.month.slice(5)}</span>
                      <div className="h-2 rounded bg-white/10">
                        <div className="h-2 rounded bg-violet-400" style={{ width: `${Math.max(4, (entry.amount / scale) * 100)}%` }} />
                      </div>
                      <span className="text-xs">${entry.amount.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 p-3">
              <div className="row justify-between"><h3>Payout history</h3><button type="button" className="btn secondary" onClick={schedulePayout}>Schedule payout</button></div>
              {dashboardData.payoutHistory.length === 0 ? <p className="muted mt-2">No completed payouts yet.</p> : (
                <div className="mt-2 space-y-2">
                  {dashboardData.payoutHistory.map((payout) => (
                    <div key={payout.id} className="rounded-lg border border-white/10 p-2">
                      <p>${payout.amount.toFixed(2)} · {payout.status}</p>
                      <p className="muted">{payout.destinationLabel} · {payout.processedAt ? new Date(payout.processedAt).toLocaleDateString() : 'Not processed yet'}</p>
                    </div>
                  ))}
                </div>
              )}
              <h4 className="mt-3">Pending payouts</h4>
              {dashboardData.pendingPayouts.length === 0 ? <p className="muted mt-2">No pending payouts.</p> : (
                <div className="mt-2 space-y-2">
                  {dashboardData.pendingPayouts.map((payout) => (
                    <div key={payout.id} className="rounded-lg border border-white/10 p-2">
                      <p>${payout.amount.toFixed(2)} · {payout.status}</p>
                      <p className="muted">{new Date(payout.scheduledFor).toLocaleDateString()} · {payout.destinationLabel}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-white/10 p-3">
              <div className="row justify-between"><h3>Stripe Connect & bank accounts</h3><span className="badge">Payout scheduling + status tracking</span></div>
              <p className="muted mt-2">Account: {dashboardData.stripeConnect.accountId ?? 'Not linked'} · {dashboardData.stripeConnect.email ?? 'No email linked'}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <input className="input" placeholder="Stripe email" value={stripeEmail} onChange={(event) => setStripeEmail(event.target.value)} />
                <button type="button" className="btn secondary" onClick={linkStripe}>Link account</button>
                <button type="button" className="btn secondary" onClick={verifyStripe}>Verify account</button>
              </div>
              <form className="mt-2 flex flex-wrap gap-2" onSubmit={addBank}>
                <input className="input" placeholder="Bank name" value={bankName} onChange={(event) => setBankName(event.target.value)} required />
                <input className="input" placeholder="Last 4" value={bankLast4} onChange={(event) => setBankLast4(event.target.value)} pattern="\d{4}" required />
                <button type="submit" className="btn secondary">Add bank</button>
              </form>
              <div className="mt-2 space-y-1">
                {dashboardData.bankAccounts.length === 0 ? <p className="muted">No bank accounts linked.</p> : dashboardData.bankAccounts.map((account) => (
                  <p key={account.id} className="muted">{account.bankName} •••• {account.last4} · {account.status}</p>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 p-3">
              <div className="row justify-between"><h3>Referral stats</h3><button type="button" className="btn secondary" onClick={createReferralCode}>Create referral code</button></div>
              <p className="muted mt-2">Active codes: {dashboardData.referralStats.activeCodes} · Total referrals: {dashboardData.referralStats.totalReferrals}</p>
              <p className="muted">Pending rewards: ${dashboardData.referralStats.pendingRewards.toFixed(2)} · Paid rewards: ${dashboardData.referralStats.paidRewards.toFixed(2)}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {dashboardData.referralStats.codes.length === 0 ? <span className="muted">No referral codes</span> : dashboardData.referralStats.codes.map((code) => <span key={code} className="badge">{code}</span>)}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 p-3">
              <h3>Subscription tiers & attribution analytics</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {subscriptionTiers.map((tier) => <span key={tier.id} className="badge">{tier.name} ${tier.amountUsd}/{tier.billingPeriod === 'MONTHLY' ? 'mo' : 'yr'}</span>)}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
                <div className="rounded-lg border border-white/10 p-2"><p className="font-semibold">${dashboardData.payoutAnalytics.revenueBySource.TIP.toFixed(2)}</p><p className="muted">Tips</p></div>
                <div className="rounded-lg border border-white/10 p-2"><p className="font-semibold">${dashboardData.payoutAnalytics.revenueBySource.SUBSCRIPTION.toFixed(2)}</p><p className="muted">Subscriptions</p></div>
                <div className="rounded-lg border border-white/10 p-2"><p className="font-semibold">${dashboardData.payoutAnalytics.revenueBySource.REFERRAL_REWARD.toFixed(2)}</p><p className="muted">Referral rewards</p></div>
                <div className="rounded-lg border border-white/10 p-2"><p className="font-semibold">${dashboardData.payoutAnalytics.revenueBySource.AD_REVENUE_PLACEHOLDER.toFixed(2)}</p><p className="muted">Ad rev placeholder</p></div>
              </div>
              <div className="mt-2 space-y-1">
                {dashboardData.payoutAnalytics.attribution.slice(0, 3).map((event, index) => (
                  <p key={`${event.attribution}-${index}`} className="muted">{event.source} via {event.attribution} · ${event.netAmount.toFixed(2)}</p>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
