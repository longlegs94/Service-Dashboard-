import { useEffect } from "react";
import { getSession, onAuthStateChange } from "@/services/auth";
import { useAuthStore } from "@/stores/authStore";

/**
 * Wires Supabase auth state into the global store. Mount once near the app root.
 * Loads the current session on start, then keeps it in sync via the listener.
 */
export function useAuthBootstrap() {
  const setSession = useAuthStore((s) => s.setSession);
  const setInitializing = useAuthStore((s) => s.setInitializing);

  useEffect(() => {
    let active = true;

    getSession()
      .then((session) => {
        if (active) setSession(session);
      })
      .catch(() => {
        if (active) setSession(null);
      })
      .finally(() => {
        if (active) setInitializing(false);
      });

    const unsubscribe = onAuthStateChange((session) => {
      setSession(session);
      setInitializing(false);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [setSession, setInitializing]);
}

/** Convenience selectors for components. */
export function useSession() {
  return useAuthStore((s) => s.session);
}

export function useIsAuthenticated() {
  return useAuthStore((s) => Boolean(s.session));
}
