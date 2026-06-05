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
      <div className="container row" style={{ justifyContent: "space-between", paddingTop: '1rem', paddingBottom: '1rem' }}>
        <div className="row">
          <Link href="/" style={{ fontWeight: 900, letterSpacing: 1 }}>AIXENTRA</Link>
          <span className="badge">The Future of Sound Starts Here.</span>
        </div>
        <div className="row">
          <Link href="/generate" className="badge">Generate</Link>
          <Link href="/feed" className="badge">Feed</Link>
          <Link href="/marketplace" className="badge">Marketplace</Link>
          <Link href="/trending" className="badge">Trending</Link>
          <Link href="/search" className="badge">Search</Link>
          <Link href="/library" className="badge">Library</Link>
          <Link href="/notifications" className="badge">Notifications</Link>
          <Link href="/terms" className="badge">Terms</Link>
          <Link href="/privacy" className="badge">Privacy</Link>
          {email && <Link href="/dashboard/creator" className="badge">Creator Hub</Link>}
          <Link href="/admin" className="badge">Admin</Link>
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
