// Edge function: create + publish a Square invoice for one of our invoices.
//
// Flow:
//   1. Load our invoice + client + items (service role, bypasses RLS).
//   2. Ensure a Square customer exists for the client (store square_customer_id).
//   3. Create a Square order from the line items (amounts in integer cents).
//   4. Create + publish a Square invoice for that order.
//   5. Persist square_order_id / square_invoice_id / square_public_url and mark
//      our invoice 'sent' with sent_at.
//
// Returns: { square_public_url }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import {
  getSquareConfig,
  idempotencyKey,
  squareFetch,
} from "../_shared/square.ts";

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price_cents: number;
  taxable: boolean;
  sort_order: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { invoice_id } = await req.json();
    if (!invoice_id) return jsonResponse({ error: "invoice_id required" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const cfg = getSquareConfig();

    // 1. Load invoice + client + items.
    const { data: invoice, error: invErr } = await supabase
      .from("invoices")
      .select(
        "*, client:clients(*), items:invoice_items(description, quantity, unit_price_cents, taxable, sort_order)",
      )
      .eq("id", invoice_id)
      .single();
    if (invErr) throw invErr;
    if (!invoice) return jsonResponse({ error: "invoice not found" }, 404);

    const client = invoice.client as
      | {
          id: string;
          display_name: string;
          email: string | null;
          phone: string | null;
          square_customer_id: string | null;
        }
      | null;
    if (!client) {
      return jsonResponse(
        { error: "invoice has no client to bill" },
        400,
      );
    }

    const currency = invoice.currency ?? "CAD";
    const items = ((invoice.items ?? []) as InvoiceItem[]).sort(
      (a, b) => a.sort_order - b.sort_order,
    );
    if (items.length === 0) {
      return jsonResponse({ error: "invoice has no line items" }, 400);
    }

    // 2. Ensure a Square customer.
    let squareCustomerId = client.square_customer_id;
    if (!squareCustomerId) {
      const [givenName, ...rest] = client.display_name.split(" ");
      const created = await squareFetch<{ customer: { id: string } }>(
        cfg,
        "/v2/customers",
        {
          method: "POST",
          body: {
            idempotency_key: idempotencyKey(),
            given_name: givenName,
            family_name: rest.join(" ") || undefined,
            email_address: client.email ?? undefined,
            phone_number: client.phone ?? undefined,
          },
        },
      );
      squareCustomerId = created.customer.id;
      await supabase
        .from("clients")
        .update({ square_customer_id: squareCustomerId })
        .eq("id", client.id);
    }

    // 3. Create a Square order. Tax is folded into a single line-item-level tax
    //    using our precomputed tax_cents to guarantee totals match exactly.
    const lineItems = items.map((item) => ({
      name: item.description || "Item",
      quantity: String(item.quantity),
      base_price_money: {
        amount: item.unit_price_cents,
        currency,
      },
    }));

    const orderBody: Record<string, unknown> = {
      idempotency_key: idempotencyKey(),
      order: {
        location_id: cfg.locationId,
        customer_id: squareCustomerId,
        line_items: lineItems,
      },
    };

    // Represent tax as a fixed-amount service charge so the Square order total
    // equals our total_cents regardless of per-line rounding.
    if (invoice.tax_cents > 0) {
      (orderBody.order as Record<string, unknown>).service_charges = [
        {
          name: "Tax",
          amount_money: { amount: invoice.tax_cents, currency },
          calculation_phase: "TOTAL_PHASE",
          taxable: false,
        },
      ];
    }

    const orderRes = await squareFetch<{ order: { id: string } }>(
      cfg,
      "/v2/orders",
      { method: "POST", body: orderBody },
    );
    const squareOrderId = orderRes.order.id;

    // 4. Create the Square invoice from the order.
    const dueDate = invoice.due_at
      ? new Date(invoice.due_at).toISOString().slice(0, 10)
      : undefined;

    const invoiceRes = await squareFetch<{
      invoice: { id: string; version: number };
    }>(cfg, "/v2/invoices", {
      method: "POST",
      body: {
        idempotency_key: idempotencyKey(),
        invoice: {
          location_id: cfg.locationId,
          order_id: squareOrderId,
          primary_recipient: { customer_id: squareCustomerId },
          delivery_method: "SHARE_MANUALLY",
          accepted_payment_methods: { card: true },
          payment_requests: [
            {
              request_type: "BALANCE",
              due_date: dueDate,
            },
          ],
        },
      },
    });
    const squareInvoiceId = invoiceRes.invoice.id;
    const version = invoiceRes.invoice.version;

    // 4b. Publish the invoice so it gets a public URL.
    const published = await squareFetch<{
      invoice: { public_url?: string };
    }>(cfg, `/v2/invoices/${squareInvoiceId}/publish`, {
      method: "POST",
      body: { idempotency_key: idempotencyKey(), version },
    });
    const publicUrl = published.invoice.public_url ?? null;

    // 5. Persist on our invoice.
    const { error: updErr } = await supabase
      .from("invoices")
      .update({
        square_order_id: squareOrderId,
        square_invoice_id: squareInvoiceId,
        square_public_url: publicUrl,
        status: "sent",
        sent_at: new Date().toISOString(),
      })
      .eq("id", invoice_id);
    if (updErr) throw updErr;

    return jsonResponse({ square_public_url: publicUrl });
  } catch (err) {
    console.error("square-create-invoice error:", err);
    return jsonResponse(
      { error: err instanceof Error ? err.message : "unknown error" },
      500,
    );
  }
});
