import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRightLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FullPageSpinner, Spinner } from "@/components/ui/spinner";
import { useOrg } from "@/features/org/useOrg";
import {
  useConvertQuoteToInvoice,
  useQuote,
} from "@/features/billing/hooks";
import {
  QUOTE_STATUS_LABELS,
  QUOTE_STATUS_STYLES,
} from "@/features/billing/status";
import { formatCents } from "@/utils/money";
import { cn } from "@/lib/utils";

export function QuoteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: org } = useOrg();
  const { data: quote, isLoading } = useQuote(id);
  const convert = useConvertQuoteToInvoice();
  const [error, setError] = useState<string | null>(null);

  if (isLoading) return <FullPageSpinner />;
  if (!quote) {
    return (
      <div className="mx-auto max-w-xl py-12 text-center text-muted-foreground">
        Quote not found.
      </div>
    );
  }

  const currency = quote.currency;
  const alreadyConverted = quote.status === "converted";

  async function handleConvert() {
    if (!org || !quote) return;
    setError(null);
    try {
      const invoice = await convert.mutateAsync({
        quoteId: quote.id,
        orgId: org.orgId,
        createdBy: org.profileId,
      });
      navigate(`/app/billing/invoices/${invoice.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't convert the quote.",
      );
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link
        to="/app/billing/quotes"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Quotes
      </Link>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            {quote.quote_number ?? `Quote ${quote.id.slice(0, 8)}`}
          </h1>
          <p className="text-sm text-muted-foreground">
            {quote.client?.display_name ?? "No client"}
            {quote.job?.title ? ` · ${quote.job.title}` : ""}
          </p>
        </div>
        <Badge className={cn("mt-1", QUOTE_STATUS_STYLES[quote.status])}>
          {QUOTE_STATUS_LABELS[quote.status]}
        </Badge>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            {quote.items.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-3 border-b pb-2 text-sm last:border-0"
              >
                <div className="min-w-0">
                  <p className="font-medium">{item.description}</p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {item.quantity} ×{" "}
                    {formatCents(item.unit_price_cents, currency)}
                    {item.taxable ? "" : " · non-taxable"}
                  </p>
                </div>
                <span className="shrink-0 tabular-nums">
                  {formatCents(
                    Math.round(item.unit_price_cents * item.quantity),
                    currency,
                  )}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-1 text-sm tabular-nums">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCents(quote.subtotal_cents, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>{formatCents(quote.tax_cents, currency)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatCents(quote.total_cents, currency)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" asChild>
          <Link to={`/app/billing/quotes/${quote.id}/edit`}>
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        </Button>
        <Button
          onClick={handleConvert}
          disabled={convert.isPending || alreadyConverted}
        >
          {convert.isPending ? (
            <Spinner className="h-5 w-5" />
          ) : (
            <ArrowRightLeft className="h-4 w-4" />
          )}
          {alreadyConverted ? "Converted" : "Convert to invoice"}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
