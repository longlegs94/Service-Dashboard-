# Architecture — Service Dashboard

A Jobber/ServiceTitan-style field-service app for a solo operator (clients, jobs,
scheduling, invoices, payments). Built as a **responsive, installable PWA** that
runs on Android and desktop from one codebase, and can be wrapped with Capacitor
into a native Android app later — without a rewrite.

> This document is the technical companion to the product overview in
> [`JOB_MANAGEMENT_APP.md`](./JOB_MANAGEMENT_APP.md). The phased build spec lives
> in the approved plan; this file describes the system as built.

## Tech Stack
| Layer | Choice |
| --- | --- |
| Framework | React 18 + Vite + TypeScript (SPA) |
| Styling / UI | Tailwind CSS + shadcn/ui-compatible components (Radix-ready) |
| Routing | React Router v6 |
| Server state | TanStack Query |
| Client/UI state | Zustand |
| Forms / validation | React Hook Form + Zod |
| Backend | Supabase — Postgres, Auth, Storage, Edge Functions, RLS |
| Auth | Supabase Auth with **Google** OAuth (PKCE) |
| Payments | Square (hosted invoices + payment links + webhooks) — *Phase 3* |
| Future native | Capacitor wraps the Vite `dist/` build — *Phase 5* |

Later phases add: dnd-kit (Kanban), FullCalendar (scheduling), vite-plugin-pwa
(installable PWA + service worker).

## Project Structure
```
src/
  app/            App.tsx (providers + auth bootstrap), routes.tsx
  components/
    ui/           Button, Card, Spinner (shadcn-style primitives)
    layout/       AppLayout (sidebar/drawer), PlaceholderPage
  features/
    auth/         LoginPage, AuthCallback, ProtectedRoute, useAuth
    dashboard/    DashboardPage (stat-card shell)
    clients/ jobs/ calendar/ billing/ settings/   (phase shells)
  lib/            supabase.ts (client), queryClient.ts, utils.ts (cn)
  services/       auth.ts  (the only auth boundary; web→native swap point)
  stores/         authStore.ts (Zustand session store)
  types/          database.types.ts (regenerate via `supabase gen types`)
supabase/
  config.toml
  migrations/     0001_extensions → 0005_storage
  functions/      (Square Edge Functions — added in Phase 3)
```

## Authentication Flow (Google)
1. `LoginPage` calls `signInWithGoogle()` (`src/services/auth.ts`), which invokes
   `supabase.auth.signInWithOAuth({ provider: 'google', redirectTo: '/auth/callback' })`.
2. The browser redirects to Google, then back to **`/auth/callback`**.
3. supabase-js (`detectSessionInUrl`, PKCE) exchanges the code for a session and
   persists it in `localStorage`.
4. `useAuthBootstrap()` (mounted in `App.tsx`) loads the session and subscribes to
   `onAuthStateChange`, storing it in the Zustand `authStore`.
5. `ProtectedRoute` gates `/app/*`: logged-out users → `/login`; while the initial
   session check runs it shows a spinner (no login flash). `LoginPage` redirects
   already-authenticated users to `/app/dashboard`.

**Auth is isolated behind `src/services/auth.ts`** so swapping the web OAuth flow
for a native Capacitor Google sign-in (Phase 5) is a single-file change.

## Data Model & Multi-Tenancy
The schema is **team-ready from day one** even though it starts solo:
- Every business row carries `org_id`, `created_by`, `created_at`, `updated_at`
  (and `deleted_at` for soft-deletable records).
- `organizations` + `memberships(role: owner|admin|member)` provide tenancy and
  roles; `profiles` mirrors `auth.users`.
- **Money is integer cents only** — never floats.
- A first-login trigger (`handle_new_user`) auto-creates a profile, a personal
  organization, and an owner membership, so new users land in a ready workspace.

Tables: `profiles`, `organizations`, `memberships`, `clients`, `client_addresses`,
`jobs`, `visits`, `quotes`, `quote_items`, `invoices`, `invoice_items`, `payments`,
`attachments`, `activity_log`, `square_connections`, `square_webhook_events`.

## Security (Row Level Security)
RLS is enabled on **every** table, default-deny:
- Helpers `current_profile_id()`, `is_org_member(org_id)`, and
  `has_org_role(org_id, roles[])` (all `security definer`, fixed `search_path`).
- Members can read/insert/update rows only within their orgs (`USING` + `WITH CHECK`).
- Only owner/admin manage `memberships` and `square_connections`.
- Financial records are never hard-deleted (no delete policy → deny); clients/jobs
  use soft delete. `square_webhook_events` has no policies — only the service role
  (Edge Function) touches it.
- Storage bucket `job-attachments` (private) is access-scoped by the `org_id` path
  segment, mirroring table RLS.

## Square Integration (Phase 3 — not yet built)
- App never handles card data; all card payments happen on Square-hosted pages.
- Edge Functions create/publish Square invoices or payment links and store the
  Square IDs + `public_url` on our `invoices` row.
- A signed webhook (`invoice.payment_made` / `payment.updated`) verifies the
  `x-square-hmacsha256-signature` over the raw body, dedupes via
  `square_webhook_events`, records the payment, recomputes the balance, and flips
  the invoice/job to paid. Manual payment recording is the fallback.

## Build Phases
- **Phase 0 (this milestone):** scaffold, Google auth, protected routes, full DB
  schema + triggers + RLS + storage, app shell. ✅
- **Phase 1:** Clients & Jobs CRUD + Kanban pipeline + live dashboard.
- **Phase 2:** Scheduling (FullCalendar).
- **Phase 3:** Billing & Square.
- **Phase 4:** PWA install + photos + reminders.
- **Phase 5:** Capacitor native wrap + team features.
