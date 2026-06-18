import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Copy .env.example to .env.local and set " +
      "VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
  );
}

/**
 * The single Supabase browser client for the whole app.
 *
 * - PKCE flow is required for the OAuth (Google) redirect login.
 * - Sessions persist in localStorage and auto-refresh so the user stays signed
 *   in across reloads.
 * - `detectSessionInUrl` lets the /auth/callback route complete the OAuth
 *   handshake automatically.
 *
 * All data access goes through service modules in src/services/* — components
 * should not import this client directly.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: "pkce",
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
