"use client";

import { useState } from "react";
import { supabaseBrowser } from "../lib/supabaseBrowser";

export default function LoginPage() {
  const supabase = supabaseBrowser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const login = async () => {
    setMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMsg(error.message);
    else window.location.href = "/";
  };

  return (
    <div className="card">
      <h1>Login</h1>
      <div className="row">
        <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="btn" onClick={login}>Login</button>
      </div>
      {msg && <p className="muted">{msg}</p>}
    </div>
  );
}
