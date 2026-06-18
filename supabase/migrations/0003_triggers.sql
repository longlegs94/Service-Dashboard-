-- 0003_triggers.sql
-- updated_at maintenance + the first-login bootstrap trigger.

-- ── updated_at touch trigger ─────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'organizations', 'clients', 'client_addresses', 'jobs',
    'visits', 'quotes', 'invoices', 'square_connections'
  ]
  loop
    execute format(
      'create trigger trg_%1$s_updated_at before update on public.%1$s
         for each row execute function public.set_updated_at();',
      t
    );
  end loop;
end;
$$;

-- ── First-login bootstrap ────────────────────────────────────────────────────
-- When a new auth user is created, automatically provision:
--   1. a profiles row
--   2. a personal organization
--   3. an owner membership
-- So a brand-new user lands in a ready-to-use workspace with no manual setup.
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

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
