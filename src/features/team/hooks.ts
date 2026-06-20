import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  inviteMember,
  listInvitations,
  listMembers,
  removeMember,
  revokeInvitation,
  updateMemberRole,
  type MembershipRole,
} from "@/services/team";

export function useMembers(orgId: string | undefined) {
  return useQuery({
    queryKey: ["members", orgId],
    queryFn: () => listMembers(orgId as string),
    enabled: Boolean(orgId),
  });
}

export function useInvitations(orgId: string | undefined) {
  return useQuery({
    queryKey: ["invitations", orgId],
    queryFn: () => listInvitations(orgId as string),
    enabled: Boolean(orgId),
  });
}

export function useInviteMember(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      invitedBy: string;
      email: string;
      role: MembershipRole;
    }) => inviteMember({ orgId, ...params }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invitations", orgId] }),
  });
}

export function useRevokeInvitation(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => revokeInvitation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invitations", orgId] }),
  });
}

export function useUpdateMemberRole(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      membershipId,
      role,
    }: {
      membershipId: string;
      role: MembershipRole;
    }) => updateMemberRole(membershipId, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["members", orgId] }),
  });
}

export function useRemoveMember(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (membershipId: string) => removeMember(membershipId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["members", orgId] }),
  });
}
