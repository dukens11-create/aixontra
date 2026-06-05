// Music Distribution Preparation Service
// Handles metadata formatting, ISRC placeholders, and distributor-ready export packaging.

export type ReleaseType = 'single' | 'album' | 'ep';

export type DistributionPlatform = 'spotify' | 'apple_music' | 'tiktok' | 'youtube_music';

export type ReleaseStatus =
  | 'draft'
  | 'metadata_complete'
  | 'scheduled'
  | 'submitted'
  | 'distributed'
  | 'rejected';

export type TrackMetadata = {
  /** Sequential track number within the release (1-based). */
  trackNumber: number;
  title: string;
  artistName: string;
  featuredArtists?: string[];
  /** Primary songwriter credits (real names). */
  songwriters: string[];
  /** Music producer credits. */
  producers: string[];
  /** Additional contributor credits, keyed by role. */
  additionalCredits?: Record<string, string>;
  genre: string;
  subgenre?: string;
  language: string;
  /** Explicit lyrics flag. */
  explicit: boolean;
  /** Duration in seconds. */
  durationSeconds: number;
  lyrics?: string;
  /** ISRC placeholder – replace with a real ISRC before submission. */
  isrcPlaceholder: string;
  /** Path or URL to the mastered audio file (WAV or MP3). */
  audioFileUrl?: string;
};

export type ReleaseMetadata = {
  id: string;
  type: ReleaseType;
  /** Release title (album/single/EP name). */
  title: string;
  /** Primary artist display name. */
  artistName: string;
  /** Record-label name (or "Self-released"). */
  label: string;
  /** Copyright notice, e.g. "2025 NeonKreyol". */
  copyrightLine: string;
  /** Publishing rights notice, e.g. "2025 AIXENTRA Publishing". */
  publishingLine: string;
  /** Cover-art URL (must be ≥3000×3000 px JPG for most distributors). */
  artworkUrl?: string;
  /** UPC/EAN barcode – placeholder until formally assigned. */
  upcPlaceholder: string;
  /** Target release date/time in ISO-8601 format (UTC). */
  releaseDate: string;
  /** Pre-save/pre-order launch date in ISO-8601 format (UTC). */
  preSaveDate?: string;
  platforms: DistributionPlatform[];
  tracks: TrackMetadata[];
  status: ReleaseStatus;
  createdAt: string;
  updatedAt: string;
};

// ---------------------------------------------------------------------------
// ISRC & UPC placeholder helpers
// ---------------------------------------------------------------------------

/**
 * Generates a well-formed ISRC placeholder string.
 * Format: CC-XXX-YY-NNNNN
 *   CC    = 2-letter country code (use "US" as default)
 *   XXX   = 3-character registrant code (uppercase alpha)
 *   YY    = 2-digit year suffix
 *   NNNNN = 5-digit designation code (sequential)
 *
 * NOTE: This is a placeholder only. Register with your national ISRC agency
 * (e.g. RIAA for the US, PPL for the UK) before distribution.
 */
export const generateIsrcPlaceholder = (index = 0): string => {
  const year = new Date().getFullYear().toString().slice(-2);
  const seq = String(index + 1).padStart(5, '0');
  return `US-AXN-${year}-${seq}`;
};

/**
 * Generates a UPC/EAN placeholder string.
 * NOTE: Obtain a real UPC from GS1 or your distributor before submission.
 */
export const generateUpcPlaceholder = (): string => {
  const numeric = Date.now().toString().slice(-12).padStart(12, '0');
  return `UPC-PLACEHOLDER-${numeric}`;
};

// ---------------------------------------------------------------------------
// Metadata validation
// ---------------------------------------------------------------------------

export type ValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

export const validateReleaseMetadata = (release: ReleaseMetadata): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!release.title.trim()) errors.push('Release title is required.');
  if (!release.artistName.trim()) errors.push('Artist name is required.');
  if (!release.label.trim()) errors.push('Label / self-release field is required.');
  if (!release.copyrightLine.trim()) errors.push('Copyright line is required.');
  if (!release.publishingLine.trim()) errors.push('Publishing line is required.');
  if (!release.releaseDate) errors.push('Release date is required.');
  if (release.platforms.length === 0) errors.push('At least one distribution platform must be selected.');
  if (release.tracks.length === 0) errors.push('At least one track is required.');

  if (!release.artworkUrl) warnings.push('Cover artwork URL is missing. Most distributors require ≥3000×3000 px JPG.');
  if (release.upcPlaceholder.startsWith('UPC-PLACEHOLDER')) {
    warnings.push('UPC is still a placeholder. Replace with a real barcode before submission.');
  }

  const releaseTs = Date.parse(release.releaseDate);
  if (!isNaN(releaseTs) && releaseTs < Date.now()) {
    warnings.push('Release date is in the past.');
  }

  release.tracks.forEach((track, idx) => {
    const prefix = `Track ${idx + 1} ("${track.title || 'untitled'}")`;
    if (!track.title.trim()) errors.push(`${prefix}: title is required.`);
    if (!track.artistName.trim()) errors.push(`${prefix}: artist name is required.`);
    if (track.songwriters.length === 0) warnings.push(`${prefix}: no songwriters listed.`);
    if (track.producers.length === 0) warnings.push(`${prefix}: no producers listed.`);
    if (!track.audioFileUrl) warnings.push(`${prefix}: audio file URL is missing.`);
    if (track.isrcPlaceholder.startsWith('US-AXN')) {
      warnings.push(`${prefix}: ISRC is still a placeholder. Register before submission.`);
    }
  });

  return { valid: errors.length === 0, errors, warnings };
};

// ---------------------------------------------------------------------------
// Distributor-ready export formatters
// ---------------------------------------------------------------------------

/** Spotify / Spotify for Artists DDEXsupported metadata object. */
export const formatForSpotify = (release: ReleaseMetadata) => ({
  release_title: release.title,
  primary_artist: release.artistName,
  release_type: release.type,
  label_name: release.label,
  upc: release.upcPlaceholder,
  release_date: release.releaseDate,
  pre_save_date: release.preSaveDate ?? null,
  cover_art_url: release.artworkUrl ?? null,
  copyright: release.copyrightLine,
  p_line: release.publishingLine,
  tracks: release.tracks.map((track) => ({
    track_number: track.trackNumber,
    track_title: track.title,
    primary_artist: track.artistName,
    featured_artists: track.featuredArtists ?? [],
    isrc: track.isrcPlaceholder,
    genre: track.genre,
    subgenre: track.subgenre ?? null,
    language: track.language,
    explicit: track.explicit,
    duration_ms: track.durationSeconds * 1000,
    songwriters: track.songwriters,
    producers: track.producers,
    lyrics_available: Boolean(track.lyrics),
    audio_file_url: track.audioFileUrl ?? null,
  })),
  _distributor_note: 'Replace all placeholder ISRC/UPC values before submission to Spotify for Artists or your aggregator.',
});

/** Apple Music / iTunes Connect style object. */
export const formatForAppleMusic = (release: ReleaseMetadata) => ({
  album_title: release.title,
  artist: release.artistName,
  album_type: release.type === 'single' ? 'Single' : release.type === 'ep' ? 'EP' : 'Album',
  record_label: release.label,
  upc_ean: release.upcPlaceholder,
  release_date: release.releaseDate.split('T')[0],
  presale_date: release.preSaveDate ? release.preSaveDate.split('T')[0] : null,
  original_release_date: release.releaseDate.split('T')[0],
  cover_art_url: release.artworkUrl ?? null,
  copyright: release.copyrightLine,
  phonographic_copyright: release.publishingLine,
  primary_genre: release.tracks[0]?.genre ?? 'Music',
  tracks: release.tracks.map((track) => ({
    track_number: track.trackNumber,
    track_name: track.title,
    artist_name: track.artistName,
    featuring: track.featuredArtists?.join(', ') ?? '',
    isrc: track.isrcPlaceholder,
    genre: track.genre,
    language: track.language,
    explicit_lyrics: track.explicit ? 'Explicit' : 'Clean',
    duration_ms: track.durationSeconds * 1000,
    songwriters: track.songwriters.join(', '),
    producers: track.producers.join(', '),
    has_lyrics: Boolean(track.lyrics),
    asset_url: track.audioFileUrl ?? null,
  })),
  _distributor_note: 'Submit via iTunes Connect or an Apple-authorized aggregator. Replace all placeholder ISRC/UPC values.',
});

/** TikTok Sound Kit / TikTok for Artists metadata object. */
export const formatForTikTok = (release: ReleaseMetadata) => ({
  sound_name: release.title,
  artist_name: release.artistName,
  label: release.label,
  release_date: release.releaseDate,
  cover_url: release.artworkUrl ?? null,
  tracks: release.tracks.map((track) => ({
    position: track.trackNumber,
    title: track.title,
    artist: track.artistName,
    featured: track.featuredArtists?.join(', ') ?? '',
    isrc: track.isrcPlaceholder,
    explicit: track.explicit,
    duration_secs: track.durationSeconds,
    genre: track.genre,
    audio_url: track.audioFileUrl ?? null,
  })),
  _distributor_note: 'Submit via TikTok for Artists or an authorized TikTok music partner. Replace all placeholder ISRC/UPC values.',
});

/** YouTube Music / YouTube Content ID metadata object. */
export const formatForYouTubeMusic = (release: ReleaseMetadata) => ({
  album: release.title,
  artist: release.artistName,
  label: release.label,
  upc: release.upcPlaceholder,
  release_date: release.releaseDate,
  artwork_url: release.artworkUrl ?? null,
  copyright_owner: release.copyrightLine,
  asset_labels: [release.label],
  tracks: release.tracks.map((track) => ({
    track_number: track.trackNumber,
    title: track.title,
    artist: track.artistName,
    featured_artists: track.featuredArtists ?? [],
    isrc: track.isrcPlaceholder,
    genre: track.genre,
    language: track.language,
    explicit: track.explicit,
    duration_seconds: track.durationSeconds,
    writers: track.songwriters,
    producers: track.producers,
    lyrics: track.lyrics ?? null,
    audio_asset_url: track.audioFileUrl ?? null,
  })),
  content_id_enabled: true,
  _distributor_note: 'Submit via YouTube Studio or YouTube Content ID partner. Replace all placeholder ISRC/UPC values.',
});

/** Returns a platform-specific formatted export object. */
export const formatForPlatform = (
  release: ReleaseMetadata,
  platform: DistributionPlatform,
) => {
  switch (platform) {
    case 'spotify':
      return formatForSpotify(release);
    case 'apple_music':
      return formatForAppleMusic(release);
    case 'tiktok':
      return formatForTikTok(release);
    case 'youtube_music':
      return formatForYouTubeMusic(release);
  }
};

// ---------------------------------------------------------------------------
// In-memory release store (replace with DB persistence in production)
// ---------------------------------------------------------------------------

const releases: ReleaseMetadata[] = [];

export const createRelease = (
  input: Omit<ReleaseMetadata, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'upcPlaceholder'>,
): ReleaseMetadata => {
  const now = new Date().toISOString();
  const tracksWithIsrc: TrackMetadata[] = input.tracks.map((track, idx) => ({
    ...track,
    isrcPlaceholder: track.isrcPlaceholder || generateIsrcPlaceholder(idx),
  }));
  const release: ReleaseMetadata = {
    ...input,
    tracks: tracksWithIsrc,
    id: `release-${Date.now()}`,
    upcPlaceholder: generateUpcPlaceholder(),
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  };
  releases.unshift(release);
  return release;
};

export const updateReleaseStatus = (id: string, status: ReleaseStatus): ReleaseMetadata | null => {
  const release = releases.find((r) => r.id === id);
  if (!release) return null;
  release.status = status;
  release.updatedAt = new Date().toISOString();
  return release;
};

export const getReleases = (): ReleaseMetadata[] => releases;

export const getReleaseById = (id: string): ReleaseMetadata | undefined =>
  releases.find((r) => r.id === id);

/** Builds an export package with all platform-specific payloads + validation results. */
export const buildExportPackage = (releaseId: string) => {
  const release = getReleaseById(releaseId);
  if (!release) return null;

  const validation = validateReleaseMetadata(release);
  const exports: Record<string, unknown> = {};

  for (const platform of release.platforms) {
    exports[platform] = formatForPlatform(release, platform);
  }

  return {
    releaseId: release.id,
    title: release.title,
    artistName: release.artistName,
    generatedAt: new Date().toISOString(),
    validation,
    exports,
  };
};
