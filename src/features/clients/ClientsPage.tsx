import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Phone, Plus, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { FullPageSpinner } from "@/components/ui/spinner";
import { useClients } from "@/features/clients/hooks";

export function ClientsPage() {
  const { data: clients, isLoading } = useClients();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const list = clients ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((c) =>
      [c.display_name, c.company_name, c.phone]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q)),
    );
  }, [clients, query]);

  if (isLoading) return <FullPageSpinner />;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Clients</h1>
        <Button asChild>
          <Link to="/app/clients/new">
            <Plus className="h-4 w-4" />
            New Client
          </Link>
        </Button>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, company, or phone…"
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Users className="h-8 w-8 text-muted-foreground" />
            {clients && clients.length === 0 ? (
              <>
                <p className="text-sm text-muted-foreground">
                  No clients yet. Add your first customer to get started.
                </p>
                <Button asChild>
                  <Link to="/app/clients/new">
                    <Plus className="h-4 w-4" />
                    Add your first client
                  </Link>
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No clients match “{query}”.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <Link key={c.id} to={`/app/clients/${c.id}`} className="block">
              <Card className="transition-colors hover:bg-accent">
                <CardContent className="flex items-center justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{c.display_name}</p>
                    {c.company_name && (
                      <p className="mt-0.5 inline-flex items-center gap-1 truncate text-sm text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5 shrink-0" />
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
        </div>
      )}
    </div>
  );
}
