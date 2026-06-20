import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database.types";
import {
  computeTotals,
  createInvoice,
  type InvoiceItemInput,
  type InvoiceRow,
} from "@/services/invoices";

export type QuoteRow = Database["public"]["Tables"]["quotes"]["Row"];
export type QuoteItemRow = Database["public"]["Tables"]["quote_items"]["Row"];
export type QuoteStatus = Database["public"]["Enums"]["quote_status"];

export interface QuoteClientRef {
  id: string;
  display_name: string;
  email: string | null;
  phone: string | null;
}
export interface QuoteJobRef {
  id: string;
  title: string;
}

export interface QuoteWithRefs extends QuoteRow {
  client: QuoteClientRef | null;
  job: QuoteJobRef | null;
}

export interface QuoteDetail extends QuoteWithRefs {
  items: QuoteItemRow[];
}

/** Reuse the invoice line-item shape (price already in cents). */
export type QuoteItemInput = InvoiceItemInput;

const LIST_SELECT =
  "*, client:clients(id, display_name, email, phone), job:jobs(id, title)";

// ── Reads ────────────────────────────────────────────────────────────────────

export async function listQuotes(): Promise<QuoteWithRefs[]> {
  const { data, error } = await supabase
    .from("quotes")
    .select(LIST_SELECT)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as QuoteWithRefs[];
}

export async function getQuote(id: string): Promise<QuoteDetail> {
  const { data, error } = await supabase
    .from("quotes")
    .select(`${LIST_SELECT}, items:quote_items(*)`)
    .eq("id", id)
    .single();
  if (error) throw error;
  const detail = data as unknown as QuoteDetail;
  detail.items = [...(detail.items ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  return detail;
}

// ── Create / update ──────────────────────────────────────────────────────────

export interface CreateQuoteInput {
  orgId: string;
  clientId?: string | null;
  jobId?: string | null;
  items: QuoteItemInput[];
  taxRatePercent?: number;
  expiresAt?: string | null;
  currency?: string;
}

export async function createQuote(input: CreateQuoteInput): Promise<QuoteRow> {
  const totals = computeTotals(input.items, input.taxRatePercent ?? 0);

  const { data: quote, error } = await supabase
    .from("quotes")
    .insert({
      org_id: input.orgId,
      client_id: input.clientId ?? null,
      job_id: input.jobId ?? null,
      currency: input.currency ?? "CAD",
      status: "draft",
      subtotal_cents: totals.subtotalCents,
      tax_cents: totals.taxCents,
      total_cents: totals.totalCents,
      expires_at: input.expiresAt ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;

  await insertQuoteItems(quote.id, input.orgId, input.items);
  return quote;
}

export interface UpdateQuoteInput {
  clientId?: string | null;
  jobId?: string | null;
  items?: QuoteItemInput[];
  taxRatePercent?: number;
  expiresAt?: string | null;
  status?: QuoteStatus;
}

export async function updateQuote(
  id: string,
  input: UpdateQuoteInput,
): Promise<QuoteRow> {
  const patch: Database["public"]["Tables"]["quotes"]["Update"] = {};
  if (input.clientId !== undefined) patch.client_id = input.clientId;
  if (input.jobId !== undefined) patch.job_id = input.jobId;
  if (input.expiresAt !== undefined) patch.expires_at = input.expiresAt;
  if (input.status !== undefined) patch.status = input.status;

  if (input.items) {
    const { data: existing, error: exErr } = await supabase
      .from("quotes")
      .select("org_id")
      .eq("id", id)
      .single();
    if (exErr) throw exErr;

    const totals = computeTotals(input.items, input.taxRatePercent ?? 0);
    patch.subtotal_cents = totals.subtotalCents;
    patch.tax_cents = totals.taxCents;
    patch.total_cents = totals.totalCents;

    const { error: delErr } = await supabase
      .from("quote_items")
      .delete()
      .eq("quote_id", id);
    if (delErr) throw delErr;

    await insertQuoteItems(id, existing.org_id, input.items);
  }

  const { data: updated, error } = await supabase
    .from("quotes")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return updated;
}

async function insertQuoteItems(
  quoteId: string,
  orgId: string,
  items: QuoteItemInput[],
): Promise<void> {
  if (items.length === 0) return;
  const rows = items.map((item, index) => ({
    quote_id: quoteId,
    org_id: orgId,
    description: item.description.trim(),
    quantity: item.quantity,
    unit_price_cents: item.unit_price_cents,
    taxable: item.taxable,
    sort_order: index,
  }));
  const { error } = await supabase.from("quote_items").insert(rows);
  if (error) throw error;
}

// ── Convert to invoice ───────────────────────────────────────────────────────

/**
 * Creates an invoice from a quote's line items (copying tax via the precomputed
 * total) and marks the quote 'converted'. Tax rate is back-derived from the
 * quote's stored tax/subtotal so the invoice total matches exactly.
 */
export async function convertQuoteToInvoice(
  quoteId: string,
  ctx: { orgId: string; createdBy: string },
): Promise<InvoiceRow> {
  const quote = await getQuote(quoteId);

  const items: InvoiceItemInput[] = quote.items.map((item) => ({
    description: item.description,
    quantity: item.quantity,
    unit_price_cents: item.unit_price_cents,
    taxable: item.taxable,
  }));

  // Re-derive the effective tax rate from the quote's taxable base so the
  // invoice reproduces the same tax/total in integer cents.
  const taxableBase = quote.items
    .filter((i) => i.taxable)
    .reduce((sum, i) => sum + Math.round(i.unit_price_cents * i.quantity), 0);
  const taxRatePercent =
    taxableBase > 0 ? (quote.tax_cents / taxableBase) * 100 : 0;

  const invoice = await createInvoice({
    orgId: ctx.orgId,
    createdBy: ctx.createdBy,
    clientId: quote.client_id,
    jobId: quote.job_id,
    items,
    taxRatePercent,
    currency: quote.currency,
  });

  await updateQuote(quoteId, { status: "converted" });
  return invoice;
}
