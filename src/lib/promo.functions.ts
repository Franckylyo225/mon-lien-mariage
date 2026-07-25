import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { loadUsablePromo, normalizePromoCode, type PromoRow } from "./promo.server";

interface ValidateInput {
  code: string;
}

export const validatePromoCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: ValidateInput) => data)
  .handler(async ({ data }) => {
    const raw = normalizePromoCode(data.code);
    if (!raw) throw new Error("Veuillez saisir un code promo.");
    const row = await loadUsablePromo(raw);
    return { code: row.code, discount: row.discount_percent };
  });

interface PublishInput {
  weddingId: string;
  slug: string;
  code?: string;
  includeGuestbook?: boolean;
}

export const publishWithPromo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: PublishInput) => data)
  .handler(async ({ data, context }) => {
    const raw = normalizePromoCode(data.code ?? "");
    let row: PromoRow | null = null;
    if (raw) {
      row = await loadUsablePromo(raw);
      if (row.discount_percent < 100) {
        throw new Error("Ce code ne couvre pas la totalité du paiement.");
      }
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

    if (row) {
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
    }

    return { published: true as const };
  });
