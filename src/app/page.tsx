import TrackCard from "@/components/TrackCard";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { Track } from "@/types";

export const dynamic = "force-dynamic";

async function getData() {
  const supabase = supabaseBrowser();

  const { data: tracks } = await supabase
    .from("tracks")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(30);

  const creatorIds = (tracks ?? []).map((t: any) => t.creator_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, username")
    .in("id", creatorIds.length ? creatorIds : ["00000000-0000-0000-0000-000000000000"]);

  const profileMap = new Map<string, any>();
  (profiles ?? []).forEach((p) => profileMap.set(p.id, p));

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const coverPublicUrl = (path: string | null) =>
    path ? `${base}/storage/v1/object/public/covers/${path}` : null;

  return { tracks: (tracks ?? []) as Track[], coverPublicUrl, profileMap };
}

export default async function HomePage() {
  const { tracks, coverPublicUrl, profileMap } = await getData();

  return (
    <div>
      <h1>Featured Approved Tracks</h1>
      <p className="muted">Clean, curated AI music — approved by AIXENTRA.</p>

      <div className="grid">
        {tracks.map((t) => {
          const p = profileMap.get(t.creator_id);
          const creatorName = p?.display_name || p?.username || "Creator";
          return (
            <TrackCard
              key={t.id}
              track={t}
              coverUrl={coverPublicUrl(t.cover_path)}
              creatorName={creatorName}
            />
          );
        })}
      </div>
    </div>
  );
}
