import { createClient } from "@supabase/supabase-js";

export const supabaseServer = (accessToken?: string) => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // server-only
    {
      global: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined,
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
};
