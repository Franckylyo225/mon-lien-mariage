import { createServerFn } from "@tanstack/react-start";
import { requireAuth as requireSupabaseAuth } from "@/lib/auth-middleware";

export type PaystackPaymentType = "publication" | "addon_guestbook";

export const BASE_PRICE_XOF = 24900;
export const GUESTBOOK_ADDON_XOF = 1990;

interface InitInput {
  weddingId: string;
  paymentType: PaystackPaymentType;
  amountFcfa?: number;
  slug?: string;
  includeGuestbook?: boolean;
  promoCode?: string;
  callbackUrl: string;
}

function generateReference(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${Date.now()}-${random}`;
}

export const initializePaystackPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: InitInput) => data)
  .handler(async ({ data, context }) => {
    const secretKey = process.env["PAYSTACK_SECRET_KEY"];
    if (!secretKey) {
      throw new Error(
        "Paiement indisponible : la clé Paystack n'est pas configurée sur ce déploiement. Essayez depuis l'adresse officielle de l'application.",
      );
    }

    if (data.paymentType !== "publication" && data.paymentType !== "addon_guestbook") {
      throw new Error("Type de paiement invalide.");
    }

    // Montant calculé côté serveur (le client ne peut pas l'imposer)
    const gross =
      data.paymentType === "addon_guestbook"
        ? GUESTBOOK_ADDON_XOF
        : BASE_PRICE_XOF + (data.includeGuestbook === true ? GUESTBOOK_ADDON_XOF : 0);

    let discount = 0;
    let promoCodeApplied: string | null = null;
    const { normalizePromoCode, loadUsablePromo } = await import("./promo.server");
    const rawCode = normalizePromoCode(data.promoCode ?? "");
    if (rawCode) {
      const promo = await loadUsablePromo(rawCode, context.supabase);
      discount = promo.discount_percent;
      promoCodeApplied = promo.code;
      if (discount >= 100) {
        throw new Error(
          "Ce code couvre la totalité : publiez directement, aucun paiement n'est nécessaire.",
        );
      }
    }

    const amount = Math.max(100, Math.round(gross * (1 - discount / 100)));

    // L'événement doit appartenir à l'utilisateur (RLS)
    const { data: wedding, error: wErr } = await context.supabase
      .from("weddings")
      .select("id, bride_name, groom_name")
      .eq("id", data.weddingId)
      .maybeSingle();
    if (wErr || !wedding) throw new Error("Événement introuvable.");

    const email = (context.claims as { email?: string } | null)?.email;
    if (!email) throw new Error("Adresse e-mail introuvable sur votre compte.");

    const reference = generateReference(
      data.paymentType === "addon_guestbook" ? "GBOOK" : "PUB",
    );

    const metadata = {
      wedding_id: data.weddingId,
      user_id: context.userId,
      payment_type: data.paymentType,
      slug: data.slug ?? null,
      include_guestbook: data.includeGuestbook === true,
      promo_code: promoCodeApplied,
      discount_percent: discount,
      gross_amount_fcfa: gross,
      custom_fields: [
        {
          display_name: "Couple",
          variable_name: "couple_names",
          value: `${wedding.bride_name ?? ""} & ${wedding.groom_name ?? ""}`,
        },
      ],
    };

    const { error: insertError } = await context.supabase.from("payments").insert({
      user_id: context.userId,
      wedding_id: data.weddingId,
      amount_fcfa: amount,
      currency: "XOF",
      payment_type: data.paymentType,
      status: "pending",
      paystack_reference: reference,
      metadata,
    } as never);
    if (insertError) throw new Error("Impossible de créer le paiement.");

    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amount * 100,
        currency: "XOF",
        reference,
        metadata,
        callback_url: data.callbackUrl,
        channels: ["card", "mobile_money", "ussd"],
      }),
    });

    const json = (await res.json().catch(() => null)) as
      | { status?: boolean; message?: string; data?: { authorization_url?: string } }
      | null;

    if (!res.ok || !json?.status || !json.data?.authorization_url) {
      console.error("[paystack] init failed", res.status, json?.message);
      throw new Error(json?.message || "Erreur d'initialisation du paiement.");
    }

    return {
      authorization_url: json.data.authorization_url,
      reference,
    };
  });

interface StatusInput {
  reference: string;
}

export const getPaymentStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: StatusInput) => data)
  .handler(async ({ data, context }) => {
    const { data: row } = await context.supabase
      .from("payments")
      .select("status, payment_type, wedding_id, amount_fcfa")
      .eq("paystack_reference", data.reference)
      .maybeSingle();

    if (!row) return { found: false as const };

    let status = row.status as string;

    // Repli : si le webhook n'a pas (encore) activé le paiement, on vérifie
    // directement auprès de Paystack. Idempotent grâce à activatePaystackPayment.
    if (status === "pending") {
      const secretKey = process.env["PAYSTACK_SECRET_KEY"];
      if (secretKey) {
        try {
          const res = await fetch(
            `https://api.paystack.co/transaction/verify/${encodeURIComponent(data.reference)}`,
            { headers: { Authorization: `Bearer ${secretKey}` } },
          );
          const json = (await res.json().catch(() => null)) as
            | { status?: boolean; data?: { status?: string; id?: number; channel?: string; metadata?: any } }
            | null;
          const trx = json?.data;
          if (json?.status && trx?.status === "success") {
            const { activatePaystackPayment } = await import(
              "@/lib/paystack-activate.server"
            );
            await activatePaystackPayment(data.reference, {
              id: trx.id,
              channel: trx.channel ?? null,
              metadata: trx.metadata ?? null,
            });

            status = "success";
          } else if (trx?.status === "failed" || trx?.status === "abandoned") {
            status = trx.status;
          }
        } catch (e) {
          console.error("[paystack] verify fallback failed", e);
        }
      }
    }

    let wedding: {
      brideName: string;
      groomName: string;
      slug: string | null;
      hasGuestbook: boolean;
      weddingDate: string | null;
      theme: string | null;
    } | null = null;

    if (row.wedding_id) {
      const { data: w } = await context.supabase
        .from("weddings")
        .select("bride_name, groom_name, slug, has_guestbook, wedding_date, theme")
        .eq("id", row.wedding_id)
        .maybeSingle();
      if (w) {
        wedding = {
          brideName: w.bride_name ?? "",
          groomName: w.groom_name ?? "",
          slug: w.slug ?? null,
          hasGuestbook: !!w.has_guestbook,
          weddingDate: w.wedding_date ?? null,
          theme: w.theme ?? null,
        };
      }
    }

    return {
      found: true as const,
      status,
      paymentType: row.payment_type as PaystackPaymentType,
      weddingId: row.wedding_id as string | null,
      amountFcfa: (row.amount_fcfa as number | null) ?? null,
      wedding,
    };

  });

