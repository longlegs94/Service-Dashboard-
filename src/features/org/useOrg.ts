import { useQuery } from "@tanstack/react-query";
import { getOrgContext } from "@/services/org";
import { useSession } from "@/features/auth/useAuth";

/**
 * Loads the current user's org context once they're authenticated. Used by
 * almost every screen (needs org_id for reads/writes), so it's cached broadly.
 */
export function useOrg() {
  const session = useSession();
  return useQuery({
    queryKey: ["org-context", session?.user?.id],
    queryFn: getOrgContext,
    enabled: Boolean(session),
    staleTime: 5 * 60 * 1000,
  });
}
