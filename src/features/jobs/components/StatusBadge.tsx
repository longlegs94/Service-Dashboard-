import { Badge } from "@/components/ui/badge";
import { getStatusConfig, type JobStatus } from "@/features/jobs/status";

export function StatusBadge({ status }: { status: JobStatus }) {
  const cfg = getStatusConfig(status);
  return <Badge className={cfg.badgeClass}>{cfg.label}</Badge>;
}
