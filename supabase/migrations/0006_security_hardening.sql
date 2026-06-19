-- 0006_security_hardening.sql
-- Resolve Supabase security-advisor warnings on the Phase 0 functions.

-- 1. Pin search_path on the two functions that were missing it. Neither
--    references app tables (only built-ins), so an empty search_path is safe and
--    strict.
alter function public.set_updated_at() set search_path = '';
alter function public.storage_object_org_id(text) set search_path = '';

-- 2. Trigger-only functions must never be reachable via the PostgREST RPC API.
--    (Triggers fire regardless of EXECUTE grants, so revoking is safe.)
revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- 3. RLS / storage helper functions: signed-in users need EXECUTE because policy
--    expressions reference them, but the anonymous role does not. Drop the
--    implicit PUBLIC grant and re-grant to authenticated only.
revoke execute on function public.current_profile_id() from public, anon;
revoke execute on function public.is_org_member(uuid) from public, anon;
revoke execute on function public.has_org_role(uuid, text[]) from public, anon;
revoke execute on function public.storage_object_org_id(text) from public, anon;

grant execute on function public.current_profile_id() to authenticated;
grant execute on function public.is_org_member(uuid) to authenticated;
grant execute on function public.has_org_role(uuid, text[]) to authenticated;
grant execute on function public.storage_object_org_id(text) to authenticated;
