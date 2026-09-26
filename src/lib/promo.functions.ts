import { createServerFn } from "@tanstack/react-start";
import { requireAuth as requireSupabaseAuth } from "@/lib/auth-middleware";
import { loadUsablePromo, normalizePromoCode, type PromoRow } from "./promo.server";

interface ValidateInput {
  code: string;
}

export const validatePromoCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: ValidateInput) => data)
  .handler(async ({ data, context }) => {
    const raw = normalizePromoCode(data.code);
    if (!raw) throw new Error("Veuillez saisir un code promo.");
    const row = await loadUsablePromo(raw, context.supabase);
    return { code: row.code, discount: row.discount_percent };
  });

interface PublishInput {
  weddingId: string;
  slug: string;
  code?: string;
  includeGuestbook?: boolean;
}

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,59}$/;

/**
 * Free publication with a 100 % promo code. A valid, fully-discounted code is
 * mandatory: without it the only way to publish is the paid flow, which is
 * activated by the Paystack webhook.
 */
export const publishWithPromo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: PublishInput) => data)
  .handler(async ({ data, context }) => {
    const raw = normalizePromoCode(data.code ?? "");
    if (!raw) throw new Error("Un code promo valide est nécessaire pour publier sans paiement.");
    const row: PromoRow = await loadUsablePromo(raw, context.supabase);
    if (row.discount_percent < 100) {
      throw new Error("Ce code ne couvre pas la totalité du paiement.");
    }
    if (typeof data.slug !== "string" || !SLUG_RE.test(data.slug)) {
      throw new Error("Lien public invalide.");
    }

    // Record the redemption before publishing so a code can't be used without leaving a trace.
    const { error: redeemError } = await context.supabase.from("promo_code_redemptions").insert({
      promo_code_id: row.id,
      code: row.code,
      wedding_id: data.weddingId,
      user_id: context.userId,
    } as never);
    if (redeemError) throw new Error("Impossible d'enregistrer l'utilisation du code.");
    const { error: rpcError } = await context.supabase.rpc(
      "increment_promo_uses" as never,
      { p_code_id: row.id } as never,
    );
    if (rpcError) throw new Error("Impossible d'enregistrer l'utilisation du code.");

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

    return { published: true as const };
  });
