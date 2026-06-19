import { useNavigate } from "react-router-dom";
import { Phone, User } from "lucide-react";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/features/jobs/components/StatusBadge";
import { JOB_STATUSES, type JobStatus } from "@/features/jobs/status";
import type { JobWithClient } from "@/services/jobs";

/**
 * A ticket card for the jobs list. Tap the body to open detail; use the inline
 * status dropdown to advance the ticket without leaving the list.
 */
export function JobCard({
  job,
  onStatusChange,
  updating,
}: {
  job: JobWithClient;
  onStatusChange: (id: string, status: JobStatus) => void;
  updating: boolean;
}) {
  const navigate = useNavigate();

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <button
        type="button"
        onClick={() => navigate(`/app/jobs/${job.id}`)}
        className="block w-full text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold leading-tight">{job.title}</h3>
          <StatusBadge status={job.status} />
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {job.client?.display_name && (
            <span className="inline-flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {job.client.display_name}
            </span>
          )}
          {job.client?.phone && (
            <span className="inline-flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" />
              {job.client.phone}
            </span>
          )}
        </div>
        {job.description && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {job.description}
          </p>
        )}
      </button>

      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Move to</span>
        <Select
          className="h-9 text-sm"
          value={job.status}
          disabled={updating}
          onChange={(e) => onStatusChange(job.id, e.target.value as JobStatus)}
        >
          {JOB_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
