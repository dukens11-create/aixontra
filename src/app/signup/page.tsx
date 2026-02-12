"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function SignupPage() {
  const supabase = supabaseBrowser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const signup = async () => {
    setMsg(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setMsg(error.message);
    else setMsg("Account created. Check your email if confirmation is enabled, then login.");
  };

  return (
    <div className="card">
      <h1>Sign up</h1>
      <div className="row">
        <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="btn" onClick={signup}>Create</button>
      </div>
      {msg && <p className="muted">{msg}</p>}
    </div>
  );
}
