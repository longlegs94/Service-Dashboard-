import { Briefcase, CalendarClock, DollarSign, FileWarning } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSession } from "@/features/auth/useAuth";

/**
 * Dashboard shell. The stat cards show placeholder values in Phase 0 — they are
 * wired to live data in Phase 1 (jobs) and Phase 3 (billing).
 */
export function DashboardPage() {
  const session = useSession();
  const name = session?.user?.user_metadata?.full_name ?? "there";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {name}</h1>
        <p className="text-muted-foreground">
          Here's an overview of your business.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Jobs Today"
          value="—"
          icon={<CalendarClock className="h-5 w-5" />}
        />
        <StatCard
          label="Open Jobs"
          value="—"
          icon={<Briefcase className="h-5 w-5" />}
        />
        <StatCard
          label="Outstanding Balance"
          value="—"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          label="Unpaid Invoices"
          value="—"
          icon={<FileWarning className="h-5 w-5" />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting started</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          This is the Phase 0 foundation. Clients, jobs, the pipeline board,
          scheduling, and billing arrive in the next phases.
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <span className="text-muted-foreground">{icon}</span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
