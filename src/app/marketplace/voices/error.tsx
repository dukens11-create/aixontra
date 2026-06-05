"use client";

export default function VoiceMarketplaceError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="card bg-white/5">
      <h1>Voice marketplace unavailable</h1>
      <p className="muted mt-2">{error.message}</p>
      <button className="btn mt-3" onClick={reset}>Retry</button>
    </div>
  );
}
