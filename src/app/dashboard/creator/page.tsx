'use client';

import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { songs } from '@/lib/platform/demoData';

export default function CreatorDashboardPage() {
  const [legalName, setLegalName] = useState('');
  const [stageName, setStageName] = useState('NeonKreyol');
  const [reason, setReason] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED'>('NOT_SUBMITTED');

  const topSongs = songs.slice(0, 3);

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
    </div>
  );
}
