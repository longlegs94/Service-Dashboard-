import { Link } from "react-router-dom";
import {
  FileCheck2,
  AlertTriangle,
  PackageSearch,
  CalendarClock,
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TodoMetrics } from "../useDashboardData";

interface TodoRow {
  key: string;
  to: string;
  icon: LucideIcon;
  iconClass: string;
  text: string;
  count: number;
}

export function TodoCard({ todos }: { todos: TodoMetrics }) {
  const rows: TodoRow[] = [
    {
      key: "to-invoice",
      to: "/app/jobs?bucket=to_invoice",
      icon: FileCheck2,
      iconClass: "text-purple-500",
      text: `${todos.completedToInvoice} completed ${
        todos.completedToInvoice === 1 ? "job" : "jobs"
      } to invoice`,
      count: todos.completedToInvoice,
    },
    {
      key: "overdue",
      to: "/app/billing/receivables",
      icon: AlertTriangle,
      iconClass: "text-red-500",
      text: `${todos.overdueInvoices} overdue ${
        todos.overdueInvoices === 1 ? "invoice" : "invoices"
      }`,
      count: todos.overdueInvoices,
    },
    {
      key: "parts",
      to: "/app/jobs?bucket=parts",
      icon: PackageSearch,
      iconClass: "text-orange-500",
      text: `${todos.waitingOnParts} ${
        todos.waitingOnParts === 1 ? "job" : "jobs"
      } waiting on parts`,
      count: todos.waitingOnParts,
    },
    {
      key: "unscheduled",
      to: "/app/jobs",
      icon: CalendarClock,
      iconClass: "text-sky-500",
      text: `${todos.unscheduledJobs} unscheduled ${
        todos.unscheduledJobs === 1 ? "job" : "jobs"
      }`,
      count: todos.unscheduledJobs,
    },
  ];

  const active = rows.filter((row) => row.count > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>To do</CardTitle>
      </CardHeader>
      <CardContent>
        {active.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            You're all caught up 🎉
          </p>
        ) : (
          <ul className="space-y-1">
            {active.map((row) => {
              const Icon = row.icon;
              return (
                <li key={row.key}>
                  <Link
                    to={row.to}
                    className="flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-accent"
                  >
                    <Icon className={`h-5 w-5 shrink-0 ${row.iconClass}`} />
                    <span className="flex-1 text-sm font-medium">
                      {row.text}
                    </span>
                    <Badge className="bg-primary/10 text-primary">
                      {row.count}
                    </Badge>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
