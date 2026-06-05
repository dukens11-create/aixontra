import { NextResponse } from 'next/server';
import { createRelease, getReleases } from '@/lib/platform/distributionService';

export async function GET() {
  return NextResponse.json({ releases: getReleases() });
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.title || !body.artistName || !body.type || !body.releaseDate) {
    return NextResponse.json(
      { error: 'title, artistName, type, and releaseDate are required.' },
      { status: 400 },
    );
  }

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

  return NextResponse.json({ release }, { status: 201 });
}
