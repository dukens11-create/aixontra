import AudioPlayer from "../../components/AudioPlayer";
import LikeButton from "../../components/LikeButton";
import { supabaseBrowser } from "../../lib/supabaseBrowser";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TrackPage({ params }: { params: { id: string } }) {
  const supabase = supabaseBrowser();
  const { data: track } = await supabase.from("tracks").select("*").eq("id", params.id).maybeSingle();

  if (!track) return <div className="card">Track not found.</div>;

  const { data: creator } = await supabase
    .from("profiles")
    .select("id, display_name, username")
    .eq("id", track.creator_id)
    .maybeSingle();

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const audioUrl = `${base}/storage/v1/object/public/tracks/${track.audio_path}`;
  const coverUrl = track.cover_path ? `${base}/storage/v1/object/public/covers/${track.cover_path}` : null;

  const playScript = `
    fetch('/api/play', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ trackId: '${track.id}' }) });
  `;

  const creatorName = creator?.display_name || creator?.username || "Creator";

  return (
    <div className="card">
      <h1>{track.title}</h1>
      <div className="row">
        <span className="badge">{track.status}</span>
        {track.genre && <span className="badge">{track.genre}</span>}
        {track.mood && <span className="badge">{track.mood}</span>}
        {track.ai_tool && <span className="badge">AI: {track.ai_tool}</span>}
      </div>

      <p className="muted">
        by <Link href={`/creator/${track.creator_id}`} style={{ fontWeight: 800 }}>{creatorName}</Link>
      </p>

      {coverUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={coverUrl} alt={track.title} style={{ width: "100%", maxWidth: 520, borderRadius: 16 }} />
      )}

      <div style={{ marginTop: 12 }}>
        <AudioPlayer src={audioUrl} />
      </div>

      <div className="row" style={{ marginTop: 12 }}>
        <LikeButton trackId={track.id} />
        <span className="badge">▶ {track.plays}</span>
        <span className="badge">♥ {track.likes_count}</span>
      </div>

      <script dangerouslySetInnerHTML={{ __html: playScript }} />
    </div>
  );
}
