import { createClient } from "@supabase/supabase-js";

export const supabaseBrowser = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
      (typeof window === "undefined"
        ? "https://placeholder.supabase.co"
        : (() => {
            throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
          })()),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      (typeof window === "undefined"
        ? "placeholder-anon-key"
        : (() => {
            throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
          })())
  );
