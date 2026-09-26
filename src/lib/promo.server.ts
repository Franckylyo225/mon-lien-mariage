import type { SupabaseClient } from "@supabase/supabase-js";

export interface PromoRow {
  id: string;
  code: string;
  discount_percent: number;
  max_uses: number | null;
  uses: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
}

export function normalizePromoCode(code: string): string {
  return (code || "").trim().toUpperCase();
}

/**
 * Look up a promo code the user typed, through the validate_promo RPC (the
 * promo_codes table itself is not readable by regular users), then check that
 * it is usable.
 */
export async function loadUsablePromo(
  code: string,
  supabase: SupabaseClient,
): Promise<PromoRow> {
  const { data, error } = await supabase.rpc("validate_promo" as never, { _code: code } as never);
  if (error) throw new Error("Vérification du code impossible.");
  const row = ((data as PromoRow[] | null) ?? [])[0] ?? null;
  if (!row) throw new Error("Code promo invalide.");
  if (!row.is_active) throw new Error("Ce code promo est désactivé.");
  const now = Date.now();
  if (row.valid_from && new Date(row.valid_from).getTime() > now) {
    throw new Error("Ce code promo n'est pas encore actif.");
  }
  if (row.valid_until && new Date(row.valid_until).getTime() < now) {
    throw new Error("Ce code promo est expiré.");
  }
  if (row.max_uses !== null && row.uses >= row.max_uses) {
    throw new Error("Ce code promo a atteint sa limite d'utilisation.");
  }
  return row;
}
