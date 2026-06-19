import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { JobCard } from "@/features/jobs/components/JobCard";
import { useJobs, useUpdateJobStatus } from "@/features/jobs/hooks";
import {
  DASHBOARD_BUCKETS,
  getStatusConfig,
  type DashboardBucket,
  type JobStatus,
} from "@/features/jobs/status";
import { cn } from "@/lib/utils";

const FILTERS: { key: DashboardBucket | "all"; label: string }[] = [
  { key: "all", label: "All" },
  ...DASHBOARD_BUCKETS.map((b) => ({ key: b.key, label: b.label })),
];

export function JobsPage() {
  const [params, setParams] = useSearchParams();
  const activeFilter = (params.get("bucket") as DashboardBucket | null) ?? "all";

  const { data: jobs, isLoading } = useJobs();
  const updateStatus = useUpdateJobStatus();

  const filtered = useMemo(() => {
    if (!jobs) return [];
    if (activeFilter === "all") return jobs;
    return jobs.filter(
      (j) => getStatusConfig(j.status as JobStatus).bucket === activeFilter,
    );
  }, [jobs, activeFilter]);

  function setFilter(key: DashboardBucket | "all") {
    if (key === "all") setParams({});
    else setParams({ bucket: key });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Jobs</h1>
        <Button asChild>
          <Link to="/app/jobs/new">
            <Plus className="h-5 w-5" />
            New Job
          </Link>
        </Button>
      </div>

      {/* Filter chips */}
      <div className="-mx-1 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              activeFilter === f.key
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-background hover:bg-accent",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-7 w-7 text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No jobs here yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              updating={
                updateStatus.isPending && updateStatus.variables?.id === job.id
              }
              onStatusChange={(id, status: JobStatus) =>
                updateStatus.mutate({ id, status })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
