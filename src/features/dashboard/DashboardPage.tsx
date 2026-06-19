import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { StatusBadge } from "@/features/jobs/components/StatusBadge";
import { useJobs } from "@/features/jobs/hooks";
import { useOrg } from "@/features/org/useOrg";
import {
  DASHBOARD_BUCKETS,
  OPEN_STATUSES,
  type JobStatus,
} from "@/features/jobs/status";
import type { JobWithClient } from "@/services/jobs";

export function DashboardPage() {
  const { data: org } = useOrg();
  const { data: jobs, isLoading, isError, error } = useJobs();

  const counts = useMemo(() => countByStatus(jobs ?? []), [jobs]);

  const firstName = (org?.fullName ?? "").split(" ")[0] || "there";

  // Jobs that still need attention, newest first — the day's working list.
  const openJobs = useMemo(
    () =>
      (jobs ?? []).filter((j) =>
        OPEN_STATUSES.includes(j.status as JobStatus),
      ),
    [jobs],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Hi {firstName} 👋</h1>
          <p className="text-muted-foreground">
            Here's where all your jobs stand right now.
          </p>
        </div>
        <Button asChild>
          <Link to="/app/jobs/new">
            <Plus className="h-5 w-5" />
            New Job
          </Link>
        </Button>
      </div>

      {isError && (
        <Card>
          <CardContent className="py-6 text-sm text-destructive">
            Couldn't load jobs: {(error as Error)?.message}
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-7 w-7 text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Status buckets — the at-a-glance answer to "where is everything?" */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {DASHBOARD_BUCKETS.map((bucket) => {
              const count = bucket.statuses.reduce(
                (sum, s) => sum + (counts[s] ?? 0),
                0,
              );
              return (
                <Link
                  key={bucket.key}
                  to={`/app/jobs?bucket=${bucket.key}`}
                  className={`rounded-lg border p-4 transition-shadow hover:shadow-sm ${bucket.cardClass}`}
                >
                  <div className="text-3xl font-bold">{count}</div>
                  <div className="mt-1 text-sm font-medium">{bucket.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {bucket.blurb}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Needs attention list */}
          <Card>
            <CardContent className="p-0">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <h2 className="font-semibold">
                  Needs attention ({openJobs.length})
                </h2>
                <Link
                  to="/app/jobs"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {openJobs.length === 0 ? (
                <EmptyState />
              ) : (
                <ul className="divide-y">
                  {openJobs.slice(0, 8).map((job) => (
                    <li key={job.id}>
                      <Link
                        to={`/app/jobs/${job.id}`}
                        className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-accent"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium">{job.title}</p>
                          <p className="truncate text-sm text-muted-foreground">
                            {job.client?.display_name ?? "No customer"}
                          </p>
                        </div>
                        <StatusBadge status={job.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="px-4 py-10 text-center">
      <p className="text-sm text-muted-foreground">
        No open jobs. Add a ticket as soon as it comes in by text or WhatsApp.
      </p>
      <Button asChild className="mt-4">
        <Link to="/app/jobs/new">
          <Plus className="h-5 w-5" />
          Add your first job
        </Link>
      </Button>
    </div>
  );
}

function countByStatus(jobs: JobWithClient[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const job of jobs) {
    counts[job.status] = (counts[job.status] ?? 0) + 1;
  }
  return counts;
}
