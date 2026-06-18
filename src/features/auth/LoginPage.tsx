import { useState } from "react";
import { Navigate } from "react-router-dom";
import { signInWithGoogle } from "@/services/auth";
import { useAuthStore } from "@/stores/authStore";
import { useIsAuthenticated } from "@/features/auth/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export function LoginPage() {
  const isAuthenticated = useIsAuthenticated();
  const initializing = useAuthStore((s) => s.initializing);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Authenticated users visiting /login go straight to the dashboard.
  if (!initializing && isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />;
  }

  async function handleGoogleLogin() {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      // Browser redirects to Google; no further code runs here on success.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Service Dashboard</CardTitle>
          <CardDescription>
            Organize your jobs, schedule, and billing in one place.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full"
            size="lg"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? <Spinner className="h-5 w-5" /> : <GoogleIcon />}
            Continue with Google
          </Button>
          {error && (
            <p className="text-center text-sm text-destructive">{error}</p>
          )}
          <p className="text-center text-xs text-muted-foreground">
            By continuing you agree to use this app for your own business records.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}
