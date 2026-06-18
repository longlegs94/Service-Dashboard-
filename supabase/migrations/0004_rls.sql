-- 0004_rls.sql
-- Row Level Security. Default-deny everywhere; access is granted only to members
-- of the row's organization. Owner/admin gate membership and Square management.

-- ── Helper functions ─────────────────────────────────────────────────────────
-- Map the current auth user to their profile id (memberships reference profiles).
create or replace function public.current_profile_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select id from public.profiles where auth_user_id = auth.uid();
$$;

create or replace function public.is_org_member(target_org_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships m
    where m.org_id = target_org_id
      and m.user_id = public.current_profile_id()
  );
$$;

create or replace function public.has_org_role(
  target_org_id uuid,
  allowed_roles text[]
)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships m
    where m.org_id = target_org_id
      and m.user_id = public.current_profile_id()
      and m.role::text = any (allowed_roles)
  );
$$;

-- ── Enable RLS on every table ────────────────────────────────────────────────
do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'organizations', 'memberships', 'clients', 'client_addresses',
    'jobs', 'visits', 'quotes', 'quote_items', 'invoices', 'invoice_items',
    'payments', 'attachments', 'activity_log', 'square_connections',
    'square_webhook_events'
  ]
  loop
    execute format('alter table public.%I enable row level security;', t);
  end loop;
end;
$$;

-- ── profiles ─────────────────────────────────────────────────────────────────
-- Read your own profile or those of people who share an org with you.
create policy "profiles_select_self_or_org" on profiles
  for select using (
    auth_user_id = auth.uid()
    or exists (
      select 1
      from memberships me
      join memberships them on them.org_id = me.org_id
      where me.user_id = public.current_profile_id()
        and them.user_id = profiles.id
    )
  );

create policy "profiles_update_self" on profiles
  for update using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

-- ── organizations ────────────────────────────────────────────────────────────
create policy "orgs_select_member" on organizations
  for select using (public.is_org_member(id));

create policy "orgs_update_admin" on organizations
  for update using (public.has_org_role(id, array['owner', 'admin']))
  with check (public.has_org_role(id, array['owner', 'admin']));

-- ── memberships ──────────────────────────────────────────────────────────────
create policy "memberships_select_member" on memberships
  for select using (public.is_org_member(org_id));

create policy "memberships_insert_admin" on memberships
  for insert with check (public.has_org_role(org_id, array['owner', 'admin']));

create policy "memberships_update_admin" on memberships
  for update using (public.has_org_role(org_id, array['owner', 'admin']))
  with check (public.has_org_role(org_id, array['owner', 'admin']));

create policy "memberships_delete_admin" on memberships
  for delete using (public.has_org_role(org_id, array['owner', 'admin']));

-- ── Standard org-scoped tables (select / insert / update for members) ────────
do $$
declare
  t text;
begin
  foreach t in array array[
    'clients', 'client_addresses', 'jobs', 'visits', 'quotes', 'quote_items',
    'invoices', 'invoice_items', 'payments', 'attachments', 'activity_log'
  ]
  loop
    execute format(
      'create policy "%1$s_select_member" on public.%1$s
         for select using (public.is_org_member(org_id));',
      t
    );
    execute format(
      'create policy "%1$s_insert_member" on public.%1$s
         for insert with check (public.is_org_member(org_id));',
      t
    );
    execute format(
      'create policy "%1$s_update_member" on public.%1$s
         for update using (public.is_org_member(org_id))
         with check (public.is_org_member(org_id));',
      t
    );
  end loop;
end;
$$;

-- ── Hard-delete policies (only non-financial records) ────────────────────────
-- Financial records (clients/jobs use soft delete; quotes/invoices/payments are
-- never hard-deleted) deliberately have NO delete policy → default deny.
do $$
declare
  t text;
begin
  foreach t in array array[
    'client_addresses', 'visits', 'quote_items', 'invoice_items', 'attachments'
  ]
  loop
    execute format(
      'create policy "%1$s_delete_member" on public.%1$s
         for delete using (public.is_org_member(org_id));',
      t
    );
  end loop;
end;
$$;

-- ── square_connections (owner/admin only) ────────────────────────────────────
create policy "square_connections_select_member" on square_connections
  for select using (public.is_org_member(org_id));

create policy "square_connections_write_admin" on square_connections
  for all
  using (public.has_org_role(org_id, array['owner', 'admin']))
  with check (public.has_org_role(org_id, array['owner', 'admin']));

-- ── square_webhook_events ────────────────────────────────────────────────────
-- No policies: only the service role (Edge Function) touches this table, and the
-- service role bypasses RLS. Authenticated/anon clients are fully denied.
