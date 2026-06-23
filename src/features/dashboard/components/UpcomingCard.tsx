import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { UpcomingVisit } from "../useDashboardData";
import { formatVisitWhen } from "./format";

function VisitRow({ visit }: { visit: UpcomingVisit }) {
  const content = (
    <div className="flex items-start gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-accent">
      <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{visit.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {visit.clientName ?? "No customer"} · {formatVisitWhen(visit.startsAt)}
        </p>
      </div>
    </div>
  );

  if (visit.jobId) {
    return <Link to={`/app/jobs/${visit.jobId}`}>{content}</Link>;
  }
  return content;
}

export function UpcomingCard({ upcoming }: { upcoming: UpcomingVisit[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming jobs</CardTitle>
      </CardHeader>
      <CardContent>
        {upcoming.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Nothing scheduled yet.
          </p>
        ) : (
          <ul className="space-y-1">
            {upcoming.map((visit) => (
              <li key={visit.id}>
                <VisitRow visit={visit} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
