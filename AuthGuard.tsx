"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "../lib/supabaseBrowser";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const supabase = supabaseBrowser();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) window.location.href = "/login";
      else setOk(true);
    });
  }, [supabase]);

  if (!ok) return <div className="card">Checking session...</div>;
  return <>{children}</>;
}
