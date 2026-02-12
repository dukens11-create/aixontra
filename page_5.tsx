"use client";

import AuthGuard from "../../components/AuthGuard";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "../../lib/supabaseBrowser";

type TrackRow = any;

export default function AdminReviewPage() {
  return (
    <AuthGuard>
      <AdminPanel />
    </AuthGuard>
  );
}

function AdminPanel() {
  const supabase = supabaseBrowser();
  const [tracks, setTracks] = useState<TrackRow[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setMsg(null);
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return;

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
      if (profile?.role !== "admin") {
        setMsg("Access denied: admin only.");
        return;
      }

      const { data } = await supabase
        .from("tracks")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      setTracks(data ?? []);
    })();
  }, [supabase]);

  const act = async (id: string, action: "approve" | "reject") => {
    const note = prompt("Optional note for creator (press OK to continue):") || "";
    const endpoint = action === "approve" ? "/api/approve" : "/api/reject";

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return alert("Login again.");

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ trackId: id, note }),
    });
    if (!res.ok) {
      const t = await res.text();
      alert(t);
      return;
    }
    setTracks((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <div className="card">
      <h1>Admin Review</h1>
      {msg && <p className="muted">{msg}</p>}

      {tracks.length === 0 ? (
        <p className="muted">No pending tracks.</p>
      ) : (
        tracks.map((t) => (
          <div key={t.id} className="card" style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 900 }}>{t.title}</div>
            <div className="muted">creator_id: {t.creator_id}</div>
            <div className="row" style={{ marginTop: 10 }}>
              <button className="btn" onClick={() => act(t.id, "approve")}>Approve</button>
              <button className="btn secondary" onClick={() => act(t.id, "reject")}>Reject</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
