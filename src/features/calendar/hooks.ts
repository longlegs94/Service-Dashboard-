import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createVisit,
  deleteVisit,
  listSchedulableJobs,
  listVisits,
  updateVisit,
  type CreateVisitInput,
  type UpdateVisitInput,
} from "@/services/visits";

const VISITS_KEY = ["visits"] as const;
const SCHEDULABLE_JOBS_KEY = ["schedulable-jobs"] as const;

export function useVisits() {
  return useQuery({ queryKey: VISITS_KEY, queryFn: listVisits });
}

export function useSchedulableJobs() {
  return useQuery({
    queryKey: SCHEDULABLE_JOBS_KEY,
    queryFn: listSchedulableJobs,
  });
}

export function useCreateVisit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateVisitInput) => createVisit(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: VISITS_KEY }),
  });
}

export function useUpdateVisit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateVisitInput }) =>
      updateVisit(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: VISITS_KEY }),
  });
}

export function useDeleteVisit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteVisit(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: VISITS_KEY }),
  });
}
