"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function LikeButton({ trackId }: { trackId: string }) {
  const supabase = supabaseBrowser();
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from("likes")
        .select("track_id")
        .eq("track_id", trackId)
        .eq("user_id", userData.user.id)
        .maybeSingle();

      if (!error && data) setLiked(true);
    })();
  }, [supabase, trackId]);

  const toggle = async () => {
    setLoading(true);
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const res = await fetch("/api/like", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ trackId }),
    });

    if (res.ok) setLiked((v) => !v);
    setLoading(false);
  };

  return (
    <button className="btn" onClick={toggle} disabled={loading}>
      {liked ? "♥ Liked" : "♡ Like"}
    </button>
  );
}
