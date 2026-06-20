import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database.types";
import { OPEN_STATUSES } from "@/features/jobs/status";

export type VisitRow = Database["public"]["Tables"]["visits"]["Row"];
export type VisitStatus = Database["public"]["Enums"]["visit_status"];

/** A visit with its job (and the job's client name) joined in for the calendar. */
export interface VisitWithJob extends VisitRow {
  job: {
    id: string;
    title: string;
    client: { display_name: string } | null;
  } | null;
}

/** An open job that can be scheduled onto the calendar. */
export interface SchedulableJob {
  id: string;
  title: string;
  status: Database["public"]["Enums"]["job_status"];
  client: { display_name: string } | null;
}

const VISIT_SELECT = "*, job:jobs(id, title, client:clients(display_name))";

/** Lists all visits for the org (RLS scopes to the caller's org), soonest first. */
export async function listVisits(): Promise<VisitWithJob[]> {
  const { data, error } = await supabase
    .from("visits")
    .select(VISIT_SELECT)
    .order("starts_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as VisitWithJob[];
}

export interface CreateVisitInput {
  orgId: string;
  jobId: string;
  startsAt: string;
  endsAt: string;
  notes?: string | null;
}

export async function createVisit(input: CreateVisitInput): Promise<VisitRow> {
  const { data, error } = await supabase
    .from("visits")
    .insert({
      org_id: input.orgId,
      job_id: input.jobId,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      notes: input.notes?.trim() || null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export interface UpdateVisitInput {
  starts_at?: string;
  ends_at?: string;
  status?: VisitStatus;
  notes?: string | null;
}

/** Patches a visit — used for drag/resize reschedules and status/notes edits. */
export async function updateVisit(
  id: string,
  patch: UpdateVisitInput,
): Promise<VisitRow> {
  const { data, error } = await supabase
    .from("visits")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteVisit(id: string): Promise<void> {
  const { error } = await supabase.from("visits").delete().eq("id", id);
  if (error) throw error;
}

/** Open jobs (not paid/cancelled, not deleted) eligible to be scheduled. */
export async function listSchedulableJobs(): Promise<SchedulableJob[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select("id, title, status, client:clients(display_name)")
    .in("status", OPEN_STATUSES)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as SchedulableJob[];
}
