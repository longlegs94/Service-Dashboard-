import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { FullPageSpinner } from "@/components/ui/spinner";

/**
 * Guards /app/* routes. Logged-out users are redirected to /login.
 * While the initial session check runs we show a spinner to avoid a flash of
 * the login screen for already-authenticated users.
 */
export function ProtectedRoute() {
  const session = useAuthStore((s) => s.session);
  const initializing = useAuthStore((s) => s.initializing);

  if (initializing) {
    return <FullPageSpinner />;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
