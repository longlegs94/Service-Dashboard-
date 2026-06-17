# Service Dashboard — Job Management App

A field-service management app to organize jobs, scheduling, and billing — inspired by **Jobber** and **ServiceTitan**, scaled to fit a single operator or small crew.

> **Goal:** One place to track every job from first inquiry to paid invoice. Know where each job stands, what's scheduled this week, and who still owes you money — without juggling notebooks, texts, and spreadsheets.

---

## Table of Contents

1. [What This App Does](#what-this-app-does)
2. [Core Concepts](#core-concepts)
3. [The Job Lifecycle (Pipeline)](#the-job-lifecycle-pipeline)
4. [Features](#features)
5. [Screens / Pages](#screens--pages)
6. [Data Model](#data-model)
7. [Suggested Tech Stack](#suggested-tech-stack)
8. [Build Roadmap (Phases)](#build-roadmap-phases)
9. [Future Ideas](#future-ideas)

---

## What This App Does

The app gives you control over the three things that run a service business:

| Area | What it covers |
| --- | --- |
| 🗂️ **Jobs** | Track every job and exactly where it sits in your process — from a new lead to a finished, paid job. |
| 📅 **Schedule** | Book jobs onto a calendar, see your day/week/month at a glance, and avoid double-booking. |
| 💵 **Billing** | Create quotes, send invoices, record payments, and see who still owes you money. |

The whole point is **organization and visibility**: open the app and immediately know what's pending, what's happening today, and what money is outstanding.

---

## Core Concepts

- **Client** — A customer. Has contact info, address(es), and a history of jobs.
- **Job** — A single piece of work for a client. Moves through stages (the pipeline). Has a status, schedule, line items, and notes.
- **Quote / Estimate** — A proposed price sent to a client before work begins. Can be approved → converted into a job.
- **Visit / Appointment** — A scheduled time block when work happens. A job may have one or many visits.
- **Invoice** — A bill sent after work is done. Tracks amount due, due date, and payment status.
- **Payment** — Money received against an invoice (full or partial).

---

## The Job Lifecycle (Pipeline)

Every job flows through a clear set of stages so you always know where you are:

```
  ┌──────────┐   ┌──────────┐   ┌───────────┐   ┌────────────┐   ┌──────────┐   ┌────────┐   ┌──────┐
  │   LEAD   │ → │  QUOTED  │ → │ SCHEDULED │ → │ IN PROGRESS│ → │ COMPLETE │ → │ INVOICED│ → │ PAID │
  └──────────┘   └──────────┘   └───────────┘   └────────────┘   └──────────┘   └────────┘   └──────┘
```

| Stage | Meaning | What you do here |
| --- | --- | --- |
| **Lead** | New inquiry / request | Capture client + job details |
| **Quoted** | Estimate sent, awaiting approval | Build & send quote, follow up |
| **Scheduled** | Approved and booked on the calendar | Assign date/time, confirm with client |
| **In Progress** | Work has started | Track progress, log notes/photos |
| **Complete** | Work finished, not yet billed | Mark done, prep invoice |
| **Invoiced** | Bill sent, awaiting payment | Send invoice, set due date |
| **Paid** | Money collected | Close out, archive |

A job can also be **On Hold** or **Cancelled** at any point.

---

## Features

### 🗂️ Job Management
- Add new jobs with a few taps (client, description, address, price).
- Drag-and-drop **pipeline board** (Kanban) to move jobs between stages.
- Job detail page: notes, photos, checklist/tasks, attached files.
- Filter & search by client, status, date, or amount.
- Quick view of **pending jobs** vs **active jobs** vs **completed**.

### 📅 Scheduling
- Calendar with **day / week / month** views.
- Book a job onto a date/time slot; reschedule by dragging.
- See unscheduled jobs that still need a slot.
- Reminders for upcoming jobs (and optional client reminders).
- Avoid conflicts with simple availability checks.

### 💵 Billing & Money Collection
- Build **quotes/estimates** with line items (labor, materials, qty, price).
- One-click **convert quote → job → invoice**.
- Track invoice status: **Draft · Sent · Overdue · Paid**.
- Record **full or partial payments** and payment method.
- **Accounts Receivable** view: a running list of who owes what and how overdue.
- Totals: revenue this month, outstanding balance, paid vs unpaid.

### 👥 Client Management
- Client profiles with contact info and multiple addresses.
- Full job history per client.
- Notes and tags (e.g., "VIP", "slow payer").

### 📊 Dashboard / Overview
- Snapshot of the business right now:
  - Jobs by stage (counts)
  - Today's & this week's schedule
  - Outstanding money / overdue invoices
  - Recent activity

---

## Screens / Pages

| Screen | Purpose |
| --- | --- |
| **Dashboard** | At-a-glance overview of jobs, schedule, and money owed. |
| **Jobs (Pipeline)** | Kanban board of all jobs by stage; add/move jobs. |
| **Job Detail** | Everything about one job: status, schedule, line items, notes, photos. |
| **Calendar** | Day/week/month scheduling view. |
| **Clients** | List and detail pages for customers + their history. |
| **Quotes** | Create, send, and track estimates. |
| **Invoices** | Create, send, and track bills + payments. |
| **Money / Reports** | Receivables, revenue, and basic reporting. |
| **Settings** | Business info, services/price list, tax rate, reminders. |

---

## Data Model

A starting schema (adjust as needed):

```
Client
  id, name, phone, email, company,
  addresses[], notes, tags[], created_at

Job
  id, client_id, title, description,
  status (lead|quoted|scheduled|in_progress|complete|invoiced|paid|on_hold|cancelled),
  address, scheduled_for, completed_at,
  line_items[], total, notes, photos[], created_at

Quote
  id, job_id, client_id, line_items[], subtotal, tax, total,
  status (draft|sent|approved|declined), valid_until, created_at

Visit (Appointment)
  id, job_id, start_time, end_time, assigned_to, notes

Invoice
  id, job_id, client_id, line_items[], subtotal, tax, total,
  amount_paid, balance_due, due_date,
  status (draft|sent|overdue|paid), created_at

Payment
  id, invoice_id, amount, method (cash|card|check|transfer),
  paid_at, notes

LineItem
  id, description, type (labor|material), quantity, unit_price, total
```

---

## Suggested Tech Stack

Pick based on whether you want web, mobile, or both. A practical default:

| Layer | Recommendation | Why |
| --- | --- | --- |
| **Frontend** | React + Vite (web) or React Native / Expo (mobile) | Works on phone and desktop; huge ecosystem. |
| **UI** | Tailwind CSS + a component lib (shadcn/ui) | Fast, clean, responsive out of the box. |
| **Backend / DB** | Supabase (Postgres + Auth + Storage) | Database, login, and file/photo storage in one; minimal setup. |
| **Calendar** | FullCalendar or react-big-calendar | Drag-and-drop scheduling ready to go. |
| **Payments (optional)** | Stripe | Send payment links, collect card payments online. |
| **Hosting** | Vercel | One-click deploy for the web app. |

> Keep it simple to start — a single web app backed by Supabase covers jobs, scheduling, and billing without much infrastructure.

---

## Build Roadmap (Phases)

**Phase 1 — Core organization (MVP)**
- [ ] Client list + add/edit clients
- [ ] Job list + add/edit jobs with status
- [ ] Pipeline (Kanban) board to move jobs between stages
- [ ] Basic dashboard counts

**Phase 2 — Scheduling**
- [ ] Calendar view (week/month)
- [ ] Schedule jobs onto dates; reschedule
- [ ] Upcoming-job reminders

**Phase 3 — Billing & money**
- [ ] Quotes with line items
- [ ] Invoices + invoice statuses
- [ ] Record payments (full/partial)
- [ ] Accounts receivable / "who owes me" view

**Phase 4 — Polish**
- [ ] Photos & file attachments on jobs
- [ ] Client-facing quote/invoice links
- [ ] Reports (revenue, outstanding, jobs completed)
- [ ] Online payments (Stripe)

---

## Future Ideas

- 📱 Mobile app for updating job status and snapping photos in the field.
- 🔔 Automated text/email reminders to clients before appointments.
- ⭐ Review requests sent automatically after a job is marked paid.
- 👷 Multi-crew support: assign jobs to team members.
- 🔁 Recurring jobs (e.g., monthly maintenance) that auto-generate.
- 📈 Profit tracking: materials cost vs. price charged per job.
- 🗺️ Map/route view to plan the day's jobs by location.

---

*This document is a planning blueprint for the Service Dashboard job-management app. Update it as the product takes shape.*
