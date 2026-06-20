import { useRef, useState } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useOrg } from "@/features/org/useOrg";
import {
  useDeleteAttachment,
  useJobAttachments,
  useUploadAttachment,
} from "@/features/jobs/attachmentHooks";

/** Photos & files for a job — capture from the phone camera or pick a file. */
export function JobPhotos({ jobId }: { jobId: string }) {
  const { data: org } = useOrg();
  const { data: attachments, isLoading } = useJobAttachments(jobId);
  const upload = useUploadAttachment(jobId);
  const remove = useDeleteAttachment(jobId);
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || !org) return;
    setError(null);
    try {
      for (const file of Array.from(files)) {
        await upload.mutateAsync({
          orgId: org.orgId,
          uploadedBy: org.profileId,
          file,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const photos = attachments ?? [];

  return (
    <Card>
      <CardContent className="space-y-3 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Photos &amp; files
          </h2>
          <Button
            size="sm"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={upload.isPending}
          >
            {upload.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
            Add photo
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : photos.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No photos yet. Snap one on site so you have a record.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {photos.map((a) => (
              <div key={a.id} className="group relative aspect-square">
                {a.url && a.mime_type?.startsWith("image/") ? (
                  <a href={a.url} target="_blank" rel="noreferrer">
                    <img
                      src={a.url}
                      alt={a.file_name ?? "Job photo"}
                      className="h-full w-full rounded-md object-cover"
                      loading="lazy"
                    />
                  </a>
                ) : (
                  <a
                    href={a.url ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-full w-full items-center justify-center rounded-md border bg-muted p-1 text-center text-xs text-muted-foreground"
                  >
                    {a.file_name ?? "File"}
                  </a>
                )}
                <button
                  aria-label="Delete"
                  onClick={() => remove.mutate({ id: a.id, path: a.path })}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
