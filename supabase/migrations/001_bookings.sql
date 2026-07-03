-- Bookings table for HomePro Appliances website
-- Run this in the Supabase SQL Editor (or `supabase db push`) once per project.

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  reference text not null unique,
  name text not null,
  phone text not null,
  email text not null,
  address text not null,
  city text not null,
  appliance_type text not null,
  brand text,
  problem text not null,
  preferred_date date not null,
  preferred_time_window text not null,
  status text not null default 'new'
    check (status in ('new', 'confirmed', 'completed', 'cancelled'))
);

-- Lock the table down: RLS on, and no policies for anon/authenticated.
-- Only the service-role key (used by the website's /api/bookings route)
-- can read or write. View bookings in the Supabase dashboard Table Editor.
alter table public.bookings enable row level security;

create index if not exists bookings_created_at_idx on public.bookings (created_at desc);
create index if not exists bookings_status_idx on public.bookings (status);
