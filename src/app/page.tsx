"use client";

import TrackCard from "@/components/TrackCard";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { Track } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { LANGUAGES } from "@/lib/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [filteredTracks, setFilteredTracks] = useState<Track[]>([]);
  const [profileMap, setProfileMap] = useState<Map<string, any>>(new Map());
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const supabase = supabaseBrowser();

      const { data: tracks } = await supabase
        .from("tracks")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(50);

      const creatorIds = (tracks ?? []).map((t: any) => t.creator_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name, username, avatar_url")
        .in("id", creatorIds.length ? creatorIds : ["00000000-0000-0000-0000-000000000000"]);

      const profileMap = new Map<string, any>();
      (profiles ?? []).forEach((p) => profileMap.set(p.id, p));

      setTracks((tracks ?? []) as Track[]);
      setFilteredTracks((tracks ?? []) as Track[]);
      setProfileMap(profileMap);
      setLoading(false);
    }

    loadData();
  }, []);

  useEffect(() => {
    if (selectedLanguage === "all") {
      setFilteredTracks(tracks);
    } else {
      setFilteredTracks(tracks.filter(track => track.language === selectedLanguage));
    }
  }, [selectedLanguage, tracks]);

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const coverPublicUrl = (path: string | null) =>
    path ? `${base}/storage/v1/object/public/covers/${path}` : null;

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

        {/* Language Filter */}
        <div style={{ marginBottom: '1.5rem', maxWidth: '300px' }}>
          <Label htmlFor="language-filter">Filter by Language</Label>
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger id="language-filter" className="mt-2">
              <SelectValue placeholder="All Languages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p className="muted">Loading tracks...</p>
          </div>
        ) : filteredTracks.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <h3>{selectedLanguage === "all" ? "No tracks yet" : "No tracks found for this language"}</h3>
            <p className="muted" style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
              {selectedLanguage === "all" 
                ? "Be the first to upload a track to AIXONTRA!"
                : "Try selecting a different language or upload a track in this language."}
            </p>
            <Link href="/upload" className="btn">
              Upload Your First Track
            </Link>
          </div>
        ) : (
          <div className="grid">
            {filteredTracks.map((t) => {
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
