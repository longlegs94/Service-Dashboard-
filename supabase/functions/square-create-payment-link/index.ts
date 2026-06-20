// Edge function: create a Square hosted payment link (Checkout API) for an
// invoice's total. Stores the link id + URL on our invoice and returns the URL.
//
// Returns: { url }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import {
  getSquareConfig,
  idempotencyKey,
  squareFetch,
} from "../_shared/square.ts";

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

    const { data: invoice, error: invErr } = await supabase
      .from("invoices")
      .select("id, total_cents, currency, invoice_number")
      .eq("id", invoice_id)
      .single();
    if (invErr) throw invErr;
    if (!invoice) return jsonResponse({ error: "invoice not found" }, 404);
    if (invoice.total_cents <= 0) {
      return jsonResponse({ error: "invoice total must be positive" }, 400);
    }

    const currency = invoice.currency ?? "CAD";
    const name = invoice.invoice_number
      ? `Invoice ${invoice.invoice_number}`
      : "Invoice payment";

    const res = await squareFetch<{
      payment_link: { id: string; url: string; long_url?: string };
    }>(cfg, "/v2/online-checkout/payment-links", {
      method: "POST",
      body: {
        idempotency_key: idempotencyKey(),
        quick_pay: {
          name,
          price_money: { amount: invoice.total_cents, currency },
          location_id: cfg.locationId,
        },
      },
    });

    const linkId = res.payment_link.id;
    const url = res.payment_link.long_url ?? res.payment_link.url;

    const { error: updErr } = await supabase
      .from("invoices")
      .update({
        square_payment_link_id: linkId,
        square_public_url: url,
      })
      .eq("id", invoice_id);
    if (updErr) throw updErr;

    return jsonResponse({ url });
  } catch (err) {
    console.error("square-create-payment-link error:", err);
    return jsonResponse(
      { error: err instanceof Error ? err.message : "unknown error" },
      500,
    );
  }
});
