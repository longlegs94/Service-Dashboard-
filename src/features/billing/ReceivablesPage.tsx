import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { useInvoices } from "@/features/billing/hooks";
import {
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_STYLES,
} from "@/features/billing/status";
import { formatCents } from "@/utils/money";
import { cn } from "@/lib/utils";

const OPEN_STATUSES = ["sent", "partially_paid", "overdue"] as const;

export function ReceivablesPage() {
  const { data: invoices, isLoading } = useInvoices();
  const [overdueOnly, setOverdueOnly] = useState(false);

  const now = Date.now();

  const open = useMemo(
    () =>
      (invoices ?? []).filter((i) =>
        (OPEN_STATUSES as readonly string[]).includes(i.status),
      ),
    [invoices],
  );

  const filtered = useMemo(() => {
    if (!overdueOnly) return open;
    return open.filter(
      (i) =>
        i.status === "overdue" ||
        (i.due_at != null && new Date(i.due_at).getTime() < now),
    );
  }, [open, overdueOnly, now]);

  const totalCents = filtered.reduce((s, i) => s + i.balance_due_cents, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Receivables</h1>
        <button
          onClick={() => setOverdueOnly((v) => !v)}
          className={cn(
            "whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
            overdueOnly
              ? "border-primary bg-primary text-primary-foreground"
              : "bg-background hover:bg-accent",
          )}
        >
          Overdue only
        </button>
      </div>

      <Card>
        <CardContent className="flex items-center justify-between py-4">
          <span className="text-sm text-muted-foreground">
            Outstanding {overdueOnly ? "(overdue)" : ""}
          </span>
          <span className="text-lg font-semibold tabular-nums">
            {formatCents(totalCents)}
          </span>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-7 w-7 text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Nothing outstanding. Nice.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((inv) => {
            const overdue =
              inv.status === "overdue" ||
              (inv.due_at != null && new Date(inv.due_at).getTime() < now);
            return (
              <Link key={inv.id} to={`/app/billing/invoices/${inv.id}`}>
                <Card className="transition-colors hover:bg-accent">
                  <CardContent className="flex items-center justify-between gap-3 py-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {inv.client?.display_name ?? "No client"}
                        </span>
                        <Badge
                          className={cn(INVOICE_STATUS_STYLES[inv.status])}
                        >
                          {INVOICE_STATUS_LABELS[inv.status]}
                        </Badge>
                      </div>
                      <p className="truncate text-sm text-muted-foreground">
                        {inv.job?.title ? `${inv.job.title} · ` : ""}
                        {inv.due_at ? (
                          <span className={cn(overdue && "text-destructive")}>
                            Due {new Date(inv.due_at).toLocaleDateString()}
                          </span>
                        ) : (
                          "No due date"
                        )}
                      </p>
                    </div>
                    <p className="shrink-0 font-semibold tabular-nums">
                      {formatCents(inv.balance_due_cents, inv.currency)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
