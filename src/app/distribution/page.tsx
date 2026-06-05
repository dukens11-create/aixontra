'use client';

import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import type { DistributionPlatform, ReleaseMetadata, ReleaseStatus, ReleaseType } from '@/lib/platform/distributionService';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PLATFORM_LABELS: Record<DistributionPlatform, string> = {
  spotify: 'Spotify',
  apple_music: 'Apple Music',
  tiktok: 'TikTok',
  youtube_music: 'YouTube Music',
};

const ALL_PLATFORMS: DistributionPlatform[] = ['spotify', 'apple_music', 'tiktok', 'youtube_music'];

const STATUS_BADGES: Record<ReleaseStatus, string> = {
  draft: 'bg-white/10 text-white/60',
  metadata_complete: 'bg-blue-500/20 text-blue-300',
  scheduled: 'bg-yellow-500/20 text-yellow-300',
  submitted: 'bg-purple-500/20 text-purple-300',
  distributed: 'bg-green-500/20 text-green-300',
  rejected: 'bg-red-500/20 text-red-300',
};

const STATUS_LABEL: Record<ReleaseStatus, string> = {
  draft: 'Draft',
  metadata_complete: 'Metadata complete',
  scheduled: 'Scheduled',
  submitted: 'Submitted',
  distributed: 'Distributed',
  rejected: 'Rejected',
};

const emptyTrack = () => ({
  trackNumber: 1,
  title: '',
  artistName: '',
  featuredArtists: [] as string[],
  songwriters: [] as string[],
  producers: [] as string[],
  genre: '',
  language: 'English',
  explicit: false,
  durationSeconds: 180,
  lyrics: '',
  isrcPlaceholder: '',
  audioFileUrl: '',
});

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DistributionPage() {
  const [releases, setReleases] = useState<ReleaseMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportResult, setExportResult] = useState<Record<string, unknown> | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'new'>('dashboard');
  const [selectedRelease, setSelectedRelease] = useState<ReleaseMetadata | null>(null);

  // New-release form state
  const [title, setTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [releaseType, setReleaseType] = useState<ReleaseType>('single');
  const [label, setLabel] = useState('Self-released');
  const [copyrightLine, setCopyrightLine] = useState('');
  const [publishingLine, setPublishingLine] = useState('');
  const [artworkUrl, setArtworkUrl] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [preSaveDate, setPreSaveDate] = useState('');
  const [platforms, setPlatforms] = useState<DistributionPlatform[]>([...ALL_PLATFORMS]);
  const [trackTitle, setTrackTitle] = useState('');
  const [trackArtist, setTrackArtist] = useState('');
  const [trackGenre, setTrackGenre] = useState('');
  const [trackSongwriters, setTrackSongwriters] = useState('');
  const [trackProducers, setTrackProducers] = useState('');
  const [trackExplicit, setTrackExplicit] = useState(false);
  const [trackLyrics, setTrackLyrics] = useState('');
  const [trackDuration, setTrackDuration] = useState(180);

  // ---------------------------------------------------------------------------
  // Fetch releases
  // ---------------------------------------------------------------------------
  const fetchReleases = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/distribution/releases');
      const data = await res.json();
      setReleases(data.releases ?? []);
    } catch {
      toast.error('Failed to load releases');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: 'dashboard' | 'new') => {
    setActiveTab(tab);
    if (tab === 'dashboard') fetchReleases();
    setExportResult(null);
    setSelectedRelease(null);
  };

  // ---------------------------------------------------------------------------
  // Create release
  // ---------------------------------------------------------------------------
  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const track = {
        ...emptyTrack(),
        trackNumber: 1,
        title: trackTitle,
        artistName: trackArtist || artistName,
        genre: trackGenre,
        explicit: trackExplicit,
        lyrics: trackLyrics,
        durationSeconds: trackDuration,
        songwriters: trackSongwriters.split(',').map((s) => s.trim()).filter(Boolean),
        producers: trackProducers.split(',').map((s) => s.trim()).filter(Boolean),
      };

      const res = await fetch('/api/distribution/releases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          artistName,
          type: releaseType,
          label,
          copyrightLine: copyrightLine || `${new Date().getFullYear()} ${artistName}`,
          publishingLine: publishingLine || `${new Date().getFullYear()} AIXENTRA Publishing`,
          artworkUrl: artworkUrl || undefined,
          releaseDate,
          preSaveDate: preSaveDate || undefined,
          platforms,
          tracks: [track],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? 'Failed to create release');
        return;
      }
      toast.success(`Release "${data.release.title}" created!`);
      setReleases((prev) => [data.release, ...prev]);
      setSelectedRelease(data.release);
      setActiveTab('dashboard');
      // Reset form
      setTitle('');
      setTrackTitle('');
      setTrackArtist('');
      setTrackGenre('');
      setTrackSongwriters('');
      setTrackProducers('');
      setTrackLyrics('');
      setTrackExplicit(false);
      setTrackDuration(180);
    } catch {
      toast.error('Failed to create release');
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Export
  // ---------------------------------------------------------------------------
  const handleExport = async (release: ReleaseMetadata) => {
    setLoading(true);
    setExportResult(null);
    try {
      const res = await fetch('/api/distribution/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ releaseId: release.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? 'Export failed');
        return;
      }
      setExportResult(data);
      setSelectedRelease(release);
      toast.success('Export package generated');
    } catch {
      toast.error('Export failed');
    } finally {
      setLoading(false);
    }
  };

  const togglePlatform = (platform: DistributionPlatform) => {
    setPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform],
    );
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <section className="card bg-white/5">
        <h1>Music Distribution</h1>
        <p className="muted mt-1">
          Prepare export-ready metadata, schedule releases, and generate distributor-ready packages
          for Spotify, Apple Music, TikTok, and YouTube Music.
        </p>
        <div className="row mt-3 gap-2">
          <button
            className={`btn ${activeTab === 'dashboard' ? '' : 'secondary'}`}
            onClick={() => handleTabChange('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`btn ${activeTab === 'new' ? '' : 'secondary'}`}
            onClick={() => handleTabChange('new')}
          >
            + New release
          </button>
        </div>
      </section>

      {/* ---- Dashboard tab ---- */}
      {activeTab === 'dashboard' && (
        <>
          {/* Summary cards */}
          <section className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {(['draft', 'scheduled', 'submitted', 'distributed'] as ReleaseStatus[]).map(
              (status) => {
                const count = releases.filter((r) => r.status === status).length;
                return (
                  <div key={status} className="card bg-black/30">
                    <p className="text-xl font-bold">{count}</p>
                    <p className="muted">{STATUS_LABEL[status]}</p>
                  </div>
                );
              },
            )}
          </section>

          {/* Release list */}
          <section className="card bg-white/5">
            <div className="row justify-between">
              <h2>Releases</h2>
              <button className="badge" onClick={fetchReleases} disabled={loading}>
                {loading ? 'Loading…' : 'Refresh'}
              </button>
            </div>

            {loading && (
              <p className="muted mt-4 text-center">Loading releases…</p>
            )}

            {!loading && releases.length === 0 && (
              <p className="muted mt-4 text-center">
                No releases yet. Click <strong>+ New release</strong> to get started.
              </p>
            )}

            {!loading && releases.length > 0 && (
              <div className="mt-3 space-y-2">
                {releases.map((release) => (
                  <div
                    key={release.id}
                    className="rounded-xl border border-white/10 p-3 space-y-1"
                  >
                    <div className="row justify-between flex-wrap gap-2">
                      <div>
                        <p className="font-semibold">{release.title}</p>
                        <p className="muted text-sm">
                          {release.artistName} · {release.type.toUpperCase()} ·{' '}
                          {release.tracks.length} track{release.tracks.length !== 1 ? 's' : ''}
                        </p>
                        <p className="muted text-xs mt-0.5">
                          Release date:{' '}
                          {release.releaseDate
                            ? new Date(release.releaseDate).toLocaleDateString()
                            : '—'}
                        </p>
                      </div>
                      <div className="row gap-2 flex-wrap">
                        <span
                          className={`badge text-xs px-2 py-0.5 rounded-full ${STATUS_BADGES[release.status]}`}
                        >
                          {STATUS_LABEL[release.status]}
                        </span>
                        {release.platforms.map((p) => (
                          <span key={p} className="badge text-xs">
                            {PLATFORM_LABELS[p]}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="row gap-2 mt-2">
                      <button
                        className="btn secondary"
                        onClick={() => handleExport(release)}
                        disabled={loading}
                      >
                        Export package
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Export result */}
          {exportResult && selectedRelease && (
            <section className="card bg-white/5">
              <h2>Export package — {selectedRelease.title}</h2>

              {/* Validation */}
              {typeof exportResult.validation === 'object' &&
                exportResult.validation !== null && (
                  <div className="mt-3 space-y-2">
                    {(exportResult.validation as { errors: string[]; warnings: string[] }).errors
                      .length > 0 && (
                      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3">
                        <p className="font-semibold text-red-300">Errors</p>
                        <ul className="mt-1 list-disc list-inside space-y-0.5">
                          {(
                            exportResult.validation as { errors: string[] }
                          ).errors.map((e, i) => (
                            <li key={i} className="muted text-red-300 text-sm">
                              {e}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {(exportResult.validation as { warnings: string[] }).warnings.length > 0 && (
                      <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3">
                        <p className="font-semibold text-yellow-300">Warnings</p>
                        <ul className="mt-1 list-disc list-inside space-y-0.5">
                          {(
                            exportResult.validation as { warnings: string[] }
                          ).warnings.map((w, i) => (
                            <li key={i} className="muted text-yellow-300 text-sm">
                              {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {(exportResult.validation as { errors: string[]; warnings: string[] }).errors
                      .length === 0 &&
                      (exportResult.validation as { warnings: string[] }).warnings.length ===
                        0 && (
                        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-3">
                          <p className="text-green-300">✓ All metadata fields validated</p>
                        </div>
                      )}
                  </div>
                )}

              {/* Platform exports */}
              {typeof exportResult.exports === 'object' &&
                exportResult.exports !== null && (
                  <div className="mt-4 space-y-3">
                    {Object.entries(exportResult.exports as Record<string, unknown>).map(
                      ([platform, payload]) => (
                        <details key={platform} className="rounded-xl border border-white/10">
                          <summary className="cursor-pointer p-3 font-semibold capitalize">
                            {PLATFORM_LABELS[platform as DistributionPlatform] ?? platform}{' '}
                            export
                          </summary>
                          <pre className="p-3 text-xs text-white/70 overflow-x-auto">
                            {JSON.stringify(payload, null, 2)}
                          </pre>
                        </details>
                      ),
                    )}
                  </div>
                )}
            </section>
          )}
        </>
      )}

      {/* ---- New release tab ---- */}
      {activeTab === 'new' && (
        <section className="card bg-white/5">
          <h2>New release</h2>
          <form className="mt-3 space-y-4" onSubmit={handleCreate}>
            {/* Release type */}
            <div>
              <p className="text-sm font-semibold mb-1">Release type</p>
              <div className="row gap-2">
                {(['single', 'album', 'ep'] as ReleaseType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`badge ${releaseType === t ? 'bg-purple-600' : ''}`}
                    onClick={() => setReleaseType(t)}
                  >
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Release metadata */}
            <fieldset className="space-y-2 border border-white/10 rounded-xl p-3">
              <legend className="text-sm font-semibold px-1">Release metadata</legend>
              <input
                className="input"
                placeholder="Release title *"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <input
                className="input"
                placeholder="Primary artist name *"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                required
              />
              <input
                className="input"
                placeholder="Label (or Self-released)"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
              <input
                className="input"
                placeholder="Copyright line, e.g. 2025 NeonKreyol"
                value={copyrightLine}
                onChange={(e) => setCopyrightLine(e.target.value)}
              />
              <input
                className="input"
                placeholder="Publishing line, e.g. 2025 AIXENTRA Publishing"
                value={publishingLine}
                onChange={(e) => setPublishingLine(e.target.value)}
              />
              <input
                className="input"
                placeholder="Cover artwork URL (≥3000×3000 px JPG)"
                value={artworkUrl}
                onChange={(e) => setArtworkUrl(e.target.value)}
              />
            </fieldset>

            {/* Scheduling */}
            <fieldset className="space-y-2 border border-white/10 rounded-xl p-3">
              <legend className="text-sm font-semibold px-1">Release scheduling</legend>
              <div>
                <label className="muted text-sm">Release date *</label>
                <input
                  className="input mt-1"
                  type="datetime-local"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="muted text-sm">Pre-save / pre-order date (optional)</label>
                <input
                  className="input mt-1"
                  type="datetime-local"
                  value={preSaveDate}
                  onChange={(e) => setPreSaveDate(e.target.value)}
                />
              </div>
            </fieldset>

            {/* Platforms */}
            <fieldset className="space-y-2 border border-white/10 rounded-xl p-3">
              <legend className="text-sm font-semibold px-1">Distribution platforms</legend>
              <div className="row gap-2 flex-wrap">
                {ALL_PLATFORMS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`badge ${platforms.includes(p) ? 'bg-purple-600' : ''}`}
                    onClick={() => togglePlatform(p)}
                  >
                    {PLATFORM_LABELS[p]}
                  </button>
                ))}
              </div>
              {platforms.length === 0 && (
                <p className="muted text-sm text-red-400">Select at least one platform.</p>
              )}
            </fieldset>

            {/* Track metadata */}
            <fieldset className="space-y-2 border border-white/10 rounded-xl p-3">
              <legend className="text-sm font-semibold px-1">
                Track 1 metadata
                {releaseType !== 'single' && (
                  <span className="muted font-normal ml-1">(additional tracks via API)</span>
                )}
              </legend>
              <input
                className="input"
                placeholder="Track title *"
                value={trackTitle}
                onChange={(e) => setTrackTitle(e.target.value)}
                required
              />
              <input
                className="input"
                placeholder="Track artist (defaults to release artist)"
                value={trackArtist}
                onChange={(e) => setTrackArtist(e.target.value)}
              />
              <input
                className="input"
                placeholder="Genre, e.g. Afrobeat"
                value={trackGenre}
                onChange={(e) => setTrackGenre(e.target.value)}
              />
              <input
                className="input"
                placeholder="Songwriters (comma-separated)"
                value={trackSongwriters}
                onChange={(e) => setTrackSongwriters(e.target.value)}
              />
              <input
                className="input"
                placeholder="Producers (comma-separated)"
                value={trackProducers}
                onChange={(e) => setTrackProducers(e.target.value)}
              />
              <div>
                <label className="muted text-sm">Duration (seconds)</label>
                <input
                  className="input mt-1"
                  type="number"
                  min={1}
                  value={trackDuration}
                  onChange={(e) => setTrackDuration(Number(e.target.value))}
                />
              </div>
              <textarea
                className="textarea"
                placeholder="Lyrics (optional)"
                rows={4}
                value={trackLyrics}
                onChange={(e) => setTrackLyrics(e.target.value)}
              />
              <label className="row gap-2 items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={trackExplicit}
                  onChange={(e) => setTrackExplicit(e.target.checked)}
                />
                <span className="text-sm">Explicit lyrics</span>
              </label>

              <div className="rounded-xl border border-white/10 bg-black/30 p-3 mt-2">
                <p className="text-sm font-semibold">ISRC placeholder</p>
                <p className="muted text-xs mt-1">
                  An ISRC placeholder will be auto-generated (format: US‑AXN‑YY‑NNNNN).
                  Replace with your registered ISRC before submission to distributors.
                </p>
              </div>
            </fieldset>

            <button
              type="submit"
              className="btn"
              disabled={loading || platforms.length === 0}
            >
              {loading ? 'Creating…' : 'Create release'}
            </button>
          </form>
        </section>
      )}

      {/* Architecture notes */}
      <section className="card bg-black/30">
        <h2>Distribution architecture</h2>
        <p className="muted text-sm mt-2">
          This system prepares export-ready metadata packages for major DSPs. Each release
          receives a UPC placeholder and per-track ISRC placeholders until formal registration.
        </p>
        <div className="mt-3 space-y-1 text-sm">
          <p className="font-semibold">Follow-up TODOs</p>
          <ul className="list-disc list-inside muted space-y-0.5">
            <li>Integrate with a real ISRC registrar API (RIAA / PPL / Sound Exchange).</li>
            <li>Connect to a GS1 UPC/EAN barcode issuer.</li>
            <li>Implement Spotify for Artists OAuth submission flow.</li>
            <li>Implement Apple Music / iTunes Connect aggregator API.</li>
            <li>Implement TikTok for Artists partner API submission.</li>
            <li>Implement YouTube Music / Content ID asset delivery API.</li>
            <li>Add artwork validation (dimensions, DPI, colour-space).</li>
            <li>Persist release data in Supabase / Prisma instead of in-memory store.</li>
            <li>Add multi-track form for album and EP releases.</li>
            <li>Build release calendar with drag-and-drop scheduling.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
