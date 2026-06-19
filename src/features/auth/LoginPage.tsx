import { useState } from "react";
import { Navigate } from "react-router-dom";
import { signInWithEmail, signUpWithEmail } from "@/services/auth";
import { useAuthStore } from "@/stores/authStore";
import { useIsAuthenticated } from "@/features/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

type Mode = "signin" | "signup";

export function LoginPage() {
  const isAuthenticated = useIsAuthenticated();
  const initializing = useAuthStore((s) => s.initializing);

  const [mode, setMode] = useState<Mode>("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (!initializing && isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { needsEmailConfirmation } = await signUpWithEmail(
          email,
          password,
          fullName,
        );
        if (needsEmailConfirmation) {
          setNotice(
            "Account created. Check your email to confirm, then sign in.",
          );
          setMode("signin");
        }
        // If confirmation is off, the session listener routes us into the app.
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Service Dashboard</CardTitle>
          <CardDescription>
            {mode === "signin"
              ? "Sign in to manage your jobs."
              : "Create your account to get started."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Your name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Smith"
                  required
                  autoComplete="name"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete={
                  mode === "signin" ? "current-password" : "new-password"
                }
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {notice && <p className="text-sm text-green-700">{notice}</p>}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading && <Spinner className="h-5 w-5" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
            <button
              type="button"
              className="font-medium text-primary hover:underline"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
                setNotice(null);
              }}
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>

          {/* Google sign-in is wired in src/services/auth.ts and turns on as soon
              as the Google provider is configured in Supabase. */}
          <div className="border-t pt-3">
            <Button variant="outline" className="w-full" size="lg" disabled>
              Continue with Google (coming soon)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
