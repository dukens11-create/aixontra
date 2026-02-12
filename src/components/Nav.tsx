"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function Nav() {
  const supabase = supabaseBrowser();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div style={{ borderBottom: "1px solid #242436" }}>
      <div className="container row" style={{ justifyContent: "space-between" }}>
        <div className="row">
          <Link href="/" style={{ fontWeight: 900, letterSpacing: 1 }}>AIXENTRA</Link>
          <span className="badge">AI Music Gallery</span>
        </div>
        <div className="row">
          <Link href="/upload" className="badge">Upload</Link>
          <Link href="/admin/review" className="badge">Admin</Link>
          {!email ? (
            <>
              <Link href="/login" className="badge">Login</Link>
              <Link href="/signup" className="badge">Sign up</Link>
            </>
          ) : (
            <>
              <span className="muted">{email}</span>
              <button className="btn secondary" onClick={signOut}>Sign out</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
