import TrackCard from "@/components/TrackCard";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { Track } from "@/types";
import Link from "next/link";
import Image from "next/image";

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
    .select("id, display_name, username, avatar_url")
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
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="logo-container" role="banner">
            <Image 
              src="/logo.svg" 
              alt="AIXONTRA Logo" 
              width={240} 
              height={72}
              priority
              style={{ marginBottom: '1rem' }}
            />
          </div>
          <h1 className="hero-title">Curated AI Music Gallery</h1>
          <p className="hero-description">
            Discover exceptional AI-generated music from creators worldwide. 
            Every track is carefully reviewed to ensure quality and creativity.
          </p>
          <div className="hero-actions">
            <Link href="/upload" className="btn">
              Upload Your Track
            </Link>
            <Link href="/about" className="btn secondary">
              Learn More
            </Link>
          </div>
          <div className="hero-links">
            <Link href="/about" className="hero-link">About AIXONTRA</Link>
            <span className="muted">•</span>
            <Link href="/faq" className="hero-link">FAQ</Link>
            <span className="muted">•</span>
            <Link href="/signup" className="hero-link">Join Community</Link>
          </div>
        </div>
      </section>

      {/* Featured Tracks Section */}
      <section className="tracks-section">
        <div className="section-header">
          <h2>Featured Tracks</h2>
          <p className="muted">Explore our curated collection of AI-generated music</p>
        </div>

        {tracks.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <h3>No tracks yet</h3>
            <p className="muted" style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
              Be the first to upload a track to AIXONTRA!
            </p>
            <Link href="/upload" className="btn">
              Upload Your First Track
            </Link>
          </div>
        ) : (
          <div className="grid">
            {tracks.map((t) => {
              const p = profileMap.get(t.creator_id);
              const creatorName = p?.display_name || p?.username || "Creator";
              const avatarUrl = p?.avatar_url || null;
              return (
                <TrackCard
                  key={t.id}
                  track={t}
                  coverUrl={coverPublicUrl(t.cover_path)}
                  creatorName={creatorName}
                  creatorAvatar={avatarUrl}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
