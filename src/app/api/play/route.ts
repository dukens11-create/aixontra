import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { trackId } = await req.json();
  if (!trackId) return NextResponse.json({ error: "trackId required" }, { status: 400 });

  const supabase = supabaseServer();
  const { data: track, error } = await supabase.from("tracks").select("plays").eq("id", trackId).maybeSingle();
  if (error || !track) return NextResponse.json({ error: "not found" }, { status: 404 });

  await supabase.from("tracks").update({ plays: (track.plays ?? 0) + 1 }).eq("id", trackId);
  return NextResponse.json({ ok: true });
}
