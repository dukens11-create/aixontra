import Link from "next/link";
import { Track } from "@/types";

export default function TrackCard({
  track,
  coverUrl,
  creatorName,
}: {
  track: Track;
  coverUrl: string | null;
  creatorName: string;
}) {
  return (
    <div className="card">
      <Link href={`/track/${track.id}`}>
        <div style={{ aspectRatio: "1/1", borderRadius: 14, overflow: "hidden", background: "#0f0f16" }}>
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverUrl} alt={track.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ padding: 14 }} className="muted">No cover</div>
          )}
        </div>
        <div style={{ marginTop: 10 }}>
          <div style={{ fontWeight: 800 }}>{track.title}</div>
          <div className="muted">
            by <span style={{ color: "#fff" }}>{creatorName}</span>
          </div>
          <div className="row" style={{ marginTop: 8 }}>
            {track.genre && <span className="badge">{track.genre}</span>}
            {track.mood && <span className="badge">{track.mood}</span>}
            <span className="badge">♥ {track.likes_count}</span>
            <span className="badge">▶ {track.plays}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
