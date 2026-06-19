import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useOrg } from "@/features/org/useOrg";
import { signOut } from "@/services/auth";
import { useNavigate } from "react-router-dom";

export function SettingsPage() {
  const { data: org, isLoading } = useOrg();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workspace</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {isLoading ? (
            <Spinner className="h-5 w-5 text-muted-foreground" />
          ) : (
            <>
              <Row label="Business" value={org?.orgName ?? "—"} />
              <Row label="Currency" value={org?.currency ?? "—"} />
              <Row label="Your role" value={org?.role ?? "—"} />
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Row label="Name" value={org?.fullName ?? "—"} />
          <Row label="Email" value={org?.email ?? "—"} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Coming soon</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Scheduling calendar, invoices & Square payments, team members, and
          Google sign-in all build on this foundation.
        </CardContent>
      </Card>

      <Button variant="outline" onClick={handleSignOut} className="w-full">
        Sign out
      </Button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium capitalize">{value}</span>
    </div>
  );
}
