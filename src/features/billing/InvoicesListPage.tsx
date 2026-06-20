import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export function InvoicesListPage() {
  const { data: invoices, isLoading } = useInvoices();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Button asChild>
          <Link to="/app/billing/invoices/new">
            <Plus className="h-5 w-5" />
            New Invoice
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-7 w-7 text-muted-foreground" />
        </div>
      ) : !invoices || invoices.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No invoices yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {invoices.map((inv) => (
            <Link key={inv.id} to={`/app/billing/invoices/${inv.id}`}>
              <Card className="transition-colors hover:bg-accent">
                <CardContent className="flex items-center justify-between gap-3 py-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {inv.invoice_number ?? `Invoice ${inv.id.slice(0, 8)}`}
                      </span>
                      <Badge
                        className={cn(INVOICE_STATUS_STYLES[inv.status])}
                      >
                        {INVOICE_STATUS_LABELS[inv.status]}
                      </Badge>
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      {inv.client?.display_name ?? "No client"}
                      {inv.job?.title ? ` · ${inv.job.title}` : ""}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-semibold tabular-nums">
                      {formatCents(inv.total_cents, inv.currency)}
                    </p>
                    {inv.balance_due_cents > 0 && (
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {formatCents(inv.balance_due_cents, inv.currency)} due
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
