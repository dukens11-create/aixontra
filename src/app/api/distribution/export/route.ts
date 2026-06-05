import { NextResponse } from 'next/server';
import { buildExportPackage, createRelease, validateReleaseMetadata } from '@/lib/platform/distributionService';

export async function POST(request: Request) {
  const body = await request.json();

  // Allow exporting an existing release by ID or an ad-hoc payload for preview.
  if (body.releaseId) {
    const pkg = buildExportPackage(body.releaseId as string);
    if (!pkg) {
      return NextResponse.json({ error: 'Release not found.' }, { status: 404 });
    }
    return NextResponse.json(pkg);
  }

  // Ad-hoc export: validate and format an inline release payload.
  if (!body.title || !body.artistName || !body.type || !body.releaseDate) {
    return NextResponse.json(
      { error: 'releaseId or (title, artistName, type, releaseDate) are required.' },
      { status: 400 },
    );
  }

  // Create a temporary in-memory release to format.
  const release = createRelease({
    title: body.title,
    artistName: body.artistName,
    type: body.type,
    label: body.label ?? 'Self-released',
    copyrightLine: body.copyrightLine ?? `${new Date().getFullYear()} ${body.artistName}`,
    publishingLine: body.publishingLine ?? `${new Date().getFullYear()} AIXENTRA Publishing`,
    artworkUrl: body.artworkUrl,
    releaseDate: body.releaseDate,
    preSaveDate: body.preSaveDate,
    platforms: body.platforms ?? ['spotify', 'apple_music', 'tiktok', 'youtube_music'],
    tracks: body.tracks ?? [],
  });

  const validation = validateReleaseMetadata(release);
  const pkg = buildExportPackage(release.id);
  return NextResponse.json({ ...pkg, validation });
}
