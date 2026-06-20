// Edge function: Square webhook receiver.
//
// Security + correctness:
//   - Verify HMAC-SHA256 over (notificationUrl + rawBody) using the webhook
//     signature key. Reject with 401 on mismatch. (Web Crypto, constant work.)
//   - Idempotency: insert event_id into square_webhook_events; if it already
//     exists, return 200 without reprocessing.
//   - Handle invoice.payment_made and payment.updated: upsert a payments row
//     (dedupe on square_payment_id via the table's unique index), then recompute
//     the invoice's amount_paid / balance / status and advance the job to 'paid'
//     when fully paid.
//   - Always return 2xx quickly for handled/ignored events.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  getSquareConfig,
  squareFetch,
} from "../_shared/square.ts";

const SIGNATURE_HEADER = "x-square-hmacsha256-signature";

/** Verifies Square's HMAC-SHA256 signature over notificationUrl + rawBody. */
async function verifySignature(
  signatureKey: string,
  notificationUrl: string,
  rawBody: string,
  signatureHeader: string,
): Promise<boolean> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(signatureKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(notificationUrl + rawBody),
  );
  const expected = btoa(String.fromCharCode(...new Uint8Array(mac)));
  // Length-checked equality; both are base64 of a fixed-size digest.
  if (expected.length !== signatureHeader.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signatureHeader.charCodeAt(i);
  }
  return diff === 0;
}

interface ResolvedPayment {
  squarePaymentId: string;
  amountCents: number;
  currency: string;
  squareOrderId: string | null;
  squareInvoiceId: string | null;
  status: string;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("method not allowed", { status: 405 });
  }

  const rawBody = await req.text();
  const signatureKey = Deno.env.get("SQUARE_WEBHOOK_SIGNATURE_KEY");
  if (!signatureKey) {
    console.error("Missing SQUARE_WEBHOOK_SIGNATURE_KEY");
    return new Response("server misconfigured", { status: 500 });
  }

  // The notification URL must match exactly what's configured in Square. We use
  // the request URL; if Square is configured behind a different public URL set
  // SQUARE_WEBHOOK_NOTIFICATION_URL to override.
  const notificationUrl =
    Deno.env.get("SQUARE_WEBHOOK_NOTIFICATION_URL") ?? req.url;

  const signature = req.headers.get(SIGNATURE_HEADER) ?? "";
  const valid = await verifySignature(
    signatureKey,
    notificationUrl,
    rawBody,
    signature,
  );
  if (!valid) {
    console.warn("Square webhook signature verification failed");
    return new Response("invalid signature", { status: 401 });
  }

  let event: {
    event_id?: string;
    type?: string;
    data?: { object?: Record<string, unknown> };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response("bad json", { status: 400 });
  }

  const eventId = event.event_id;
  const eventType = event.type ?? "";
  if (!eventId) return new Response("missing event_id", { status: 400 });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Idempotency: if we've seen this event_id, ack and stop.
  const { error: insertEventErr } = await supabase
    .from("square_webhook_events")
    .insert({
      event_id: eventId,
      event_type: eventType,
      raw_payload: event,
      processed_at: new Date().toISOString(),
    });
  if (insertEventErr) {
    // Unique violation → already processed. Ack so Square stops retrying.
    if (insertEventErr.code === "23505") {
      return new Response("ok (duplicate)", { status: 200 });
    }
    console.error("Failed to record webhook event:", insertEventErr);
    return new Response("ok", { status: 200 });
  }

  try {
    const resolved = await resolvePayment(eventType, event);
    if (resolved) {
      await applyPayment(supabase, resolved);
    }
  } catch (err) {
    // Log but still ack: the event is recorded; reprocessing would be blocked by
    // idempotency anyway. Surfacing 5xx would cause Square to retry endlessly.
    console.error("square-webhook processing error:", err);
  }

  return new Response("ok", { status: 200 });
});

/**
 * Extracts the payment details we care about from the event. For
 * invoice.payment_made the payload references the invoice; we read the payment
 * from the Square API to get the canonical amount + payment id.
 */
async function resolvePayment(
  eventType: string,
  event: { data?: { object?: Record<string, unknown> } },
): Promise<ResolvedPayment | null> {
  const obj = event.data?.object ?? {};

  if (eventType === "payment.updated" || eventType === "payment.created") {
    const payment = obj.payment as Record<string, unknown> | undefined;
    if (!payment) return null;
    const status = String(payment.status ?? "");
    if (status !== "COMPLETED") return null;
    const money = payment.amount_money as
      | { amount?: number; currency?: string }
      | undefined;
    return {
      squarePaymentId: String(payment.id),
      amountCents: Number(money?.amount ?? 0),
      currency: String(money?.currency ?? "CAD"),
      squareOrderId: payment.order_id ? String(payment.order_id) : null,
      squareInvoiceId: null,
      status,
    };
  }

  if (eventType === "invoice.payment_made") {
    const invoice = obj.invoice as Record<string, unknown> | undefined;
    if (!invoice) return null;
    const squareInvoiceId = String(invoice.id);
    const orderId = invoice.order_id ? String(invoice.order_id) : null;

    // Fetch the latest completed payment on the invoice's order.
    const cfg = getSquareConfig();
    if (!orderId) return null;
    const orderRes = await squareFetch<{
      order?: { tenders?: Array<Record<string, unknown>> };
    }>(cfg, `/v2/orders/${orderId}`, { method: "GET" });
    const tenders = orderRes.order?.tenders ?? [];
    const tender = tenders[tenders.length - 1];
    if (!tender) return null;
    const money = tender.amount_money as
      | { amount?: number; currency?: string }
      | undefined;
    return {
      squarePaymentId: String(tender.payment_id ?? tender.id),
      amountCents: Number(money?.amount ?? 0),
      currency: String(money?.currency ?? "CAD"),
      squareOrderId: orderId,
      squareInvoiceId,
      status: "COMPLETED",
    };
  }

  return null;
}

/** Finds our invoice for the payment, upserts the payment, recomputes totals. */
async function applyPayment(
  supabase: ReturnType<typeof createClient>,
  p: ResolvedPayment,
): Promise<void> {
  if (!p.squarePaymentId || p.amountCents <= 0) return;

  // Locate our invoice by square_invoice_id or square_order_id.
  let invoiceQuery = supabase
    .from("invoices")
    .select("id, org_id, client_id, job_id, total_cents")
    .limit(1);
  if (p.squareInvoiceId) {
    invoiceQuery = invoiceQuery.eq("square_invoice_id", p.squareInvoiceId);
  } else if (p.squareOrderId) {
    invoiceQuery = invoiceQuery.eq("square_order_id", p.squareOrderId);
  } else {
    return;
  }
  const { data: invoice, error: invErr } = await invoiceQuery.maybeSingle();
  if (invErr) throw invErr;
  if (!invoice) return; // Payment not tied to one of our invoices.

  // Dedupe on square_payment_id (table has a unique index). If it exists, skip.
  const { data: existing } = await supabase
    .from("payments")
    .select("id")
    .eq("square_payment_id", p.squarePaymentId)
    .maybeSingle();

  if (!existing) {
    const { error: payErr } = await supabase.from("payments").insert({
      org_id: invoice.org_id,
      invoice_id: invoice.id,
      job_id: invoice.job_id,
      client_id: invoice.client_id,
      method: "square",
      amount_cents: p.amountCents,
      currency: p.currency,
      paid_at: new Date().toISOString(),
      square_payment_id: p.squarePaymentId,
    });
    // A concurrent webhook may have inserted first → ignore unique violation.
    if (payErr && payErr.code !== "23505") throw payErr;
  }

  await recomputeInvoice(supabase, invoice.id);
}

/** Mirror of services/invoices.recomputeInvoice, using the service-role client. */
async function recomputeInvoice(
  supabase: ReturnType<typeof createClient>,
  invoiceId: string,
): Promise<void> {
  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("id, total_cents, status, paid_at, job_id")
    .eq("id", invoiceId)
    .single();
  if (error) throw error;

  const { data: payments, error: payErr } = await supabase
    .from("payments")
    .select("amount_cents")
    .eq("invoice_id", invoiceId);
  if (payErr) throw payErr;

  const amountPaid = (payments ?? []).reduce(
    (sum: number, row: { amount_cents: number }) => sum + row.amount_cents,
    0,
  );
  const total = invoice.total_cents as number;
  const balance = total - amountPaid;

  let status = invoice.status as string;
  let paidAt = invoice.paid_at as string | null;

  if (balance <= 0 && total > 0) {
    status = "paid";
    paidAt = paidAt ?? new Date().toISOString();
  } else if (amountPaid > 0) {
    status = "partially_paid";
    paidAt = null;
  } else {
    if (status === "paid" || status === "partially_paid") status = "sent";
    paidAt = null;
  }

  await supabase
    .from("invoices")
    .update({
      amount_paid_cents: amountPaid,
      balance_due_cents: balance,
      status,
      paid_at: paidAt,
    })
    .eq("id", invoiceId);

  if (status === "paid" && invoice.job_id) {
    const now = new Date().toISOString();
    await supabase
      .from("jobs")
      .update({ status: "paid", paid_at: now, completed_at: now })
      .eq("id", invoice.job_id);
  }
}
