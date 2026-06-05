"use client";

import { useState } from 'react';
import { VoiceModel } from '@/lib/platform/voiceMarketplace';

export function AdminApprovalQueue({ initialQueue }: { initialQueue: VoiceModel[] }) {
  const [queue, setQueue] = useState(initialQueue);
  const [message, setMessage] = useState<string | null>(null);

  const review = async (voiceId: string, action: 'approve' | 'reject') => {
    setMessage(null);
    try {
      const response = await fetch(`/api/voice-marketplace/moderation/${voiceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error ?? 'Could not update moderation queue.');
        return;
      }
      const actionLabel = action === 'approve' ? 'approved' : 'rejected';
      setQueue((current) => current.filter((voice) => voice.id !== voiceId));
      setMessage(`${data.model.title} ${actionLabel}.`);
    } catch {
      setMessage('Network error while updating moderation queue.');
    }
  };

  return (
    <section className="card bg-white/5">
      <h2>Admin approval queue</h2>
      <p className="muted mt-2">Impersonation detection is currently a placeholder status and must be integrated with ML moderation.</p>
      {queue.length === 0 ? (
        <p className="muted mt-3">No pending voices.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {queue.map((voice) => (
            <div key={voice.id} className="rounded-xl border border-white/10 p-3">
              <p className="font-semibold">{voice.title}</p>
              <p className="muted">{voice.creator.stageName} · consent {voice.consentVerified ? 'verified' : 'pending'} · {voice.impersonationDetectionStatus}</p>
              <div className="row mt-2">
                <button type="button" className="btn" onClick={() => review(voice.id, 'approve')}>Approve</button>
                <button type="button" className="btn secondary" onClick={() => review(voice.id, 'reject')}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {message && <p className="muted mt-3">{message}</p>}
    </section>
  );
}
