import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner, FullPageSpinner } from "@/components/ui/spinner";
import {
  useCreateTicket,
  useJob,
  useUpdateJob,
} from "@/features/jobs/hooks";
import { useOrg } from "@/features/org/useOrg";
import { JOB_STATUSES, type JobStatus } from "@/features/jobs/status";

/** Shared form for creating a new ticket and editing an existing one. */
export function JobFormPage({ mode }: { mode: "new" | "edit" }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: org } = useOrg();

  const existing = useJob(mode === "edit" ? id : undefined);
  const createTicket = useCreateTicket();
  const updateJob = useUpdateJob(id ?? "");

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<JobStatus>("new");
  const [error, setError] = useState<string | null>(null);

  // Hydrate the form when editing.
  useEffect(() => {
    if (mode === "edit" && existing.data) {
      const j = existing.data;
      setCustomerName(j.client?.display_name ?? "");
      setCustomerPhone(j.client?.phone ?? "");
      setTitle(j.title);
      setDescription(j.description ?? "");
      setStatus(j.status as JobStatus);
    }
  }, [mode, existing.data]);

  if (mode === "edit" && existing.isLoading) return <FullPageSpinner />;

  const saving = createTicket.isPending || updateJob.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (mode === "new") {
        if (!org) throw new Error("Still loading your workspace — try again.");
        const job = await createTicket.mutateAsync({
          orgId: org.orgId,
          createdBy: org.profileId,
          customerName,
          customerPhone,
          title,
          description,
          status,
        });
        navigate(`/app/jobs/${job.id}`, { replace: true });
      } else {
        await updateJob.mutateAsync({ title, description, status });
        navigate(`/app/jobs/${id}`, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save the job.");
    }
  }

  const backHref = mode === "edit" && id ? `/app/jobs/${id}` : "/app/jobs";

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Link
        to={backHref}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <h1 className="text-2xl font-bold">
        {mode === "new" ? "New Job" : "Edit Job"}
      </h1>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="customerName">Customer name</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Jane from Oak St."
                required
                disabled={mode === "edit"}
              />
              {mode === "edit" && (
                <p className="text-xs text-muted-foreground">
                  Customer details are managed on the Clients page.
                </p>
              )}
            </div>

            {mode === "new" && (
              <div className="space-y-1.5">
                <Label htmlFor="customerPhone">Phone (optional)</Label>
                <Input
                  id="customerPhone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  type="tel"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="title">Job</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Fridge not cooling"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Details (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Anything from the text/WhatsApp: model, symptoms, address…"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as JobStatus)}
              >
                {JOB_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label} — {s.description}
                  </option>
                ))}
              </Select>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving} className="flex-1">
                {saving && <Spinner className="h-5 w-5" />}
                {mode === "new" ? "Create Job" : "Save Changes"}
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
