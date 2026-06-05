"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const defaultForm = {
  title: '',
  description: '',
  category: '',
  tags: '',
  previewAudioUrl: '',
  licenseType: 'standard',
  priceUsd: '29',
  commercialUseEnabled: true,
  royaltyPercent: '12',
  consentVerified: false,
  consentProofUrl: '',
};

export function VoiceUploadForm() {
  const router = useRouter();
  const [form, setForm] = useState(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    try {
      const response = await fetch('/api/voice-marketplace/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId: 'creator-1',
          title: form.title,
          description: form.description,
          category: form.category,
          tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
          previewAudioUrl: form.previewAudioUrl,
          licenseType: form.licenseType,
          priceUsd: Number(form.priceUsd),
          commercialUseEnabled: form.commercialUseEnabled,
          royaltyPercent: Number(form.royaltyPercent),
          consentVerified: form.consentVerified,
          consentProofUrl: form.consentProofUrl,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Upload failed');
      setMessage({ type: 'success', text: 'Voice model submitted. Pending admin approval queue review.' });
      setForm(defaultForm);
      router.refresh();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Upload failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="card space-y-3 bg-white/5">
      <h2>Upload voice model</h2>
      <input className="input" placeholder="Voice title" value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} required />
      <textarea className="textarea" placeholder="Voice description" value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <input className="input" placeholder="Category (Kompa, Drill...)" value={form.category} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))} required />
        <input className="input" placeholder="Tags (comma-separated)" value={form.tags} onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))} />
      </div>
      <input className="input" placeholder="Preview audio URL (optional)" value={form.previewAudioUrl} onChange={(event) => setForm((prev) => ({ ...prev, previewAudioUrl: event.target.value }))} />
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <select className="select" value={form.licenseType} onChange={(event) => setForm((prev) => ({ ...prev, licenseType: event.target.value }))}>
          <option value="standard">Standard license</option>
          <option value="exclusive">Exclusive license</option>
          <option value="subscription">Subscription license</option>
        </select>
        <input className="input" type="number" min={0} step="0.01" value={form.priceUsd} onChange={(event) => setForm((prev) => ({ ...prev, priceUsd: event.target.value }))} />
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <label className="row">
          <input type="checkbox" checked={form.commercialUseEnabled} onChange={(event) => setForm((prev) => ({ ...prev, commercialUseEnabled: event.target.checked }))} />
          <span>Commercial use enabled</span>
        </label>
        <input className="input" type="number" min={0} max={100} step="0.1" value={form.royaltyPercent} onChange={(event) => setForm((prev) => ({ ...prev, royaltyPercent: event.target.value }))} placeholder="Creator royalty %" />
      </div>
      <label className="row">
        <input type="checkbox" checked={form.consentVerified} onChange={(event) => setForm((prev) => ({ ...prev, consentVerified: event.target.checked }))} />
        <span>Consent verified by voice owner</span>
      </label>
      <input className="input" placeholder="Consent proof URL" value={form.consentProofUrl} onChange={(event) => setForm((prev) => ({ ...prev, consentProofUrl: event.target.value }))} required />
      <button className="btn" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit voice model'}</button>
      {message && <p className={message.type === 'error' ? 'text-red-400 text-sm' : 'text-emerald-400 text-sm'}>{message.text}</p>}
    </form>
  );
}
