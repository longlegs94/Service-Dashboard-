import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  deleteJobAttachment,
  listJobAttachments,
  uploadJobAttachment,
  type AttachmentRow,
} from "@/services/attachments";

export function useJobAttachments(jobId: string | undefined) {
  return useQuery({
    queryKey: ["attachments", jobId],
    queryFn: () => listJobAttachments(jobId as string),
    enabled: Boolean(jobId),
  });
}

export function useUploadAttachment(jobId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { orgId: string; uploadedBy: string; file: File }) =>
      uploadJobAttachment({ ...params, jobId }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["attachments", jobId] }),
  });
}

export function useDeleteAttachment(jobId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (attachment: Pick<AttachmentRow, "id" | "path">) =>
      deleteJobAttachment(attachment),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["attachments", jobId] }),
  });
}
