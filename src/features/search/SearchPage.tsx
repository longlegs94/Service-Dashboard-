import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Briefcase, Building2, Phone, Search, User, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { FullPageSpinner } from "@/components/ui/spinner";
import { StatusBadge } from "@/features/jobs/components/StatusBadge";
import { useJobs } from "@/features/jobs/hooks";
import { useClients } from "@/features/clients/hooks";

/**
 * Global search across jobs and clients. Filters the already-cached lists
 * client-side (fine for a solo operator's volume) so results are instant and
 * work even when offline data is loaded.
 */
export function SearchPage() {
  const [params] = useSearchParams();
  const query = (params.get("q") ?? "").trim();
  const q = query.toLowerCase();

  const { data: jobs, isLoading: jobsLoading } = useJobs();
  const { data: clients, isLoading: clientsLoading } = useClients();

  const jobResults = useMemo(() => {
    if (!q) return [];
    return (jobs ?? []).filter((j) =>
      [j.title, j.description, j.client?.display_name, j.client?.phone]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q)),
    );
  }, [jobs, q]);

  const clientResults = useMemo(() => {
    if (!q) return [];
    return (clients ?? []).filter((c) =>
      [c.display_name, c.company_name, c.phone, c.email]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q)),
    );
  }, [clients, q]);

  if (jobsLoading || clientsLoading) return <FullPageSpinner />;

  const total = jobResults.length + clientResults.length;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Search</h1>
        {query ? (
          <p className="text-muted-foreground">
            {total} result{total === 1 ? "" : "s"} for “{query}”
          </p>
        ) : (
          <p className="text-muted-foreground">
            Type in the search bar to find jobs and clients.
          </p>
        )}
      </div>

      {query && total === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <Search className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Nothing matched “{query}”.
            </p>
          </CardContent>
        </Card>
      )}

      {clientResults.length > 0 && (
        <section className="space-y-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Users className="h-4 w-4" /> Clients ({clientResults.length})
          </h2>
          {clientResults.map((c) => (
            <Link key={c.id} to={`/app/clients/${c.id}`} className="block">
              <Card className="transition-colors hover:bg-accent">
                <CardContent className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{c.display_name}</p>
                    {c.company_name && (
                      <p className="inline-flex items-center gap-1 truncate text-sm text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5" />
                        {c.company_name}
                      </p>
                    )}
                  </div>
                  {c.phone && (
                    <span className="inline-flex shrink-0 items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      {c.phone}
                    </span>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>
      )}

      {jobResults.length > 0 && (
        <section className="space-y-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Briefcase className="h-4 w-4" /> Jobs ({jobResults.length})
          </h2>
          {jobResults.map((j) => (
            <Link key={j.id} to={`/app/jobs/${j.id}`} className="block">
              <Card className="transition-colors hover:bg-accent">
                <CardContent className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{j.title}</p>
                    {j.client?.display_name && (
                      <p className="inline-flex items-center gap-1 truncate text-sm text-muted-foreground">
                        <User className="h-3.5 w-3.5" />
                        {j.client.display_name}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={j.status} />
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
