import { createServerFn } from "@tanstack/react-start";
import { getRequestHost } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const PAYSTACK_BASE = "https://api.paystack.co";

// Paystack ne supporte pas XOF. En mode test, on utilise la devise configurée
// via PAYSTACK_CURRENCY (par défaut NGN). Le prix affiché reste le même,
// converti en subunit (kobo/pesewa/cent) attendu par Paystack (x100).
function getCurrency(): string {
  return (process.env.PAYSTACK_CURRENCY || "NGN").toUpperCase();
}

interface InitInput {
  weddingId: string;
  slug: string;
  envelopeAnimation: boolean;
  amount: number; // montant affiché (XOF)
  brideName: string;
  groomName: string;
}

export const initPaystackPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: InitInput) => data)
  .handler(async ({ data, context }) => {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) throw new Error("PAYSTACK_SECRET_KEY is not configured");

    const host = getRequestHost();
    const proto = host.startsWith("localhost") ? "http" : "https";
    const origin = `${proto}://${host}`;

    const email =
      (context.claims as { email?: string })?.email ?? "invite@moninvit.com";

    const payload = {
      email,
      amount: Math.round(data.amount) * 100, // subunit
      currency: getCurrency(),
      callback_url: `${origin}/publish/success?wid=${encodeURIComponent(data.weddingId)}`,
      metadata: {
        wedding_id: data.weddingId,
        user_id: context.userId,
        slug: data.slug,
        envelope: data.envelopeAnimation ? "1" : "0",
        bride_name: data.brideName,
        groom_name: data.groomName,
        description: `Publication invitation ${data.brideName} & ${data.groomName}`,
      },
    };

    const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[paystack] initialize failed ${res.status}: ${body}`);
      throw new Error(`Paystack error (${res.status}): ${body}`);
    }

    const json = (await res.json()) as {
      status?: boolean;
      message?: string;
      data?: { authorization_url: string; reference: string; access_code: string };
    };
    if (!json.data?.authorization_url) {
      throw new Error(`Paystack: ${json.message ?? "no authorization_url"}`);
    }
    return {
      checkoutUrl: json.data.authorization_url,
      reference: json.data.reference,
    };
  });

interface VerifyInput {
  reference: string;
  weddingId: string;
  slug: string;
  envelopeAnimation: boolean;
}

export const verifyPaystackPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: VerifyInput) => data)
  .handler(async ({ data, context }) => {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) throw new Error("PAYSTACK_SECRET_KEY is not configured");

    const res = await fetch(
      `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(data.reference)}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${secret}`,
        },
      },
    );

    if (!res.ok) {
      const body = await res.text();
      console.error(`[paystack] verify failed ${res.status}: ${body}`);
      throw new Error(`Paystack verify error (${res.status}): ${body}`);
    }
    const json = (await res.json()) as {
      status?: boolean;
      data?: { status?: string; amount?: number; currency?: string; metadata?: Record<string, unknown> };
    };
    const status = json.data?.status;
    const success = status === "success";

    if (success) {
      // Sécurité : on ne fait confiance qu'à weddingId côté serveur, scopé à l'user via RLS.
      const { error } = await context.supabase
        .from("weddings")
        .update({
          is_published: true,
          is_locked: true,
          published_at: new Date().toISOString(),
          slug: data.slug,
          has_envelope_animation: data.envelopeAnimation,
        } as never)
        .eq("id", data.weddingId);
      if (error) {
        console.error("[paystack] wedding update failed", error);
        throw new Error(`Publication échouée: ${error.message}`);
      }
    }

    return { status: status ?? "unknown", success };
  });

// ---------- Codes promo ----------
// Table de codes actifs. Clé = code (uppercase), valeur = % de remise (0-100).
const PROMO_CODES: Record<string, number> = {
  TIANA100: 100,
};

interface PromoInput {
  weddingId: string;
  slug: string;
  code: string;
}

export const applyPromoCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: PromoInput) => data)
  .handler(async ({ data, context }) => {
    const raw = (data.code || "").trim().toUpperCase();
    if (!raw) throw new Error("Veuillez saisir un code promo.");
    const discount = PROMO_CODES[raw];
    if (discount === undefined) throw new Error("Code promo invalide.");

    if (discount >= 100) {
      // 100% → publication directe, aucun paiement requis.
      const { error } = await context.supabase
        .from("weddings")
        .update({
          is_published: true,
          is_locked: true,
          published_at: new Date().toISOString(),
          slug: data.slug,
          has_envelope_animation: false,
        } as never)
        .eq("id", data.weddingId);
      if (error) throw new Error(`Publication échouée: ${error.message}`);
      return { discount, published: true as const };
    }

    // Réservé : remises partielles futures.
    return { discount, published: false as const };
  });

