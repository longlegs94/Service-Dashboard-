import { useMemo } from "react";
import { useJobs } from "@/features/jobs/hooks";
import { useInvoices, useQuotes } from "@/features/billing/hooks";
import { useVisits } from "@/features/calendar/hooks";
import { OPEN_STATUSES, type JobStatus } from "@/features/jobs/status";
import type { JobWithClient } from "@/services/jobs";
import type { InvoiceWithRefs } from "@/services/invoices";
import type { QuoteWithRefs } from "@/services/quotes";
import type { VisitWithJob } from "@/services/visits";

/** Invoice statuses that count as "awaiting payment" / outstanding. */
const OPEN_INVOICE_STATUSES = ["sent", "partially_paid", "overdue"] as const;

export interface WorkflowMetrics {
  /** status === 'new' */
  newCount: number;
  scheduledCount: number;
  inProgressCount: number;
  /** open quotes: draft + sent */
  openQuotesCount: number;
  openQuotesTotalCents: number;
  approvedQuotesCount: number;
  draftQuotesCount: number;
  /** active jobs: scheduled + in_progress + waiting_parts */
  activeJobsCount: number;
  needsInvoiceCount: number;
  waitingPartsCount: number;
  /** invoices awaiting payment: sent + partially_paid + overdue */
  awaitingPaymentCount: number;
  awaitingPaymentBalanceCents: number;
  draftInvoicesCount: number;
  pastDueCount: number;
}

export interface TodoMetrics {
  completedToInvoice: number;
  overdueInvoices: number;
  waitingOnParts: number;
  unscheduledJobs: number;
}

export interface ReceivableClient {
  name: string;
  balanceCents: number;
}

export interface ReceivablesMetrics {
  totalOutstandingCents: number;
  owingClientsCount: number;
  topClients: ReceivableClient[];
}

export interface UpcomingVisit {
  id: string;
  jobId: string | null;
  title: string;
  clientName: string | null;
  startsAt: string;
}

export interface DashboardData {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  workflow: WorkflowMetrics;
  todos: TodoMetrics;
  receivables: ReceivablesMetrics;
  upcoming: UpcomingVisit[];
}

function countByStatus(jobs: JobWithClient[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const job of jobs) {
    counts[job.status] = (counts[job.status] ?? 0) + 1;
  }
  return counts;
}

/** True when an invoice is past due (explicitly overdue, or has a due date in the past). */
function isPastDue(invoice: InvoiceWithRefs, now: number): boolean {
  if (invoice.status === "overdue") return true;
  if (!invoice.due_at) return false;
  return new Date(invoice.due_at).getTime() < now;
}

function isOpenInvoice(invoice: InvoiceWithRefs): boolean {
  return (OPEN_INVOICE_STATUSES as readonly string[]).includes(invoice.status);
}

/**
 * Aggregates jobs, invoices, quotes and visits into the dashboard's command-center
 * metrics. Reads only the existing feature hooks — no new services or queries.
 */
export function useDashboardData(): DashboardData {
  const jobsQuery = useJobs();
  const invoicesQuery = useInvoices();
  const quotesQuery = useQuotes();
  const visitsQuery = useVisits();

  const jobs = useMemo(() => jobsQuery.data ?? [], [jobsQuery.data]);
  const invoices = useMemo(
    () => invoicesQuery.data ?? [],
    [invoicesQuery.data],
  );
  const quotes = useMemo(() => quotesQuery.data ?? [], [quotesQuery.data]);
  const visits = useMemo(() => visitsQuery.data ?? [], [visitsQuery.data]);

  const workflow = useMemo<WorkflowMetrics>(() => {
    const c = countByStatus(jobs);

    const openQuotes = quotes.filter(
      (q: QuoteWithRefs) => q.status === "draft" || q.status === "sent",
    );
    const now = Date.now();
    const awaitingPayment = invoices.filter(isOpenInvoice);

    return {
      newCount: c.new ?? 0,
      scheduledCount: c.scheduled ?? 0,
      inProgressCount: c.in_progress ?? 0,
      openQuotesCount: openQuotes.length,
      openQuotesTotalCents: openQuotes.reduce(
        (sum, q) => sum + q.total_cents,
        0,
      ),
      approvedQuotesCount: quotes.filter((q) => q.status === "accepted").length,
      draftQuotesCount: quotes.filter((q) => q.status === "draft").length,
      activeJobsCount:
        (c.scheduled ?? 0) + (c.in_progress ?? 0) + (c.waiting_parts ?? 0),
      needsInvoiceCount: c.needs_invoice ?? 0,
      waitingPartsCount: c.waiting_parts ?? 0,
      awaitingPaymentCount: awaitingPayment.length,
      awaitingPaymentBalanceCents: awaitingPayment.reduce(
        (sum, inv) => sum + inv.balance_due_cents,
        0,
      ),
      draftInvoicesCount: invoices.filter((inv) => inv.status === "draft")
        .length,
      pastDueCount: invoices.filter((inv) => isPastDue(inv, now)).length,
    };
  }, [jobs, invoices, quotes]);

  const todos = useMemo<TodoMetrics>(() => {
    const now = Date.now();
    const c = countByStatus(jobs);

    // Job ids referenced by any visit — used to find unscheduled open jobs.
    const scheduledJobIds = new Set(
      visits
        .map((v: VisitWithJob) => v.job?.id)
        .filter((id): id is string => Boolean(id)),
    );

    const unscheduledJobs = jobs.filter(
      (j) =>
        OPEN_STATUSES.includes(j.status as JobStatus) &&
        !scheduledJobIds.has(j.id),
    ).length;

    return {
      completedToInvoice: c.needs_invoice ?? 0,
      overdueInvoices: invoices.filter((inv) => isPastDue(inv, now)).length,
      waitingOnParts: c.waiting_parts ?? 0,
      unscheduledJobs,
    };
  }, [jobs, invoices, visits]);

  const receivables = useMemo<ReceivablesMetrics>(() => {
    const openInvoices = invoices.filter(isOpenInvoice);

    const totalOutstandingCents = openInvoices.reduce(
      (sum, inv) => sum + inv.balance_due_cents,
      0,
    );

    // Group outstanding balance by client display name.
    const byClient = new Map<string, number>();
    for (const inv of openInvoices) {
      const name = inv.client?.display_name ?? "Unassigned";
      byClient.set(name, (byClient.get(name) ?? 0) + inv.balance_due_cents);
    }

    const topClients = [...byClient.entries()]
      .map(([name, balanceCents]) => ({ name, balanceCents }))
      .sort((a, b) => b.balanceCents - a.balanceCents)
      .slice(0, 5);

    return {
      totalOutstandingCents,
      owingClientsCount: byClient.size,
      topClients,
    };
  }, [invoices]);

  const upcoming = useMemo<UpcomingVisit[]>(() => {
    const now = Date.now();
    return visits
      .filter(
        (v): v is typeof v & { starts_at: string } =>
          Boolean(v.starts_at) && new Date(v.starts_at as string).getTime() >= now,
      )
      .sort(
        (a, b) =>
          new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
      )
      .slice(0, 5)
      .map((v) => ({
        id: v.id,
        jobId: v.job?.id ?? null,
        title: v.job?.title ?? "Untitled job",
        clientName: v.job?.client?.display_name ?? null,
        startsAt: v.starts_at,
      }));
  }, [visits]);

  const queries = [jobsQuery, invoicesQuery, quotesQuery, visitsQuery];

  return {
    isLoading: queries.some((q) => q.isLoading),
    isError: queries.some((q) => q.isError),
    error: (queries.find((q) => q.error)?.error as Error) ?? null,
    workflow,
    todos,
    receivables,
    upcoming,
  };
}
