import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createTicket,
  deleteJob,
  getJob,
  listJobs,
  updateJob,
  updateJobStatus,
  type CreateTicketInput,
  type UpdateJobInput,
} from "@/services/jobs";
import type { JobStatus } from "@/features/jobs/status";

const JOBS_KEY = ["jobs"] as const;

export function useJobs() {
  return useQuery({ queryKey: JOBS_KEY, queryFn: listJobs });
}

export function useJob(id: string | undefined) {
  return useQuery({
    queryKey: ["job", id],
    queryFn: () => getJob(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTicketInput) => createTicket(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: JOBS_KEY }),
  });
}

export function useUpdateJob(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: UpdateJobInput) => updateJob(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: JOBS_KEY });
      qc.invalidateQueries({ queryKey: ["job", id] });
    },
  });
}

export function useUpdateJobStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: JobStatus }) =>
      updateJobStatus(id, status),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: JOBS_KEY });
      qc.invalidateQueries({ queryKey: ["job", id] });
    },
  });
}

export function useDeleteJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteJob(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: JOBS_KEY }),
  });
}
