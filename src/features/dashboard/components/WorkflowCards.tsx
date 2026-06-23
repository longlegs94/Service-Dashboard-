import { Link } from "react-router-dom";
import {
  Sparkles,
  FileText,
  Briefcase,
  Receipt,
  type LucideIcon,
} from "lucide-react";
import { formatCents } from "@/utils/money";
import type { WorkflowMetrics } from "../useDashboardData";

interface WorkflowCardProps {
  to: string;
  borderClass: string;
  iconClass: string;
  icon: LucideIcon;
  label: string;
  count: number;
  money?: string;
  subs: { label: string; value: number }[];
}

function WorkflowCard({
  to,
  borderClass,
  iconClass,
  icon: Icon,
  label,
  count,
  money,
  subs,
}: WorkflowCardProps) {
  return (
    <Link
      to={to}
      className={`flex flex-col rounded-lg border border-t-4 bg-card p-4 shadow-sm transition-shadow hover:shadow-md ${borderClass}`}
    >
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${iconClass}`} />
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-bold">{count}</span>
        {money && (
          <span className="text-sm font-medium text-muted-foreground">
            {money}
          </span>
        )}
      </div>

      <div className="mt-3 space-y-1 border-t pt-2">
        {subs.map((sub) => (
          <div
            key={sub.label}
            className="flex items-center justify-between text-xs text-muted-foreground"
          >
            <span>{sub.label}</span>
            <span className="font-medium text-foreground">{sub.value}</span>
          </div>
        ))}
      </div>
    </Link>
  );
}

export function WorkflowCards({
  workflow,
  currency,
}: {
  workflow: WorkflowMetrics;
  currency: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <WorkflowCard
        to="/app/jobs?bucket=pending"
        borderClass="border-orange-400"
        iconClass="text-orange-500"
        icon={Sparkles}
        label="New"
        count={workflow.newCount}
        subs={[
          { label: "Scheduled", value: workflow.scheduledCount },
          { label: "In progress", value: workflow.inProgressCount },
        ]}
      />

      <WorkflowCard
        to="/app/billing/quotes"
        borderClass="border-rose-400"
        iconClass="text-rose-500"
        icon={FileText}
        label="Quotes"
        count={workflow.openQuotesCount}
        money={formatCents(workflow.openQuotesTotalCents, currency)}
        subs={[
          { label: "Approved", value: workflow.approvedQuotesCount },
          { label: "Draft", value: workflow.draftQuotesCount },
        ]}
      />

      <WorkflowCard
        to="/app/jobs"
        borderClass="border-emerald-500"
        iconClass="text-emerald-600"
        icon={Briefcase}
        label="Jobs"
        count={workflow.activeJobsCount}
        subs={[
          { label: "Requires invoicing", value: workflow.needsInvoiceCount },
          { label: "Waiting on parts", value: workflow.waitingPartsCount },
        ]}
      />

      <WorkflowCard
        to="/app/billing/receivables"
        borderClass="border-blue-400"
        iconClass="text-blue-500"
        icon={Receipt}
        label="Invoices"
        count={workflow.awaitingPaymentCount}
        money={formatCents(workflow.awaitingPaymentBalanceCents, currency)}
        subs={[
          { label: "Draft", value: workflow.draftInvoicesCount },
          { label: "Past due", value: workflow.pastDueCount },
        ]}
      />
    </div>
  );
}
