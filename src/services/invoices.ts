import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database.types";

export type InvoiceRow = Database["public"]["Tables"]["invoices"]["Row"];
export type InvoiceItemRow =
  Database["public"]["Tables"]["invoice_items"]["Row"];
export type InvoiceStatus = Database["public"]["Enums"]["invoice_status"];
export type PaymentRow = Database["public"]["Tables"]["payments"]["Row"];

/** Minimal client/job shapes joined into list + detail views. */
export interface InvoiceClientRef {
  id: string;
  display_name: string;
  email: string | null;
  phone: string | null;
}
export interface InvoiceJobRef {
  id: string;
  title: string;
}

export interface InvoiceWithRefs extends InvoiceRow {
  client: InvoiceClientRef | null;
  job: InvoiceJobRef | null;
}

export interface InvoiceDetail extends InvoiceWithRefs {
  items: InvoiceItemRow[];
  payments: PaymentRow[];
}

/** A single line item as entered/edited in the builder (price already in cents). */
export interface InvoiceItemInput {
  description: string;
  quantity: number;
  unit_price_cents: number;
  taxable: boolean;
}

const LIST_SELECT =
  "*, client:clients(id, display_name, email, phone), job:jobs(id, title)";

// ── Totals math (integer cents only) ─────────────────────────────────────────

export interface InvoiceTotals {
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
}

/**
 * Computes subtotal / tax / total in integer cents. Tax applies only to taxable
 * line items. `taxRatePercent` is a human percent (e.g. 13 for 13%).
 */
export function computeTotals(
  items: InvoiceItemInput[],
  taxRatePercent = 0,
): InvoiceTotals {
  let subtotalCents = 0;
  let taxableBaseCents = 0;
  for (const item of items) {
    const lineCents = Math.round(item.unit_price_cents * item.quantity);
    subtotalCents += lineCents;
    if (item.taxable) taxableBaseCents += lineCents;
  }
  const taxCents = Math.round((taxableBaseCents * taxRatePercent) / 100);
  return { subtotalCents, taxCents, totalCents: subtotalCents + taxCents };
}

// ── Reads ────────────────────────────────────────────────────────────────────

export async function listInvoices(): Promise<InvoiceWithRefs[]> {
  const { data, error } = await supabase
    .from("invoices")
    .select(LIST_SELECT)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as InvoiceWithRefs[];
}

export async function getInvoice(id: string): Promise<InvoiceDetail> {
  const { data, error } = await supabase
    .from("invoices")
    .select(
      `${LIST_SELECT}, items:invoice_items(*), payments(*)`,
    )
    .eq("id", id)
    .single();
  if (error) throw error;
  const detail = data as unknown as InvoiceDetail & {
    items: InvoiceItemRow[];
  };
  // Stable item ordering by sort_order.
  detail.items = [...(detail.items ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  detail.payments = [...(detail.payments ?? [])].sort((a, b) =>
    a.paid_at < b.paid_at ? 1 : -1,
  );
  return detail;
}

// ── Create / update ──────────────────────────────────────────────────────────

export interface CreateInvoiceInput {
  orgId: string;
  createdBy: string;
  clientId?: string | null;
  jobId?: string | null;
  items: InvoiceItemInput[];
  taxRatePercent?: number;
  dueAt?: string | null;
  currency?: string;
}

export async function createInvoice(
  input: CreateInvoiceInput,
): Promise<InvoiceRow> {
  const totals = computeTotals(input.items, input.taxRatePercent ?? 0);

  const { data: invoice, error } = await supabase
    .from("invoices")
    .insert({
      org_id: input.orgId,
      client_id: input.clientId ?? null,
      job_id: input.jobId ?? null,
      currency: input.currency ?? "CAD",
      status: "draft",
      subtotal_cents: totals.subtotalCents,
      tax_cents: totals.taxCents,
      total_cents: totals.totalCents,
      amount_paid_cents: 0,
      balance_due_cents: totals.totalCents,
      due_at: input.dueAt ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;

  await insertItems(invoice.id, input.orgId, input.items);
  return invoice;
}

export interface UpdateInvoiceInput {
  clientId?: string | null;
  jobId?: string | null;
  items?: InvoiceItemInput[];
  taxRatePercent?: number;
  dueAt?: string | null;
}

/**
 * Updates an invoice's header and (if `items` provided) replaces all line items
 * and recomputes subtotal/tax/total. Preserves amount_paid by recomputing the
 * balance/status from existing payments afterward.
 */
export async function updateInvoice(
  id: string,
  input: UpdateInvoiceInput,
): Promise<InvoiceRow> {
  const patch: Database["public"]["Tables"]["invoices"]["Update"] = {};
  if (input.clientId !== undefined) patch.client_id = input.clientId;
  if (input.jobId !== undefined) patch.job_id = input.jobId;
  if (input.dueAt !== undefined) patch.due_at = input.dueAt;

  if (input.items) {
    const { data: existing, error: exErr } = await supabase
      .from("invoices")
      .select("org_id")
      .eq("id", id)
      .single();
    if (exErr) throw exErr;

    const totals = computeTotals(input.items, input.taxRatePercent ?? 0);
    patch.subtotal_cents = totals.subtotalCents;
    patch.tax_cents = totals.taxCents;
    patch.total_cents = totals.totalCents;

    const { error: delErr } = await supabase
      .from("invoice_items")
      .delete()
      .eq("invoice_id", id);
    if (delErr) throw delErr;

    await insertItems(id, existing.org_id, input.items);
  }

  const { error } = await supabase
    .from("invoices")
    .update(patch)
    .eq("id", id);
  if (error) throw error;

  // Totals may have changed → recompute balance/status from payments. Return
  // the recomputed row so callers see fresh balance_due/status.
  return recomputeInvoice(id);
}

async function insertItems(
  invoiceId: string,
  orgId: string,
  items: InvoiceItemInput[],
): Promise<void> {
  if (items.length === 0) return;
  const rows = items.map((item, index) => ({
    invoice_id: invoiceId,
    org_id: orgId,
    description: item.description.trim(),
    quantity: item.quantity,
    unit_price_cents: item.unit_price_cents,
    taxable: item.taxable,
    sort_order: index,
  }));
  const { error } = await supabase.from("invoice_items").insert(rows);
  if (error) throw error;
}

// ── Recompute ────────────────────────────────────────────────────────────────

/**
 * Recomputes amount_paid (sum of payments), balance_due, and status from the
 * current payments + total. Drives status transitions:
 *   - balance <= 0  → paid (+ paid_at), and the linked job → 'paid'
 *   - 0 < paid      → partially_paid
 *   - paid == 0     → keep draft/sent/overdue as-is (don't downgrade a sent inv.)
 */
export async function recomputeInvoice(id: string): Promise<InvoiceRow> {
  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("id, total_cents, status, paid_at, job_id")
    .eq("id", id)
    .single();
  if (error) throw error;

  const { data: payments, error: payErr } = await supabase
    .from("payments")
    .select("amount_cents")
    .eq("invoice_id", id);
  if (payErr) throw payErr;

  const amountPaid = (payments ?? []).reduce(
    (sum, p) => sum + p.amount_cents,
    0,
  );
  const balance = invoice.total_cents - amountPaid;

  let status: InvoiceStatus = invoice.status;
  let paidAt: string | null = invoice.paid_at;

  if (balance <= 0 && invoice.total_cents > 0) {
    status = "paid";
    paidAt = paidAt ?? new Date().toISOString();
  } else if (amountPaid > 0) {
    status = "partially_paid";
    paidAt = null;
  } else {
    // No payments: don't force a status. Leave draft/sent/overdue intact,
    // but pull back out of paid/partially_paid if payments were removed.
    if (status === "paid" || status === "partially_paid") status = "sent";
    paidAt = null;
  }

  const { data: updated, error: updErr } = await supabase
    .from("invoices")
    .update({
      amount_paid_cents: amountPaid,
      balance_due_cents: balance,
      status,
      paid_at: paidAt,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (updErr) throw updErr;

  // When fully paid, advance the linked job to 'paid'.
  if (status === "paid" && invoice.job_id) {
    const now = new Date().toISOString();
    await supabase
      .from("jobs")
      .update({ status: "paid", paid_at: now, completed_at: now })
      .eq("id", invoice.job_id);
  }

  return updated;
}

// ── Square edge-function bridges ─────────────────────────────────────────────

export interface SquareInvoiceResult {
  square_public_url: string | null;
}

/** Creates + publishes a Square invoice via the edge function; returns the public URL. */
export async function sendInvoiceViaSquare(
  id: string,
): Promise<SquareInvoiceResult> {
  const { data, error } = await supabase.functions.invoke(
    "square-create-invoice",
    { body: { invoice_id: id } },
  );
  if (error) throw error;
  return data as SquareInvoiceResult;
}

export interface SquarePaymentLinkResult {
  url: string | null;
}

/** Creates a Square hosted payment link for the invoice total; returns the URL. */
export async function createSquarePaymentLink(
  id: string,
): Promise<SquarePaymentLinkResult> {
  const { data, error } = await supabase.functions.invoke(
    "square-create-payment-link",
    { body: { invoice_id: id } },
  );
  if (error) throw error;
  return data as SquarePaymentLinkResult;
}
