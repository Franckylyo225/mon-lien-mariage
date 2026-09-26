import { createServerFn } from "@tanstack/react-start";
import { requireAuth as requireSupabaseAuth } from "@/lib/auth-middleware";
import { loadUsablePromo, normalizePromoCode } from "./promo.server";

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

const PUBLISH_ERRORS: Record<string, string> = {
  unauthorized: "Session expirée, reconnectez-vous.",
  not_found: "Événement introuvable.",
  invalid_slug: "Lien public invalide.",
  slug_taken: "Ce lien est déjà pris.",
  invalid_code: "Code promo invalide.",
  inactive: "Ce code promo est désactivé.",
  not_started: "Ce code promo n'est pas encore actif.",
  expired: "Ce code promo est expiré.",
  exhausted: "Ce code promo a atteint sa limite d'utilisation.",
  not_free: "Ce code ne couvre pas la totalité du paiement.",
};

/**
 * Free publication with a 100 % promo code. Everything (code checks, redemption,
 * publication) happens atomically in the publish_with_promo database function, which
 * is the only way to publish without paying: the paid flags can't be set from the client.
 */
export const publishWithPromo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: PublishInput) => data)
  .handler(async ({ data, context }) => {
    const raw = normalizePromoCode(data.code ?? "");
    if (!raw) throw new Error("Un code promo valide est nécessaire pour publier sans paiement.");

    const { data: result, error } = await context.supabase.rpc(
      "publish_with_promo" as never,
      {
        _wedding_id: data.weddingId,
        _slug: data.slug,
        _code: raw,
        _include_guestbook: data.includeGuestbook === true,
      } as never,
    );
    if (error) throw new Error("Publication échouée. Réessayez.");
    if (result !== "ok") {
      throw new Error(PUBLISH_ERRORS[String(result)] ?? "Publication impossible.");
    }
    return { published: true as const };
  });
