import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Phone, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { FullPageSpinner } from "@/components/ui/spinner";
import { StatusBadge } from "@/features/jobs/components/StatusBadge";
import { JobPhotos } from "@/features/jobs/components/JobPhotos";
import {
  useDeleteJob,
  useJob,
  useUpdateJobStatus,
} from "@/features/jobs/hooks";
import {
  JOB_STATUSES,
  getStatusConfig,
  type JobStatus,
} from "@/features/jobs/status";

export function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: job, isLoading, isError } = useJob(id);
  const updateStatus = useUpdateJobStatus();
  const deleteJob = useDeleteJob();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (isLoading) return <FullPageSpinner />;
  if (isError || !job) {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <BackLink />
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            This job couldn't be found.
          </CardContent>
        </Card>
      </div>
    );
  }

  const cfg = getStatusConfig(job.status as JobStatus);

  async function handleDelete() {
    await deleteJob.mutateAsync(job!.id);
    navigate("/app/jobs", { replace: true });
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <BackLink />

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{job.title}</h1>
          <div className="mt-2">
            <StatusBadge status={job.status} />
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to={`/app/jobs/${job.id}/edit`}>
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        </Button>
      </div>

      {/* Quick status change */}
      <Card>
        <CardContent className="space-y-2 pt-6">
          <label className="text-sm font-medium">Update status</label>
          <Select
            value={job.status}
            disabled={updateStatus.isPending}
            onChange={(e) =>
              updateStatus.mutate({
                id: job.id,
                status: e.target.value as JobStatus,
              })
            }
          >
            {JOB_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label} — {s.description}
              </option>
            ))}
          </Select>
          <p className="text-xs text-muted-foreground">{cfg.description}</p>
        </CardContent>
      </Card>

      {/* Customer */}
      <Card>
        <CardContent className="space-y-2 pt-6">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Customer
          </h2>
          <p className="inline-flex items-center gap-2 font-medium">
            <User className="h-4 w-4" />
            {job.client?.display_name ?? "—"}
          </p>
          {job.client?.phone && (
            <a
              href={`tel:${job.client.phone}`}
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <Phone className="h-4 w-4" />
              {job.client.phone}
            </a>
          )}
        </CardContent>
      </Card>

      {/* Details */}
      {job.description && (
        <Card>
          <CardContent className="space-y-2 pt-6">
            <h2 className="text-sm font-semibold text-muted-foreground">
              Details
            </h2>
            <p className="whitespace-pre-wrap text-sm">{job.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Photos & files */}
      <JobPhotos jobId={job.id} />

      {/* Danger zone */}
      <div className="pt-2">
        {confirmDelete ? (
          <div className="flex items-center gap-3">
            <span className="text-sm">Delete this job?</span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleteJob.isPending}
            >
              Yes, delete
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmDelete(false)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete job
          </Button>
        )}
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      to="/app/jobs"
      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" /> All jobs
    </Link>
  );
}
