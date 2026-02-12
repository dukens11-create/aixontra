import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const { trackId, note } = await req.json();
  if (!trackId) return NextResponse.json({ error: "trackId required" }, { status: 400 });

  const auth = req.headers.get("authorization");
  if (!auth) return NextResponse.json({ error: "Missing Authorization" }, { status: 401 });

  const token = auth.replace("Bearer ", "");

  const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });

  const { data: userData } = await supa.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });

  const { data: profile } = await admin.from("profiles").select("role").eq("id", uid).maybeSingle();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });

  await admin.from("tracks").update({ status: "approved", review_note: note || null }).eq("id", trackId);
  return NextResponse.json({ ok: true });
}
