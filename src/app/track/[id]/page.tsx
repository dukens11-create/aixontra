import AudioPlayer from "@/components/AudioPlayer";
import LikeButton from "@/components/LikeButton";
import { supabaseBrowser } from "@/lib/supabase/browser";
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
  const videoUrl = track.video_url;

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

      {videoUrl && (
        <div style={{ marginTop: 16, marginBottom: 16 }}>
          <video 
            src={videoUrl} 
            controls 
            poster={coverUrl || undefined}
            style={{ 
              width: "100%", 
              maxWidth: 720, 
              borderRadius: 16,
              backgroundColor: '#000'
            }}
          >
            Your browser does not support the video tag.
          </video>
          <p className="muted" style={{ fontSize: '0.875rem', marginTop: 8 }}>
            🎬 AI-Generated Music Video
          </p>
        </div>
      )}

      {!videoUrl && coverUrl && (
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
