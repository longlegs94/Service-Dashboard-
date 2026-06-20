import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database.types";
import { recomputeInvoice, type PaymentRow } from "@/services/invoices";

export type PaymentMethod = Database["public"]["Enums"]["payment_method"];

export async function listPaymentsForInvoice(
  invoiceId: string,
): Promise<PaymentRow[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("invoice_id", invoiceId)
    .order("paid_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export interface RecordManualPaymentInput {
  orgId: string;
  createdBy: string;
  invoiceId: string;
  jobId?: string | null;
  clientId?: string | null;
  method: PaymentMethod;
  amountCents: number;
  paidAt: string;
  notes?: string | null;
  currency?: string;
}

/**
 * Records a manual (non-Square) payment against an invoice and recomputes the
 * invoice's amount_paid / balance / status (which may also advance the job).
 */
export async function recordManualPayment(
  input: RecordManualPaymentInput,
): Promise<PaymentRow> {
  const { data: payment, error } = await supabase
    .from("payments")
    .insert({
      org_id: input.orgId,
      created_by: input.createdBy,
      invoice_id: input.invoiceId,
      job_id: input.jobId ?? null,
      client_id: input.clientId ?? null,
      method: input.method,
      amount_cents: input.amountCents,
      paid_at: input.paidAt,
      notes: input.notes?.trim() || null,
      currency: input.currency ?? "CAD",
    })
    .select("*")
    .single();
  if (error) throw error;

  await recomputeInvoice(input.invoiceId);
  return payment;
}
