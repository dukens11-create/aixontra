import { NextResponse } from 'next/server';
import {
  DEFAULT_RECOMMENDATION_USER_ID,
  analyzeListeningHistory,
  getListeningHistory,
  recordListeningHistory,
} from '@/lib/platform/recommendationEngine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || DEFAULT_RECOMMENDATION_USER_ID;

  return NextResponse.json({
    userId,
    history: getListeningHistory(userId),
    analysis: analyzeListeningHistory(userId),
  });
}

export async function POST(request: Request) {
  let body: {
    userId?: string;
    songId?: string;
    watchTimeSeconds?: number;
    completed?: boolean;
    liked?: boolean;
    shared?: boolean;
    remixed?: boolean;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
  }

  if (!body.songId) {
    return NextResponse.json({ error: 'songId is required' }, { status: 400 });
  }

  const userId = body.userId || DEFAULT_RECOMMENDATION_USER_ID;
  const watchTimeSeconds = Number(body.watchTimeSeconds ?? 0);

  const entry = recordListeningHistory({
    userId,
    songId: body.songId,
    watchTimeSeconds: Number.isFinite(watchTimeSeconds) ? Math.max(0, watchTimeSeconds) : 0,
    completed: body.completed,
    liked: body.liked,
    shared: body.shared,
    remixed: body.remixed,
  });

  return NextResponse.json({
    success: true,
    entry,
    analysis: analyzeListeningHistory(userId),
  });
}
