---
name: homepro-booking-pipeline
description: >
  The end-to-end booking system of the HomePro website: wizard UI → shared Zod
  validation → /api/bookings → Supabase insert → best-effort Resend email → reference
  number back to the customer. Load this when changing ANYTHING about bookings —
  adding/removing/renaming a form field (there is a mandatory 4-place checklist),
  changing time windows, viewing or managing booking rows, handling "where do
  bookings go", "add a field to the form", "change the booking email", "mark a
  booking confirmed", restoring the paused database, or wiring the booking → chat
  prefill handoff. Includes the exact Supabase project identity and the status
  workflow for rows.
---

# HomePro booking pipeline

**When NOT to use this skill:** bookings failing right now →
`homepro-debugging-playbook` first. Env var values → `homepro-config-and-env`.

## Flow of one booking (files in order)

1. **Entry**: `/book` (`src/app/book/page.tsx`) renders `BookingWizard` in `<Suspense>`
   (required — the wizard calls `useSearchParams`).
2. **Prefill**: `?appliance=<service-slug>&problem=<text>` query params pre-select the
   appliance and problem text — this is how the AI chat hands off
   (`/book?appliance=washer-repair&problem=...`).
3. **Wizard**: `src/components/booking/booking-wizard.tsx` — 3 steps
   (appliance+brand → problem+date+time window → contact), per-step validation via
   `bookingSchema.pick(...)`, hidden honeypot field `company` (bots fill it; humans
   never see it).
4. **Validation contract**: `src/lib/booking-schema.ts` — ONE Zod schema used by both
   wizard and API (architecture invariant 4). Also exports `timeWindows`
   (morning/afternoon/flexible with labels).
5. **API**: `POST /api/bookings` (`src/app/api/bookings/route.ts`):
   parse → validate (400) → honeypot? fake success, store nothing → generate reference
   `HP-` + 6 chars from a 32-char unambiguous alphabet → Supabase insert (503 if env
   missing, 500 if insert fails) → Resend email inside try/catch (failure logged,
   booking still succeeds) → `{ reference, phone }`.
6. **Confirmation**: wizard shows the reference; customer told they'll be called.

## Database (single source of truth)

- Project: `service-dashboard`, id `elmghaklnqigrcgvodwk`, region ca-central-1,
  org "Jindal Control Base" (as of 2026-07-04).
- Table: `public.bookings` — columns: id, created_at, reference (unique), name, phone,
  email, address, city, appliance_type, brand (nullable), problem, preferred_date,
  preferred_time_window, status. Schema of record:
  `supabase/migrations/001_bookings.sql`.
- **RLS enabled, zero policies — intentional** (service-role-only; see
  `homepro-architecture-contract`).
- View/manage rows: Supabase dashboard → Table Editor → bookings, or MCP `execute_sql`.

### Status workflow (the `status` column, DB-enforced check constraint)

`new` → `confirmed` (appointment set) → `completed` | `cancelled`.
The website only ever writes `new`; humans (or future admin tooling) advance it.

```sql
-- Today's new bookings:
select reference, name, phone, appliance_type, preferred_date, status
from bookings where created_at::date = current_date order by created_at desc;
-- Confirm one:
update bookings set status = 'confirmed' where reference = 'HP-XXXXXX';
```

### Paused-project recovery (recurring on free tier)

MCP `get_project` (id above) → if `INACTIVE`: `restore_project`, poll every ~45 s
through `COMING_UP` (~6-7 min, looks stuck, isn't) → `RESTORING` → `ACTIVE_HEALTHY`.
Budget 8–15 min. Bookings 500 during the outage; the site otherwise works.

## THE 4-PLACE CHECKLIST — changing any form field

A field change is FOUR synchronized edits; missing one breaks silently at runtime:

| # | Place | What to edit |
|---|---|---|
| 1 | `src/lib/booking-schema.ts` | Add/modify the field in `bookingSchema` (validation + error message) |
| 2 | `src/components/booking/booking-wizard.tsx` | Form state initializer, the input UI in the right step, AND `stepFields` array (controls which step validates it) |
| 3 | `src/app/api/bookings/route.ts` | The `.insert({...})` mapping (camelCase field → snake_case column) AND the notification email body |
| 4 | `supabase/migrations/` | NEW migration file (e.g. `002_add_<field>.sql` with `alter table public.bookings add column ...`) — then APPLY it to the live project (MCP `apply_migration` or dashboard SQL editor). Committing the file does not change the database |

Verify after: `npm run build`, then a full wizard walk-through locally, then confirm
the row lands with the new column populated (`select * from bookings order by
created_at desc limit 1`).

## Email notification specifics

- Sends only if BOTH `RESEND_API_KEY` and `BOOKING_NOTIFICATION_EMAIL` are set.
- `from: "Bookings <onboarding@resend.dev>"` — works without domain verification but
  may land in spam; after verifying a domain in Resend, change to that domain.
- `replyTo` is set to the customer's email — replying to the notification emails the
  customer directly.
- Email failure NEVER fails the booking (logged as
  `Booking email failed (booking is saved):`).

## Provenance and maintenance

| Fact | Re-verify with |
|---|---|
| Route order (validate → honeypot → insert → email) | `grep -n "safeParse\|company\|insert\|resend" src/app/api/bookings/route.ts \| head` |
| Schema/wizard/API triple-use | `grep -rln "bookingSchema" src/` |
| Column list matches insert mapping | read the `.insert({...})` block in `src/app/api/bookings/route.ts` against the columns in `supabase/migrations/001_bookings.sql` — note `reference` uses JS shorthand (`reference,` not `reference:`), and `id`/`created_at` are DB defaults that never appear in the insert |
| Live table exists + status values | MCP `list_tables`; `grep -n "check (status" supabase/migrations/001_bookings.sql` |
| Reference format | `grep -n "makeReference" -A 8 src/app/api/bookings/route.ts` |
| Chat handoff param names | `grep -n "appliance\|problem" src/components/booking/booking-wizard.tsx \| head -5` |
| Supabase project id | MCP `list_projects` |
