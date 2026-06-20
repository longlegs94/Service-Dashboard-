import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database.types";

export type AttachmentRow = Database["public"]["Tables"]["attachments"]["Row"];
export interface AttachmentWithUrl extends AttachmentRow {
  /** Short-lived signed URL for the private file (null if it couldn't be signed). */
  url: string | null;
}

const BUCKET = "job-attachments";
const SIGNED_URL_TTL = 60 * 60; // 1 hour

/** Lists a job's attachments with fresh signed URLs (the bucket is private). */
export async function listJobAttachments(
  jobId: string,
): Promise<AttachmentWithUrl[]> {
  const { data, error } = await supabase
    .from("attachments")
    .select("*")
    .eq("job_id", jobId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const rows = data ?? [];
  if (rows.length === 0) return [];

  const { data: signed } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(
      rows.map((r) => r.path),
      SIGNED_URL_TTL,
    );
  const urlByPath = new Map(
    (signed ?? []).map((s) => [s.path, s.signedUrl] as const),
  );
  return rows.map((r) => ({ ...r, url: urlByPath.get(r.path) ?? null }));
}

function sanitize(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
}

/** Uploads a photo/file to storage and records the attachment row. */
export async function uploadJobAttachment(params: {
  orgId: string;
  jobId: string;
  uploadedBy: string;
  file: File;
}): Promise<AttachmentRow> {
  const fileId = crypto.randomUUID();
  // Path convention enforced by storage RLS: org/{org_id}/jobs/{job_id}/...
  const path = `org/${params.orgId}/jobs/${params.jobId}/${fileId}-${sanitize(
    params.file.name,
  )}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, params.file, {
      contentType: params.file.type || undefined,
      upsert: false,
    });
  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from("attachments")
    .insert({
      org_id: params.orgId,
      job_id: params.jobId,
      uploaded_by: params.uploadedBy,
      bucket: BUCKET,
      path,
      file_name: params.file.name,
      mime_type: params.file.type || null,
      size_bytes: params.file.size,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

/** Removes the storage object and its attachment row. */
export async function deleteJobAttachment(
  attachment: Pick<AttachmentRow, "id" | "path">,
): Promise<void> {
  await supabase.storage.from(BUCKET).remove([attachment.path]);
  const { error } = await supabase
    .from("attachments")
    .delete()
    .eq("id", attachment.id);
  if (error) throw error;
}
