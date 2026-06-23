import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FullPageSpinner } from "@/components/ui/spinner";
import { useOrg } from "@/features/org/useOrg";
import { useDashboardData } from "./useDashboardData";
import { WorkflowCards } from "./components/WorkflowCards";
import { TodoCard } from "./components/TodoCard";
import { ReceivablesCard } from "./components/ReceivablesCard";
import { UpcomingCard } from "./components/UpcomingCard";
import { formatHeaderDate, greeting } from "./components/format";

export function DashboardPage() {
  const { data: org } = useOrg();
  const { isLoading, isError, error, workflow, todos, receivables, upcoming } =
    useDashboardData();

  if (isLoading) {
    return <FullPageSpinner />;
  }

  const now = new Date();
  const firstName = (org?.fullName ?? "").split(" ")[0] || "there";
  const currency = org?.currency ?? "CAD";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Left column: header, workflow, to-do */}
      <div className="space-y-6 lg:col-span-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              {formatHeaderDate(now)}
            </p>
            <h1 className="text-2xl font-bold">
              {greeting(now)}, {firstName}
            </h1>
          </div>
          <Button asChild>
            <Link to="/app/jobs/new">
              <Plus className="h-5 w-5" />
              New Job
            </Link>
          </Button>
        </div>

        {isError && (
          <Card>
            <CardContent className="py-6 text-sm text-destructive">
              Couldn't load your dashboard: {error?.message}
            </CardContent>
          </Card>
        )}

        <WorkflowCards workflow={workflow} currency={currency} />

        <TodoCard todos={todos} />
      </div>

      {/* Right column: receivables, upcoming */}
      <div className="space-y-6">
        <ReceivablesCard receivables={receivables} currency={currency} />
        <UpcomingCard upcoming={upcoming} />
      </div>
    </div>
  );
}
