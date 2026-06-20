import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FullPageSpinner, Spinner } from "@/components/ui/spinner";
import { useOrg } from "@/features/org/useOrg";
import {
  useInvitations,
  useInviteMember,
  useMembers,
  useRemoveMember,
  useRevokeInvitation,
  useUpdateMemberRole,
} from "@/features/team/hooks";
import type { MembershipRole } from "@/services/team";

const ROLES: MembershipRole[] = ["owner", "admin", "member"];

export function TeamPage() {
  const { data: org, isLoading: orgLoading } = useOrg();
  const orgId = org?.orgId;
  const isAdmin = org?.role === "owner" || org?.role === "admin";

  const members = useMembers(orgId);
  const invitations = useInvitations(isAdmin ? orgId : undefined);
  const invite = useInviteMember(orgId ?? "");
  const revoke = useRevokeInvitation(orgId ?? "");
  const updateRole = useUpdateMemberRole(orgId ?? "");
  const removeMember = useRemoveMember(orgId ?? "");

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MembershipRole>("member");
  const [error, setError] = useState<string | null>(null);

  if (orgLoading) return <FullPageSpinner />;

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!org) return;
    try {
      await invite.mutateAsync({ invitedBy: org.profileId, email, role });
      setEmail("");
      setRole("member");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send invite.");
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Link
        to="/app/settings"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Settings
      </Link>
      <h1 className="text-2xl font-bold">Team</h1>

      {/* Invite (owner/admin only) */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invite a teammate</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="invite-email">Email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teammate@example.com"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invite-role">Role</Label>
                <Select
                  id="invite-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as MembershipRole)}
                >
                  <option value="member">Member — manage jobs & clients</option>
                  <option value="admin">Admin — also manage billing & team</option>
                </Select>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={invite.isPending}>
                {invite.isPending ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                Send invite
              </Button>
              <p className="text-xs text-muted-foreground">
                They join automatically the first time they sign in with this
                email.
              </p>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Pending invitations */}
      {isAdmin && (invitations.data?.length ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pending invites</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {invitations.data!.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="inline-flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {inv.email}
                  <Badge className="bg-slate-100 text-slate-700">
                    {inv.role}
                  </Badge>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => revoke.mutate(inv.id)}
                >
                  Revoke
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Members */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {members.isLoading ? (
            <Spinner className="h-5 w-5 text-muted-foreground" />
          ) : (
            members.data?.map((m) => {
              const isSelf = m.profileId === org?.profileId;
              return (
                <div
                  key={m.membershipId}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {m.fullName ?? m.email ?? "Member"}
                      {isSelf && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          (you)
                        </span>
                      )}
                    </p>
                    {m.email && (
                      <p className="truncate text-sm text-muted-foreground">
                        {m.email}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isAdmin && !isSelf ? (
                      <>
                        <Select
                          className="h-9 w-28 text-sm"
                          value={m.role}
                          onChange={(e) =>
                            updateRole.mutate({
                              membershipId: m.membershipId,
                              role: e.target.value as MembershipRole,
                            })
                          }
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </Select>
                        <button
                          aria-label="Remove member"
                          onClick={() => removeMember.mutate(m.membershipId)}
                          className="rounded p-2 text-destructive hover:bg-accent"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <Badge className="bg-slate-100 text-slate-700 capitalize">
                        {m.role}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
