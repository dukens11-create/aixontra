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
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="row" style={{ gap: '1.5rem', alignItems: 'flex-start' }}>
          {creator.avatar_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={creator.avatar_url} 
              alt={creator.display_name || creator.username || "Creator"}
              style={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                objectFit: 'cover',
                border: '2px solid hsl(var(--border))'
              }}
            />
          )}
          <div style={{ flex: 1 }}>
            <h1 style={{ marginBottom: '0.5rem' }}>{creator.display_name || creator.username || "Creator"}</h1>
            {creator.username && creator.display_name && (
              <p className="muted" style={{ marginBottom: '0.5rem' }}>@{creator.username}</p>
            )}
            {creator.bio && <p style={{ lineHeight: '1.6', marginTop: '0.75rem' }}>{creator.bio}</p>}
            <div className="row" style={{ marginTop: '1rem' }}>
              <span className="badge">Creator</span>
              <span className="badge">{(tracks ?? []).length} tracks</span>
            </div>
          </div>
        </div>
      </div>

      <h2 style={{ marginBottom: '1rem' }}>Approved Tracks</h2>
      {(tracks ?? []).length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p className="muted">No approved tracks yet</p>
        </div>
      ) : (
        <div className="grid">
          {(tracks ?? []).map((t: any) => (
            <TrackCard
              key={t.id}
              track={t}
              coverUrl={coverUrl(t.cover_path)}
              creatorName={creator.display_name || creator.username || "Creator"}
              creatorAvatar={creator.avatar_url}
            />
          ))}
        </div>
      )}
    </div>
  );
}
