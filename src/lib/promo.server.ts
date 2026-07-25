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

export async function loadUsablePromo(code: string): Promise<PromoRow> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("promo_codes")
    .select("id, code, discount_percent, max_uses, uses, valid_from, valid_until, is_active")
    .eq("code", code)
    .maybeSingle();
  if (error) throw new Error("Vérification du code impossible.");
  const row = data as PromoRow | null;
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