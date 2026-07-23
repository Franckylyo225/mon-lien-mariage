import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function normalize(code: string): string {
  return (code || "").trim().toUpperCase();
}

interface PromoRow {
  id: string;
  code: string;
  discount_percent: number;
  max_uses: number | null;
  uses: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
}

async function loadUsable(code: string): Promise<PromoRow> {
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

interface ValidateInput {
  code: string;
}

export const validatePromoCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: ValidateInput) => data)
  .handler(async ({ data }) => {
    const raw = normalize(data.code);
    if (!raw) throw new Error("Veuillez saisir un code promo.");
    const row = await loadUsable(raw);
    return { code: row.code, discount: row.discount_percent };
  });

interface PublishInput {
  weddingId: string;
  slug: string;
  code: string;
  includeGuestbook?: boolean;
}

export const publishWithPromo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: PublishInput) => data)
  .handler(async ({ data, context }) => {
    const raw = normalize(data.code);
    if (!raw) throw new Error("Code promo invalide.");
    const row = await loadUsable(raw);
    if (row.discount_percent < 100) {
      throw new Error(
        "Le paiement en ligne est temporairement indisponible. Ce code ne couvre pas la totalité.",
      );
    }

    const update: Record<string, unknown> = {
      is_published: true,
      is_locked: true,
      published_at: new Date().toISOString(),
      slug: data.slug,
      has_envelope_animation: false,
    };
    if (data.includeGuestbook) update.has_guestbook = true;

    const { error } = await context.supabase
      .from("weddings")
      .update(update as never)
      .eq("id", data.weddingId);
    if (error) throw new Error(`Publication échouée: ${error.message}`);

    // Record redemption + increment counter (best-effort).
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("promo_code_redemptions").insert({
        promo_code_id: row.id,
        code: row.code,
        wedding_id: data.weddingId,
        user_id: context.userId,
      } as never);
      await supabaseAdmin
        .from("promo_codes")
        .update({ uses: row.uses + 1 } as never)
        .eq("id", row.id);
    } catch (e) {
      console.warn("[promo] redemption tracking failed", e);
    }

    return { published: true as const };
  });
