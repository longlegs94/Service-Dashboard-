import { supabase } from "@/lib/supabase";

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
