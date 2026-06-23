import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCents } from "@/utils/money";
import type { ReceivablesMetrics } from "../useDashboardData";

export function ReceivablesCard({
  receivables,
  currency,
}: {
  receivables: ReceivablesMetrics;
  currency: string;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Receivables</CardTitle>
        <Link
          to="/app/billing/receivables"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">
          {formatCents(receivables.totalOutstandingCents, currency)}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          outstanding from {receivables.owingClientsCount}{" "}
          {receivables.owingClientsCount === 1 ? "client" : "clients"}
        </p>

        {receivables.topClients.length > 0 ? (
          <ul className="mt-4 space-y-1 border-t pt-3">
            {receivables.topClients.map((client) => (
              <li
                key={client.name}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="truncate text-muted-foreground">
                  {client.name}
                </span>
                <span className="font-medium">
                  {formatCents(client.balanceCents, currency)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 border-t pt-3 text-sm text-muted-foreground">
            No outstanding balances. Nicely done.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
