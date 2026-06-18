import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { FullPageSpinner } from "@/components/ui/spinner";

/**
 * OAuth redirect landing route (/auth/callback).
 *
 * supabase-js (`detectSessionInUrl`) automatically exchanges the PKCE code in
 * the URL for a session, then fires onAuthStateChange (wired in useAuthBootstrap).
 * We just wait for the session to appear, then route into the app.
 */
export function AuthCallback() {
  const session = useAuthStore((s) => s.session);
  const initializing = useAuthStore((s) => s.initializing);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), 10_000);
    return () => clearTimeout(timer);
  }, []);

  if (session) {
    return <Navigate to="/app/dashboard" replace />;
  }

  if (!initializing && timedOut) {
    return <Navigate to="/login" replace />;
  }

  return <FullPageSpinner />;
}
