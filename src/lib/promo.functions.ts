import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Codes promo actifs. Valeur = pourcentage de remise (100 = gratuit).
const PROMO_CODES: Record<string, number> = {
  TIANA100: 100,
};

function normalize(code: string): string {
  return (code || "").trim().toUpperCase();
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
    const discount = PROMO_CODES[raw];
    if (discount === undefined) throw new Error("Code promo invalide.");
    return { code: raw, discount };
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
    const discount = PROMO_CODES[raw];
    if (!raw || discount === undefined) {
      throw new Error("Code promo invalide.");
    }
    if (discount < 100) {
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
    return { published: true as const };
  });
