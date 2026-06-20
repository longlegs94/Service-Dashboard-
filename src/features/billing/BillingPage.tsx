import { Link } from "react-router-dom";
import { FileText, ReceiptText, Wallet } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useInvoices, useQuotes } from "@/features/billing/hooks";
import { formatCents } from "@/utils/money";

export function BillingPage() {
  const { data: invoices } = useInvoices();
  const { data: quotes } = useQuotes();

  const openInvoices = (invoices ?? []).filter((i) =>
    ["sent", "partially_paid", "overdue"].includes(i.status),
  );
  const receivableCents = openInvoices.reduce(
    (sum, i) => sum + i.balance_due_cents,
    0,
  );

  const cards = [
    {
      to: "/app/billing/invoices",
      icon: ReceiptText,
      title: "Invoices",
      description: "Create, send, and collect on invoices.",
      stat: invoices ? `${invoices.length} total` : undefined,
    },
    {
      to: "/app/billing/quotes",
      icon: FileText,
      title: "Quotes",
      description: "Draft estimates and convert them to invoices.",
      stat: quotes ? `${quotes.length} total` : undefined,
    },
    {
      to: "/app/billing/receivables",
      icon: Wallet,
      title: "Receivables",
      description: "Outstanding balances awaiting payment.",
      stat: invoices
        ? `${formatCents(receivableCents)} across ${openInvoices.length}`
        : undefined,
    },
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Billing</h1>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.to} to={c.to} className="block">
            <Card className="h-full transition-colors hover:bg-accent">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <c.icon className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>{c.title}</CardTitle>
                </div>
                <CardDescription>{c.description}</CardDescription>
              </CardHeader>
              {c.stat && (
                <CardContent className="text-sm font-medium text-muted-foreground">
                  {c.stat}
                </CardContent>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
