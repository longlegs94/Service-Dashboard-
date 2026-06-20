import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner, FullPageSpinner } from "@/components/ui/spinner";
import { useOrg } from "@/features/org/useOrg";
import { useClients } from "@/features/clients/hooks";
import { useJobs } from "@/features/jobs/hooks";
import {
  useCreateQuote,
  useQuote,
  useUpdateQuote,
} from "@/features/billing/hooks";
import {
  LineItemsEditor,
  draftItemsToInput,
  emptyDraftItem,
  type DraftItem,
} from "@/features/billing/components/LineItemsEditor";
import { computeTotals } from "@/services/invoices";
import { centsToDollars, formatCents } from "@/utils/money";

export function QuoteFormPage({ mode }: { mode: "new" | "edit" }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: org } = useOrg();
  const { data: clients } = useClients();
  const { data: jobs } = useJobs();

  const existing = useQuote(mode === "edit" ? id : undefined);
  const createQuote = useCreateQuote();
  const updateQuote = useUpdateQuote(id ?? "");

  const [clientId, setClientId] = useState("");
  const [jobId, setJobId] = useState("");
  const [taxRate, setTaxRate] = useState("0");
  const [expiresAt, setExpiresAt] = useState("");
  const [items, setItems] = useState<DraftItem[]>([emptyDraftItem()]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "edit" && existing.data) {
      const q = existing.data;
      setClientId(q.client_id ?? "");
      setJobId(q.job_id ?? "");
      setExpiresAt(q.expires_at ? q.expires_at.slice(0, 10) : "");
      const taxableBase = q.items
        .filter((i) => i.taxable)
        .reduce((s, i) => s + Math.round(i.unit_price_cents * i.quantity), 0);
      const rate = taxableBase > 0 ? (q.tax_cents / taxableBase) * 100 : 0;
      setTaxRate(String(Math.round(rate * 100) / 100));
      setItems(
        q.items.length === 0
          ? [emptyDraftItem()]
          : q.items.map((i) => ({
              description: i.description,
              quantity: String(i.quantity),
              unitPriceDollars: String(centsToDollars(i.unit_price_cents)),
              taxable: i.taxable,
            })),
      );
    }
  }, [mode, existing.data]);

  const currency = org?.currency ?? "CAD";
  const taxRatePercent = Number.parseFloat(taxRate) || 0;

  const totals = useMemo(
    () => computeTotals(draftItemsToInput(items), taxRatePercent),
    [items, taxRatePercent],
  );

  if (mode === "edit" && existing.isLoading) return <FullPageSpinner />;

  const saving = createQuote.isPending || updateQuote.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const lineItems = draftItemsToInput(items);
    if (lineItems.length === 0) {
      setError("Add at least one line item.");
      return;
    }
    try {
      const expiresIso = expiresAt ? new Date(expiresAt).toISOString() : null;
      if (mode === "new") {
        if (!org) throw new Error("Still loading your workspace — try again.");
        const q = await createQuote.mutateAsync({
          orgId: org.orgId,
          clientId: clientId || null,
          jobId: jobId || null,
          items: lineItems,
          taxRatePercent,
          expiresAt: expiresIso,
          currency: org.currency,
        });
        navigate(`/app/billing/quotes/${q.id}`, { replace: true });
      } else {
        await updateQuote.mutateAsync({
          clientId: clientId || null,
          jobId: jobId || null,
          items: lineItems,
          taxRatePercent,
          expiresAt: expiresIso,
        });
        navigate(`/app/billing/quotes/${id}`, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save the quote.");
    }
  }

  const backHref =
    mode === "edit" && id ? `/app/billing/quotes/${id}` : "/app/billing/quotes";

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Link
        to={backHref}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <h1 className="text-2xl font-bold">
        {mode === "new" ? "New Quote" : "Edit Quote"}
      </h1>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="client">Client</Label>
              <Select
                id="client"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
              >
                <option value="">No client</option>
                {(clients ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.display_name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="job">Job (optional)</Label>
              <Select
                id="job"
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
              >
                <option value="">No job</option>
                {(jobs ?? []).map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title}
                  </option>
                ))}
              </Select>
            </div>

            <LineItemsEditor
              items={items}
              onChange={setItems}
              currency={currency}
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="taxRate">Tax rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="expiresAt">Expires (optional)</Label>
                <Input
                  id="expiresAt"
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1 rounded-md bg-muted/50 p-3 text-sm tabular-nums">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCents(totals.subtotalCents, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCents(totals.taxCents, currency)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatCents(totals.totalCents, currency)}</span>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving} className="flex-1">
                {saving && <Spinner className="h-5 w-5" />}
                {mode === "new" ? "Create Quote" : "Save Changes"}
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
