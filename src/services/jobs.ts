import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database.types";
import type { JobStatus } from "@/features/jobs/status";
import { findOrCreateClient } from "@/services/clients";

export type JobRow = Database["public"]["Tables"]["jobs"]["Row"];

/** A job with the linked client's name/phone joined in (for list/detail views). */
export interface JobWithClient extends JobRow {
  client: { id: string; display_name: string; phone: string | null } | null;
}

const JOB_SELECT =
  "*, client:clients(id, display_name, phone)";

/** Lists all non-deleted jobs for the org (RLS scopes to the caller's org). */
export async function listJobs(): Promise<JobWithClient[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select(JOB_SELECT)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as JobWithClient[];
}

export async function getJob(id: string): Promise<JobWithClient> {
  const { data, error } = await supabase
    .from("jobs")
    .select(JOB_SELECT)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as unknown as JobWithClient;
}

export interface CreateTicketInput {
  orgId: string;
  createdBy: string;
  customerName: string;
  customerPhone?: string | null;
  title: string;
  description?: string | null;
  status: JobStatus;
}

/**
 * Creates a ticket from the quick-entry form: finds/creates the customer, then
 * inserts the job linked to them.
 */
export async function createTicket(input: CreateTicketInput): Promise<JobRow> {
  const clientId = await findOrCreateClient({
    orgId: input.orgId,
    createdBy: input.createdBy,
    name: input.customerName,
    phone: input.customerPhone,
  });

  const { data, error } = await supabase
    .from("jobs")
    .insert({
      org_id: input.orgId,
      created_by: input.createdBy,
      client_id: clientId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      status: input.status,
      ...statusTimestamps(input.status),
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export interface UpdateJobInput {
  title?: string;
  description?: string | null;
  status?: JobStatus;
}

export async function updateJob(
  id: string,
  patch: UpdateJobInput,
): Promise<JobRow> {
  const { data, error } = await supabase
    .from("jobs")
    .update({
      ...patch,
      ...(patch.status ? statusTimestamps(patch.status) : {}),
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateJobStatus(
  id: string,
  status: JobStatus,
): Promise<JobRow> {
  return updateJob(id, { status });
}

/** Soft delete — keeps the row for history, hides it from lists. */
export async function deleteJob(id: string): Promise<void> {
  const { error } = await supabase
    .from("jobs")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

/** Stamp completed_at / paid_at as a job advances, so history is accurate. */
function statusTimestamps(status: JobStatus) {
  const now = new Date().toISOString();
  const patch: Record<string, string | null> = {};
  if (status === "paid") {
    patch.paid_at = now;
    patch.completed_at = now;
  } else if (status === "needs_invoice" || status === "invoice_sent") {
    patch.completed_at = now;
  }
  return patch;
}
