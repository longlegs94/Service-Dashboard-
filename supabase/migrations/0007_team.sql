-- 0007_team.sql
-- Team support: invite people to an organization by email, and have the
-- first-login trigger place an invited user into the inviting org instead of
-- spinning up a personal org for them.

create table public.org_invitations (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations (id) on delete cascade,
  email       text not null,
  role        membership_role not null default 'member',
  status      text not null default 'pending' check (status in ('pending', 'accepted', 'revoked')),
  invited_by  uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now(),
  accepted_at timestamptz
);

-- Only one outstanding invite per email per org.
create unique index uniq_org_invitations_pending
  on public.org_invitations (org_id, lower(email))
  where status = 'pending';
create index idx_org_invitations_email
  on public.org_invitations (lower(email))
  where status = 'pending';

-- ── RLS: only owner/admin manage invitations for their org ───────────────────
alter table public.org_invitations enable row level security;

create policy "invitations_select_admin" on public.org_invitations
  for select using (public.has_org_role(org_id, array['owner', 'admin']));
create policy "invitations_insert_admin" on public.org_invitations
  for insert with check (public.has_org_role(org_id, array['owner', 'admin']));
create policy "invitations_update_admin" on public.org_invitations
  for update using (public.has_org_role(org_id, array['owner', 'admin']))
  with check (public.has_org_role(org_id, array['owner', 'admin']));
create policy "invitations_delete_admin" on public.org_invitations
  for delete using (public.has_org_role(org_id, array['owner', 'admin']));

-- ── First-login: accept invites, else create a personal org ──────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_profile_id uuid;
  new_org_id     uuid;
  display_name   text;
  org_name       text;
  inv            record;
  was_invited    boolean := false;
begin
  display_name := coalesce(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',
    split_part(new.email, '@', 1)
  );

  insert into public.profiles (auth_user_id, full_name, email, avatar_url)
  values (
    new.id,
    display_name,
    new.email,
    new.raw_user_meta_data ->> 'avatar_url'
  )
  returning id into new_profile_id;

  -- Accept any pending invitations addressed to this email.
  for inv in
    select * from public.org_invitations
    where lower(email) = lower(new.email) and status = 'pending'
  loop
    insert into public.memberships (org_id, user_id, role)
    values (inv.org_id, new_profile_id, inv.role)
    on conflict (org_id, user_id) do nothing;

    update public.org_invitations
    set status = 'accepted', accepted_at = now()
    where id = inv.id;

    was_invited := true;
  end loop;

  -- No invite → give them their own personal organization as owner.
  if not was_invited then
    org_name := case
      when display_name is not null and length(trim(display_name)) > 0
        then display_name || '''s Business'
      else 'My Business'
    end;

    insert into public.organizations (name, owner_user_id)
    values (org_name, new_profile_id)
    returning id into new_org_id;

    insert into public.memberships (org_id, user_id, role)
    values (new_org_id, new_profile_id, 'owner');
  end if;

  return new;
end;
$$;
