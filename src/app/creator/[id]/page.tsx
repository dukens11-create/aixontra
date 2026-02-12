import { supabaseBrowser } from "@/lib/supabase/browser";
import TrackCard from "@/components/TrackCard";

export const dynamic = "force-dynamic";

export default async function CreatorPage({ params }: { params: { id: string } }) {
  const supabase = supabaseBrowser();
  const { data: creator } = await supabase.from("profiles").select("*").eq("id", params.id).maybeSingle();

  if (!creator) return <div className="card">Creator not found.</div>;

  const { data: tracks } = await supabase
    .from("tracks")
    .select("*")
    .eq("creator_id", params.id)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const coverUrl = (path: string | null) => (path ? `${base}/storage/v1/object/public/covers/${path}` : null);

  return (
    <div>
      <div className="card">
        <h1>{creator.display_name || creator.username || "Creator"}</h1>
        {creator.bio && <p className="muted">{creator.bio}</p>}
        <span className="badge">Creator</span>
      </div>

      <h2 style={{ marginTop: 14 }}>Approved Tracks</h2>
      <div className="grid">
        {(tracks ?? []).map((t: any) => (
          <TrackCard
            key={t.id}
            track={t}
            coverUrl={coverUrl(t.cover_path)}
            creatorName={creator.display_name || creator.username || "Creator"}
          />
        ))}
      </div>
    </div>
  );
}
