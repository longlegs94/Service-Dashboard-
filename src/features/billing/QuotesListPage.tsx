import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { useQuotes } from "@/features/billing/hooks";
import {
  QUOTE_STATUS_LABELS,
  QUOTE_STATUS_STYLES,
} from "@/features/billing/status";
import { formatCents } from "@/utils/money";
import { cn } from "@/lib/utils";

export function QuotesListPage() {
  const { data: quotes, isLoading } = useQuotes();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Quotes</h1>
        <Button asChild>
          <Link to="/app/billing/quotes/new">
            <Plus className="h-5 w-5" />
            New Quote
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-7 w-7 text-muted-foreground" />
        </div>
      ) : !quotes || quotes.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No quotes yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {quotes.map((q) => (
            <Link key={q.id} to={`/app/billing/quotes/${q.id}`}>
              <Card className="transition-colors hover:bg-accent">
                <CardContent className="flex items-center justify-between gap-3 py-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {q.quote_number ?? `Quote ${q.id.slice(0, 8)}`}
                      </span>
                      <Badge className={cn(QUOTE_STATUS_STYLES[q.status])}>
                        {QUOTE_STATUS_LABELS[q.status]}
                      </Badge>
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      {q.client?.display_name ?? "No client"}
                      {q.job?.title ? ` · ${q.job.title}` : ""}
                    </p>
                  </div>
                  <p className="shrink-0 font-semibold tabular-nums">
                    {formatCents(q.total_cents, q.currency)}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
