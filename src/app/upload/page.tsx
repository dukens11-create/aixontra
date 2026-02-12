"use client";

import AuthGuard from "@/components/AuthGuard";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function UploadPage() {
  return (
    <AuthGuard>
      <UploadForm />
    </AuthGuard>
  );
}

function UploadForm() {
  const supabase = supabaseBrowser();

  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [mood, setMood] = useState("");
  const [aiTool, setAiTool] = useState("");
  const [audio, setAudio] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setMsg(null);
    if (!title.trim()) return setMsg("Title is required.");
    if (!audio) return setMsg("Audio file is required.");

    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      setLoading(false);
      return setMsg("Not logged in.");
    }

    const audioExt = audio.name.split(".").pop() || "mp3";
    const audioPath = `${user.id}/${crypto.randomUUID()}.${audioExt}`;

    const audioUp = await supabase.storage.from("tracks").upload(audioPath, audio, {
      cacheControl: "3600",
      upsert: false,
      contentType: audio.type || "audio/mpeg",
    });

    if (audioUp.error) {
      setLoading(false);
      return setMsg(audioUp.error.message);
    }

    let coverPath: string | null = null;
    if (cover) {
      const coverExt = cover.name.split(".").pop() || "jpg";
      coverPath = `${user.id}/${crypto.randomUUID()}.${coverExt}`;
      const coverUp = await supabase.storage.from("covers").upload(coverPath, cover, {
        cacheControl: "3600",
        upsert: false,
        contentType: cover.type || "image/jpeg",
      });
      if (coverUp.error) {
        setLoading(false);
        return setMsg(coverUp.error.message);
      }
    }

    const { error: insErr } = await supabase.from("tracks").insert({
      creator_id: user.id,
      title,
      genre: genre || null,
      mood: mood || null,
      ai_tool: aiTool || null,
      audio_path: audioPath,
      cover_path: coverPath,
      status: "pending",
    });

    setLoading(false);

    if (insErr) return setMsg(insErr.message);

    setMsg("Submitted! Your track is pending review.");
    setTitle(""); setGenre(""); setMood(""); setAiTool("");
    setAudio(null); setCover(null);
  };

  return (
    <div className="card">
      <h1>Upload to AIXENTRA</h1>
      <p className="muted">All uploads are reviewed before going public.</p>

      <div className="row">
        <input className="input" placeholder="Track title" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="row" style={{ marginTop: 10 }}>
        <input className="input" placeholder="Genre (e.g., Afrobeat, Ambient)" value={genre} onChange={(e) => setGenre(e.target.value)} />
        <input className="input" placeholder="Mood (e.g., Calm, Epic)" value={mood} onChange={(e) => setMood(e.target.value)} />
        <input className="input" placeholder="AI tool (optional)" value={aiTool} onChange={(e) => setAiTool(e.target.value)} />
      </div>

      <hr />

      <div className="row">
        <div className="card" style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Audio (MP3 recommended)</div>
          <input className="input" type="file" accept="audio/*" onChange={(e) => setAudio(e.target.files?.[0] ?? null)} />
        </div>
        <div className="card" style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Cover (square image)</div>
          <input className="input" type="file" accept="image/*" onChange={(e) => setCover(e.target.files?.[0] ?? null)} />
        </div>
      </div>

      <div className="row" style={{ marginTop: 12 }}>
        <button className="btn" onClick={submit} disabled={loading}>
          {loading ? "Uploading..." : "Submit for Review"}
        </button>
        {msg && <span className="muted">{msg}</span>}
      </div>
    </div>
  );
}
