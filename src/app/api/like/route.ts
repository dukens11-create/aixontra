import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const { trackId } = await req.json();
  if (!trackId) return NextResponse.json({ error: "trackId required" }, { status: 400 });

  const authHeader = req.headers.get("authorization");
  if (!authHeader) return NextResponse.json({ error: "Missing Authorization" }, { status: 401 });

  const accessToken = authHeader.replace("Bearer ", "");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
  );

  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: existing } = await supabase
    .from("likes")
    .select("track_id")
    .eq("track_id", trackId)
    .eq("user_id", uid)
    .maybeSingle();

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data: track } = await admin.from("tracks").select("likes_count").eq("id", trackId).maybeSingle();
  const current = Number(track?.likes_count ?? 0);

  if (existing) {
    await supabase.from("likes").delete().eq("track_id", trackId).eq("user_id", uid);
    await admin.from("tracks").update({ likes_count: Math.max(0, current - 1) }).eq("id", trackId);
    return NextResponse.json({ liked: false });
  } else {
    await supabase.from("likes").insert({ track_id: trackId, user_id: uid });
    await admin.from("tracks").update({ likes_count: current + 1 }).eq("id", trackId);
    return NextResponse.json({ liked: true });
  }
}
