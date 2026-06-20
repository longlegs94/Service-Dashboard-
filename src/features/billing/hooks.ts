import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createInvoice,
  createSquarePaymentLink,
  getInvoice,
  listInvoices,
  sendInvoiceViaSquare,
  updateInvoice,
  type CreateInvoiceInput,
  type UpdateInvoiceInput,
} from "@/services/invoices";
import {
  listPaymentsForInvoice,
  recordManualPayment,
  type RecordManualPaymentInput,
} from "@/services/payments";
import {
  convertQuoteToInvoice,
  createQuote,
  getQuote,
  listQuotes,
  updateQuote,
  type CreateQuoteInput,
  type UpdateQuoteInput,
} from "@/services/quotes";

const INVOICES_KEY = ["invoices"] as const;
const QUOTES_KEY = ["quotes"] as const;

// ── Invoices ─────────────────────────────────────────────────────────────────

export function useInvoices() {
  return useQuery({ queryKey: INVOICES_KEY, queryFn: listInvoices });
}

export function useInvoice(id: string | undefined) {
  return useQuery({
    queryKey: ["invoice", id],
    queryFn: () => getInvoice(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInvoiceInput) => createInvoice(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: INVOICES_KEY }),
  });
}

export function useUpdateInvoice(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateInvoiceInput) => updateInvoice(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INVOICES_KEY });
      qc.invalidateQueries({ queryKey: ["invoice", id] });
    },
  });
}

export function useSendInvoiceViaSquare(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => sendInvoiceViaSquare(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INVOICES_KEY });
      qc.invalidateQueries({ queryKey: ["invoice", id] });
    },
  });
}

export function useCreateSquarePaymentLink(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => createSquarePaymentLink(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoice", id] });
    },
  });
}

export function useInvoicePayments(invoiceId: string | undefined) {
  return useQuery({
    queryKey: ["invoice-payments", invoiceId],
    queryFn: () => listPaymentsForInvoice(invoiceId as string),
    enabled: Boolean(invoiceId),
  });
}

export function useRecordManualPayment(invoiceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RecordManualPaymentInput) => recordManualPayment(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INVOICES_KEY });
      qc.invalidateQueries({ queryKey: ["invoice", invoiceId] });
      qc.invalidateQueries({ queryKey: ["invoice-payments", invoiceId] });
    },
  });
}

// ── Quotes ───────────────────────────────────────────────────────────────────

export function useQuotes() {
  return useQuery({ queryKey: QUOTES_KEY, queryFn: listQuotes });
}

export function useQuote(id: string | undefined) {
  return useQuery({
    queryKey: ["quote", id],
    queryFn: () => getQuote(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateQuoteInput) => createQuote(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUOTES_KEY }),
  });
}

export function useUpdateQuote(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateQuoteInput) => updateQuote(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUOTES_KEY });
      qc.invalidateQueries({ queryKey: ["quote", id] });
    },
  });
}

export function useConvertQuoteToInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      quoteId,
      orgId,
      createdBy,
    }: {
      quoteId: string;
      orgId: string;
      createdBy: string;
    }) => convertQuoteToInvoice(quoteId, { orgId, createdBy }),
    onSuccess: (_data, { quoteId }) => {
      qc.invalidateQueries({ queryKey: QUOTES_KEY });
      qc.invalidateQueries({ queryKey: ["quote", quoteId] });
      qc.invalidateQueries({ queryKey: INVOICES_KEY });
    },
  });
}
