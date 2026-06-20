import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Copy,
  CreditCard,
  ExternalLink,
  Link2,
  Pencil,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FullPageSpinner } from "@/components/ui/spinner";
import { useOrg } from "@/features/org/useOrg";
import {
  useCreateSquarePaymentLink,
  useInvoice,
  useRecordManualPayment,
  useSendInvoiceViaSquare,
} from "@/features/billing/hooks";
import {
  RecordPaymentModal,
  type RecordPaymentValues,
} from "@/features/billing/components/RecordPaymentModal";
import {
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_STYLES,
  PAYMENT_METHOD_LABELS,
} from "@/features/billing/status";
import { formatCents } from "@/utils/money";
import { cn } from "@/lib/utils";

export function InvoiceDetailPage() {
  const { id } = useParams();
  const { data: org } = useOrg();
  const { data: invoice, isLoading } = useInvoice(id);
  const sendSquare = useSendInvoiceViaSquare(id ?? "");
  const paymentLink = useCreateSquarePaymentLink(id ?? "");
  const recordPayment = useRecordManualPayment(id ?? "");

  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  if (isLoading) return <FullPageSpinner />;
  if (!invoice) {
    return (
      <div className="mx-auto max-w-xl py-12 text-center text-muted-foreground">
        Invoice not found.
      </div>
    );
  }

  const currency = invoice.currency;
  const isPaid = invoice.status === "paid";

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard unavailable — ignore */
    }
  }

  async function handleSend() {
    setActionError(null);
    try {
      await sendSquare.mutateAsync();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Couldn't send via Square.",
      );
    }
  }

  async function handlePaymentLink() {
    setActionError(null);
    try {
      await paymentLink.mutateAsync();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Couldn't create payment link.",
      );
    }
  }

  async function handleRecordPayment(values: RecordPaymentValues) {
    if (!org || !invoice) return;
    setActionError(null);
    try {
      await recordPayment.mutateAsync({
        orgId: org.orgId,
        createdBy: org.profileId,
        invoiceId: invoice.id,
        jobId: invoice.job_id,
        clientId: invoice.client_id,
        method: values.method,
        amountCents: values.amountCents,
        paidAt: values.paidAt,
        notes: values.notes,
        currency: invoice.currency,
      });
      setModalOpen(false);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Couldn't record payment.",
      );
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link
        to="/app/billing/invoices"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Invoices
      </Link>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            {invoice.invoice_number ?? `Invoice ${invoice.id.slice(0, 8)}`}
          </h1>
          <p className="text-sm text-muted-foreground">
            {invoice.client?.display_name ?? "No client"}
            {invoice.job?.title ? ` · ${invoice.job.title}` : ""}
          </p>
        </div>
        <Badge className={cn("mt-1", INVOICE_STATUS_STYLES[invoice.status])}>
          {INVOICE_STATUS_LABELS[invoice.status]}
        </Badge>
      </div>

      {/* Line items + totals */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            {invoice.items.map((item) => (
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
            <Row label="Subtotal" value={formatCents(invoice.subtotal_cents, currency)} />
            <Row label="Tax" value={formatCents(invoice.tax_cents, currency)} />
            <Row
              label="Total"
              value={formatCents(invoice.total_cents, currency)}
              bold
            />
            <Row
              label="Paid"
              value={formatCents(invoice.amount_paid_cents, currency)}
            />
            <Row
              label="Balance due"
              value={formatCents(invoice.balance_due_cents, currency)}
              bold
            />
          </div>
        </CardContent>
      </Card>

      {/* Square public URL */}
      {invoice.square_public_url && (
        <Card>
          <CardContent className="flex items-center justify-between gap-3 py-4">
            <a
              href={invoice.square_public_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 truncate text-sm text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4 shrink-0" />
              <span className="truncate">{invoice.square_public_url}</span>
            </a>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => copy(invoice.square_public_url!, "invoice")}
            >
              {copied === "invoice" ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              Copy
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" asChild>
          <Link to={`/app/billing/invoices/${invoice.id}/edit`}>
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        </Button>
        <Button
          onClick={handleSend}
          disabled={sendSquare.isPending}
        >
          <Send className="h-4 w-4" />
          {invoice.square_invoice_id ? "Resend with Square" : "Send with Square"}
        </Button>
        <Button
          variant="outline"
          onClick={handlePaymentLink}
          disabled={paymentLink.isPending}
        >
          <Link2 className="h-4 w-4" /> Create payment link
        </Button>
        {!isPaid && (
          <Button variant="outline" onClick={() => setModalOpen(true)}>
            <CreditCard className="h-4 w-4" /> Record payment
          </Button>
        )}
      </div>

      {actionError && <p className="text-sm text-destructive">{actionError}</p>}

      {/* Payments list */}
      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {invoice.payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments yet.</p>
          ) : (
            <div className="space-y-2">
              {invoice.payments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 border-b pb-2 text-sm last:border-0"
                >
                  <div>
                    <p className="font-medium">
                      {PAYMENT_METHOD_LABELS[p.method] ?? p.method}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(p.paid_at).toLocaleDateString()}
                      {p.notes ? ` · ${p.notes}` : ""}
                    </p>
                  </div>
                  <span className="tabular-nums">
                    {formatCents(p.amount_cents, p.currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <RecordPaymentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleRecordPayment}
        submitting={recordPayment.isPending}
        balanceDueCents={invoice.balance_due_cents}
        currency={currency}
      />
    </div>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div
      className={cn("flex justify-between", bold && "font-semibold")}
    >
      <span className={cn(!bold && "text-muted-foreground")}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
