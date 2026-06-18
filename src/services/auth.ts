import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

/**
 * Auth service — the single boundary for all authentication.
 *
 * Every auth call in the app goes through this module so that swapping the web
 * OAuth flow for a native (Capacitor) Google sign-in later is a one-file change
 * (Phase 5), with no impact on components.
 */

/** Start the Google OAuth login. Redirects the browser to Google, then back to
 *  /auth/callback where supabase-js completes the PKCE code exchange. */
export async function signInWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  return session?.user ?? null;
}

/** Subscribe to auth state changes. Returns an unsubscribe function. */
export function onAuthStateChange(
  callback: (session: Session | null) => void,
): () => void {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return () => subscription.unsubscribe();
}
