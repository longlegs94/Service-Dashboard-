import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database.types";

export type MembershipRole = Database["public"]["Enums"]["membership_role"];

export interface Member {
  membershipId: string;
  profileId: string;
  role: MembershipRole;
  fullName: string | null;
  email: string | null;
}

export interface Invitation {
  id: string;
  email: string;
  role: MembershipRole;
  status: string;
  created_at: string;
}

/** Lists the org's members with their profile info. */
export async function listMembers(orgId: string): Promise<Member[]> {
  const { data, error } = await supabase
    .from("memberships")
    .select("id, role, user_id, profile:profiles(id, full_name, email)")
    .eq("org_id", orgId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => {
    const profile = row.profile as unknown as {
      id: string;
      full_name: string | null;
      email: string | null;
    } | null;
    return {
      membershipId: row.id,
      profileId: row.user_id,
      role: row.role,
      fullName: profile?.full_name ?? null,
      email: profile?.email ?? null,
    };
  });
}

export async function listInvitations(orgId: string): Promise<Invitation[]> {
  const { data, error } = await supabase
    .from("org_invitations")
    .select("id, email, role, status, created_at")
    .eq("org_id", orgId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function inviteMember(params: {
  orgId: string;
  invitedBy: string;
  email: string;
  role: MembershipRole;
}): Promise<void> {
  const { error } = await supabase.from("org_invitations").insert({
    org_id: params.orgId,
    invited_by: params.invitedBy,
    email: params.email.trim().toLowerCase(),
    role: params.role,
  });
  if (error) throw error;
}

export async function revokeInvitation(id: string): Promise<void> {
  const { error } = await supabase
    .from("org_invitations")
    .update({ status: "revoked" })
    .eq("id", id);
  if (error) throw error;
}

export async function updateMemberRole(
  membershipId: string,
  role: MembershipRole,
): Promise<void> {
  const { error } = await supabase
    .from("memberships")
    .update({ role })
    .eq("id", membershipId);
  if (error) throw error;
}

export async function removeMember(membershipId: string): Promise<void> {
  const { error } = await supabase
    .from("memberships")
    .delete()
    .eq("id", membershipId);
  if (error) throw error;
}
