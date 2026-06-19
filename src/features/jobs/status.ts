import type { Database } from "@/types/database.types";

export type JobStatus = Database["public"]["Enums"]["job_status"];

export interface StatusConfig {
  value: JobStatus;
  label: string;
  /** Short hint shown in menus. */
  description: string;
  /** Tailwind classes for the status badge. */
  badgeClass: string;
  /** Dashboard bucket this status rolls up into. */
  bucket: DashboardBucket;
}

export type DashboardBucket =
  | "pending"
  | "parts"
  | "to_invoice"
  | "awaiting_payment"
  | "paid"
  | "cancelled";

/**
 * The job pipeline, in order. Wording matches how a field operator thinks about
 * a ticket coming in by text/WhatsApp: it starts pending, gets worked, maybe
 * waits on parts, then gets invoiced and paid.
 */
export const JOB_STATUSES: StatusConfig[] = [
  {
    value: "new",
    label: "Pending",
    description: "New ticket, not started yet",
    badgeClass: "bg-slate-100 text-slate-700",
    bucket: "pending",
  },
  {
    value: "scheduled",
    label: "Scheduled",
    description: "Booked in for a visit",
    badgeClass: "bg-sky-100 text-sky-700",
    bucket: "pending",
  },
  {
    value: "in_progress",
    label: "In Progress",
    description: "Work underway",
    badgeClass: "bg-amber-100 text-amber-800",
    bucket: "pending",
  },
  {
    value: "waiting_parts",
    label: "Waiting on Parts",
    description: "Need to order / waiting for parts",
    badgeClass: "bg-orange-100 text-orange-800",
    bucket: "parts",
  },
  {
    value: "needs_invoice",
    label: "Completed",
    description: "Work done — needs invoicing",
    badgeClass: "bg-purple-100 text-purple-800",
    bucket: "to_invoice",
  },
  {
    value: "invoice_sent",
    label: "Invoiced",
    description: "Invoiced — awaiting payment",
    badgeClass: "bg-indigo-100 text-indigo-800",
    bucket: "awaiting_payment",
  },
  {
    value: "paid",
    label: "Paid",
    description: "Paid in full — done",
    badgeClass: "bg-green-100 text-green-800",
    bucket: "paid",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    description: "No longer going ahead",
    badgeClass: "bg-red-100 text-red-700",
    bucket: "cancelled",
  },
];

export const STATUS_BY_VALUE: Record<JobStatus, StatusConfig> = Object.fromEntries(
  JOB_STATUSES.map((s) => [s.value, s]),
) as Record<JobStatus, StatusConfig>;

export function getStatusConfig(value: JobStatus): StatusConfig {
  return STATUS_BY_VALUE[value] ?? JOB_STATUSES[0];
}

/** Dashboard buckets in display order, with the statuses each rolls up. */
export interface BucketConfig {
  key: DashboardBucket;
  label: string;
  /** What this bucket answers for the operator. */
  blurb: string;
  statuses: JobStatus[];
  cardClass: string;
}

export const DASHBOARD_BUCKETS: BucketConfig[] = [
  {
    key: "pending",
    label: "Pending",
    blurb: "Jobs to start or in progress",
    statuses: ["new", "scheduled", "in_progress"],
    cardClass: "border-amber-200 bg-amber-50",
  },
  {
    key: "parts",
    label: "Waiting on Parts",
    blurb: "Need parts ordered",
    statuses: ["waiting_parts"],
    cardClass: "border-orange-200 bg-orange-50",
  },
  {
    key: "to_invoice",
    label: "To Invoice",
    blurb: "Completed, needs invoicing",
    statuses: ["needs_invoice"],
    cardClass: "border-purple-200 bg-purple-50",
  },
  {
    key: "awaiting_payment",
    label: "Collect Payment",
    blurb: "Invoiced, awaiting payment",
    statuses: ["invoice_sent"],
    cardClass: "border-indigo-200 bg-indigo-50",
  },
  {
    key: "paid",
    label: "Paid",
    blurb: "Closed and paid",
    statuses: ["paid"],
    cardClass: "border-green-200 bg-green-50",
  },
];

/** Statuses considered "open" (still need attention) — excludes paid/cancelled. */
export const OPEN_STATUSES: JobStatus[] = [
  "new",
  "scheduled",
  "in_progress",
  "waiting_parts",
  "needs_invoice",
  "invoice_sent",
];
