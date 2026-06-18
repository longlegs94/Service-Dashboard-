import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** Generic "coming in a later phase" page used by feature shells in Phase 0. */
export function PlaceholderPage({
  title,
  phase,
  description,
}: {
  title: string;
  phase: string;
  description: string;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Coming in {phase}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          This section is part of {phase}. The Phase 0 foundation (auth,
          navigation, database, and security) is in place to support it.
        </CardContent>
      </Card>
    </div>
  );
}
