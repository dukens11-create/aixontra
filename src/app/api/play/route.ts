import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { enforceRateLimit } from "@/lib/moderation/rateLimitMiddleware";
import { issueAutomatedWarning, runModerationPipeline } from "@/lib/moderation/moderationService";

export async function POST(req: Request) {
  const { trackId } = await req.json();
  if (!trackId) return NextResponse.json({ error: "trackId required" }, { status: 400 });
  const limiter = await enforceRateLimit(req, "play");
  if (limiter.response) return limiter.response;
  const actorId = `anon:${limiter.identifier}`;

  const moderation = runModerationPipeline(
    {
      identifier: limiter.identifier,
      userId: actorId,
      targetId: trackId,
      requestPath: "/api/play",
      userAgent: req.headers.get("user-agent") ?? undefined,
    },
    ["fakePlay", "botPattern"]
  );
  const severeFlag = moderation.createdFlags.find((flag) => flag.type === "FAKE_PLAY" || flag.type === "BOT_PATTERN");
  if (severeFlag?.userId) {
    issueAutomatedWarning({
      userId: severeFlag.userId,
      reason: `Automated anti-abuse trigger: ${severeFlag.type}`,
      cooldownMs: 30 * 60 * 1000,
    });
  }

  const supabase = supabaseServer();
  const { data: track, error } = await supabase.from("tracks").select("plays").eq("id", trackId).maybeSingle();
  if (error || !track) return NextResponse.json({ error: "not found" }, { status: 404 });

  await supabase.from("tracks").update({ plays: (track.plays ?? 0) + 1 }).eq("id", trackId);
  return NextResponse.json({ ok: true, moderation: moderation.results });
}
