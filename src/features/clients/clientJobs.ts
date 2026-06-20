import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { JobStatus } from "@/features/jobs/status";

export interface ClientJobRow {
  id: string;
  title: string;
  status: JobStatus;
  updated_at: string;
}

export async function listClientJobs(
  clientId: string,
): Promise<ClientJobRow[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select("id, title, status, updated_at")
    .eq("client_id", clientId)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ClientJobRow[];
}

export function useClientJobs(clientId: string | undefined) {
  return useQuery({
    queryKey: ["client-jobs", clientId],
    queryFn: () => listClientJobs(clientId as string),
    enabled: Boolean(clientId),
  });
}
