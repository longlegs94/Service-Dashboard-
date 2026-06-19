import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database.types";

export type MembershipRole = Database["public"]["Enums"]["membership_role"];

export interface OrgContext {
  profileId: string;
  fullName: string | null;
  email: string | null;
  orgId: string;
  orgName: string;
  currency: string;
  role: MembershipRole;
}

/**
 * Resolves the signed-in user's profile and primary organization.
 *
 * Every new auth user gets a profile + personal org + owner membership from the
 * first-login DB trigger, so this should always return a context for a logged-in
 * user. RLS guarantees we only ever see our own profile and orgs.
 */
export async function getOrgContext(): Promise<OrgContext> {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .single();
  if (profileError) throw profileError;

  const { data: membership, error: membershipError } = await supabase
    .from("memberships")
    .select("role, organizations(id, name, currency)")
    .order("created_at", { ascending: true })
    .limit(1)
    .single();
  if (membershipError) throw membershipError;

  const org = membership.organizations as unknown as {
    id: string;
    name: string;
    currency: string;
  };

  return {
    profileId: profile.id,
    fullName: profile.full_name,
    email: profile.email,
    orgId: org.id,
    orgName: org.name,
    currency: org.currency,
    role: membership.role,
  };
}
