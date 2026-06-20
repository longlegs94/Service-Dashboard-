import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner, FullPageSpinner } from "@/components/ui/spinner";
import {
  useClient,
  useCreateClient,
  useUpdateClient,
} from "@/features/clients/hooks";
import { useOrg } from "@/features/org/useOrg";

/** Shared form for creating a new client and editing an existing one. */
export function ClientFormPage({ mode }: { mode: "new" | "edit" }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: org } = useOrg();

  const existing = useClient(mode === "edit" ? id : undefined);
  const createClient = useCreateClient();
  const updateClient = useUpdateClient(id ?? "");

  const [displayName, setDisplayName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Hydrate the form when editing.
  useEffect(() => {
    if (mode === "edit" && existing.data) {
      const c = existing.data;
      setDisplayName(c.display_name);
      setCompanyName(c.company_name ?? "");
      setPhone(c.phone ?? "");
      setEmail(c.email ?? "");
      setNotes(c.notes ?? "");
    }
  }, [mode, existing.data]);

  if (mode === "edit" && existing.isLoading) return <FullPageSpinner />;

  const saving = createClient.isPending || updateClient.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const input = {
      display_name: displayName,
      company_name: companyName,
      phone,
      email,
      notes,
    };
    try {
      if (mode === "new") {
        if (!org) throw new Error("Still loading your workspace — try again.");
        const client = await createClient.mutateAsync({
          orgId: org.orgId,
          createdBy: org.profileId,
          input,
        });
        navigate(`/app/clients/${client.id}`, { replace: true });
      } else {
        await updateClient.mutateAsync(input);
        navigate(`/app/clients/${id}`, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save the client.");
    }
  }

  const backHref = mode === "edit" && id ? `/app/clients/${id}` : "/app/clients";

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Link
        to={backHref}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <h1 className="text-2xl font-bold">
        {mode === "new" ? "New Client" : "Edit Client"}
      </h1>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="displayName">Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Jane Doe"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="companyName">Company (optional)</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Oak Street Cafe"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anything worth remembering about this customer…"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving} className="flex-1">
                {saving && <Spinner className="h-5 w-5" />}
                {mode === "new" ? "Create Client" : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to={backHref}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
