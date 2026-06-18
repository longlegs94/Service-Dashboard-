-- 0002_schema.sql
-- Core schema for the Service Dashboard.
--
-- Conventions:
--   * Every business table carries org_id, created_by, created_at, updated_at.
--   * Soft delete (deleted_at) where it makes sense.
--   * Money is ALWAYS integer cents — never floats.
--   * updated_at is maintained by a trigger (see 0003_triggers.sql).

-- ── Enums ──────────────────────────────────────────────────────────────────
create type membership_role as enum ('owner', 'admin', 'member');

create type job_status as enum (
  'new', 'scheduled', 'in_progress', 'waiting_parts',
  'needs_invoice', 'invoice_sent', 'paid', 'cancelled'
);

create type visit_status as enum ('scheduled', 'completed', 'cancelled', 'missed');

create type quote_status as enum (
  'draft', 'sent', 'accepted', 'rejected', 'expired', 'converted'
);

create type invoice_status as enum (
  'draft', 'sent', 'partially_paid', 'paid', 'overdue', 'cancelled', 'void'
);

create type payment_method as enum ('square', 'cash', 'cheque', 'e_transfer', 'other');

create type square_environment as enum ('sandbox', 'production');

-- ── Identity & tenancy ───────────────────────────────────────────────────────
create table profiles (
  id           uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users (id) on delete cascade,
  full_name    text,
  email        text,
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table organizations (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  owner_user_id uuid not null references profiles (id) on delete restrict,
  timezone      text not null default 'America/Vancouver',
  currency      text not null default 'CAD',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table memberships (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references organizations (id) on delete cascade,
  user_id    uuid not null references profiles (id) on delete cascade,
  role       membership_role not null default 'member',
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);

create index idx_memberships_user on memberships (user_id);
create index idx_memberships_org on memberships (org_id);

-- ── Clients ──────────────────────────────────────────────────────────────────
create table clients (
  id                 uuid primary key default gen_random_uuid(),
  org_id             uuid not null references organizations (id) on delete cascade,
  created_by         uuid references profiles (id) on delete set null,
  display_name       text not null,
  first_name         text,
  last_name          text,
  company_name       text,
  email              text,
  phone              text,
  notes              text,
  square_customer_id text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  deleted_at         timestamptz
);

create index idx_clients_org on clients (org_id);
create index idx_clients_org_name on clients (org_id, display_name);

create table client_addresses (
  id                 uuid primary key default gen_random_uuid(),
  org_id             uuid not null references organizations (id) on delete cascade,
  client_id          uuid not null references clients (id) on delete cascade,
  label              text,
  address_line_1     text,
  address_line_2     text,
  city               text,
  province           text,
  postal_code        text,
  country            text not null default 'Canada',
  is_default_service boolean not null default false,
  is_default_billing boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index idx_client_addresses_org on client_addresses (org_id);
create index idx_client_addresses_client on client_addresses (client_id);

-- ── Jobs & scheduling ────────────────────────────────────────────────────────
create table jobs (
  id                 uuid primary key default gen_random_uuid(),
  org_id             uuid not null references organizations (id) on delete cascade,
  created_by         uuid references profiles (id) on delete set null,
  client_id          uuid references clients (id) on delete set null,
  service_address_id uuid references client_addresses (id) on delete set null,
  job_number         text,
  title              text not null,
  description        text,
  status             job_status not null default 'new',
  priority           text,
  pipeline_order     numeric not null default 0,
  scheduled_start    timestamptz,
  scheduled_end      timestamptz,
  completed_at       timestamptz,
  paid_at            timestamptz,
  assigned_to        uuid references profiles (id) on delete set null,
  source             text,
  internal_notes     text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  deleted_at         timestamptz
);

create index idx_jobs_org on jobs (org_id);
create index idx_jobs_org_status on jobs (org_id, status);
create index idx_jobs_client on jobs (client_id);
create index idx_jobs_scheduled_start on jobs (org_id, scheduled_start);

create table visits (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizations (id) on delete cascade,
  job_id      uuid not null references jobs (id) on delete cascade,
  assigned_to uuid references profiles (id) on delete set null,
  starts_at   timestamptz,
  ends_at     timestamptz,
  status      visit_status not null default 'scheduled',
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_visits_org on visits (org_id);
create index idx_visits_job on visits (job_id);
create index idx_visits_starts_at on visits (org_id, starts_at);

-- ── Quotes ───────────────────────────────────────────────────────────────────
create table quotes (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references organizations (id) on delete cascade,
  client_id     uuid references clients (id) on delete set null,
  job_id        uuid references jobs (id) on delete set null,
  quote_number  text,
  status        quote_status not null default 'draft',
  subtotal_cents integer not null default 0,
  tax_cents     integer not null default 0,
  total_cents   integer not null default 0,
  currency      text not null default 'CAD',
  expires_at    timestamptz,
  sent_at       timestamptz,
  accepted_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_quotes_org on quotes (org_id);
create index idx_quotes_client on quotes (client_id);

create table quote_items (
  id               uuid primary key default gen_random_uuid(),
  org_id           uuid not null references organizations (id) on delete cascade,
  quote_id         uuid not null references quotes (id) on delete cascade,
  description      text not null,
  quantity         numeric not null default 1,
  unit_price_cents integer not null default 0,
  taxable          boolean not null default true,
  sort_order       integer not null default 0
);

create index idx_quote_items_quote on quote_items (quote_id);

-- ── Invoices & payments ──────────────────────────────────────────────────────
create table invoices (
  id                     uuid primary key default gen_random_uuid(),
  org_id                 uuid not null references organizations (id) on delete cascade,
  client_id              uuid references clients (id) on delete set null,
  job_id                 uuid references jobs (id) on delete set null,
  invoice_number         text,
  status                 invoice_status not null default 'draft',
  subtotal_cents         integer not null default 0,
  tax_cents              integer not null default 0,
  total_cents            integer not null default 0,
  amount_paid_cents      integer not null default 0,
  balance_due_cents      integer not null default 0,
  currency               text not null default 'CAD',
  due_at                 timestamptz,
  sent_at                timestamptz,
  paid_at                timestamptz,
  square_order_id        text,
  square_invoice_id      text,
  square_payment_link_id text,
  square_public_url      text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index idx_invoices_org on invoices (org_id);
create index idx_invoices_org_status on invoices (org_id, status);
create index idx_invoices_client on invoices (client_id);
create index idx_invoices_square_invoice_id on invoices (square_invoice_id);

create table invoice_items (
  id               uuid primary key default gen_random_uuid(),
  org_id           uuid not null references organizations (id) on delete cascade,
  invoice_id       uuid not null references invoices (id) on delete cascade,
  description      text not null,
  quantity         numeric not null default 1,
  unit_price_cents integer not null default 0,
  taxable          boolean not null default true,
  sort_order       integer not null default 0
);

create index idx_invoice_items_invoice on invoice_items (invoice_id);

create table payments (
  id               uuid primary key default gen_random_uuid(),
  org_id           uuid not null references organizations (id) on delete cascade,
  invoice_id       uuid references invoices (id) on delete set null,
  job_id           uuid references jobs (id) on delete set null,
  client_id        uuid references clients (id) on delete set null,
  method           payment_method not null,
  amount_cents     integer not null,
  currency         text not null default 'CAD',
  paid_at          timestamptz not null default now(),
  square_payment_id text,
  square_event_id  text,
  notes            text,
  created_by       uuid references profiles (id) on delete set null,
  created_at       timestamptz not null default now()
);

create index idx_payments_org on payments (org_id);
create index idx_payments_invoice on payments (invoice_id);
-- Idempotency guard for Square webhook retries (one payment per Square payment).
create unique index uniq_payments_square_payment_id
  on payments (square_payment_id) where square_payment_id is not null;

-- ── Attachments ──────────────────────────────────────────────────────────────
create table attachments (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizations (id) on delete cascade,
  job_id      uuid references jobs (id) on delete cascade,
  client_id   uuid references clients (id) on delete cascade,
  uploaded_by uuid references profiles (id) on delete set null,
  bucket      text not null default 'job-attachments',
  path        text not null,
  file_name   text,
  mime_type   text,
  size_bytes  integer,
  created_at  timestamptz not null default now()
);

create index idx_attachments_org on attachments (org_id);
create index idx_attachments_job on attachments (job_id);

-- ── Activity log ─────────────────────────────────────────────────────────────
create table activity_log (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references organizations (id) on delete cascade,
  actor_user_id uuid references profiles (id) on delete set null,
  entity_type   text,
  entity_id     uuid,
  action        text,
  metadata      jsonb,
  created_at    timestamptz not null default now()
);

create index idx_activity_log_org on activity_log (org_id, created_at desc);

-- ── Square ───────────────────────────────────────────────────────────────────
-- Connection metadata only. The actual access token lives in an Edge Function
-- secret (never in the database).
create table square_connections (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references organizations (id) on delete cascade,
  environment  square_environment not null default 'sandbox',
  merchant_id  text,
  location_id  text,
  connected_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index idx_square_connections_org on square_connections (org_id);

-- Webhook idempotency ledger.
create table square_webhook_events (
  id               uuid primary key default gen_random_uuid(),
  event_id         text not null unique,
  event_type       text,
  merchant_id      text,
  square_object_id text,
  processed_at     timestamptz,
  raw_payload      jsonb,
  created_at       timestamptz not null default now()
);
