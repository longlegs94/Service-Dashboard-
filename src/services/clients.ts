import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database.types";

export type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
export type ClientAddressRow =
  Database["public"]["Tables"]["client_addresses"]["Row"];

/**
 * Finds an existing (non-deleted) client by exact display name within the org,
 * or creates one. Keeps ticket entry fast: the operator just types a customer
 * name and we reuse the record if they've seen them before.
 */
export async function findOrCreateClient(params: {
  orgId: string;
  createdBy: string;
  name: string;
  phone?: string | null;
}): Promise<string> {
  const name = params.name.trim();

  const { data: existing, error: findError } = await supabase
    .from("clients")
    .select("id")
    .eq("org_id", params.orgId)
    .is("deleted_at", null)
    .ilike("display_name", name)
    .limit(1)
    .maybeSingle();
  if (findError) throw findError;
  if (existing) return existing.id;

  const { data: created, error: insertError } = await supabase
    .from("clients")
    .insert({
      org_id: params.orgId,
      created_by: params.createdBy,
      display_name: name,
      phone: params.phone?.trim() || null,
    })
    .select("id")
    .single();
  if (insertError) throw insertError;
  return created.id;
}

export async function listClients(): Promise<ClientRow[]> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .is("deleted_at", null)
    .order("display_name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getClient(id: string): Promise<ClientRow> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export interface ClientInput {
  display_name: string;
  company_name?: string | null;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
}

export async function createClient(params: {
  orgId: string;
  createdBy: string;
  input: ClientInput;
}): Promise<ClientRow> {
  const { data, error } = await supabase
    .from("clients")
    .insert({
      org_id: params.orgId,
      created_by: params.createdBy,
      display_name: params.input.display_name.trim(),
      company_name: params.input.company_name?.trim() || null,
      email: params.input.email?.trim() || null,
      phone: params.input.phone?.trim() || null,
      notes: params.input.notes?.trim() || null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateClient(
  id: string,
  input: ClientInput,
): Promise<ClientRow> {
  const { data, error } = await supabase
    .from("clients")
    .update({
      display_name: input.display_name.trim(),
      company_name: input.company_name?.trim() || null,
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      notes: input.notes?.trim() || null,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

/** Soft delete — preserves history (and any linked jobs keep their record). */
export async function deleteClient(id: string): Promise<void> {
  const { error } = await supabase
    .from("clients")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

// ── Addresses ────────────────────────────────────────────────────────────────

export async function listClientAddresses(
  clientId: string,
): Promise<ClientAddressRow[]> {
  const { data, error } = await supabase
    .from("client_addresses")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export interface AddressInput {
  label?: string | null;
  address_line_1?: string | null;
  address_line_2?: string | null;
  city?: string | null;
  province?: string | null;
  postal_code?: string | null;
}

export async function createClientAddress(params: {
  orgId: string;
  clientId: string;
  input: AddressInput;
}): Promise<ClientAddressRow> {
  const { data, error } = await supabase
    .from("client_addresses")
    .insert({
      org_id: params.orgId,
      client_id: params.clientId,
      label: params.input.label?.trim() || null,
      address_line_1: params.input.address_line_1?.trim() || null,
      address_line_2: params.input.address_line_2?.trim() || null,
      city: params.input.city?.trim() || null,
      province: params.input.province?.trim() || null,
      postal_code: params.input.postal_code?.trim() || null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteClientAddress(id: string): Promise<void> {
  const { error } = await supabase
    .from("client_addresses")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
