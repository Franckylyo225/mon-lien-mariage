import { createServerFn } from "@tanstack/react-start";
import { requireAuth as requireSupabaseAuth } from "@/lib/auth-middleware";

export type PaystackPaymentType = "publication" | "addon_guestbook";

interface InitInput {
  weddingId: string;
  paymentType: PaystackPaymentType;
  amountFcfa: number;
  slug?: string;
  includeGuestbook?: boolean;
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
    const secretKey =
      process.env["PAYSTACK_SECRET_KEY"] || process.env["STRIPE_TEST_API_KEY"];
    if (!secretKey) {
      throw new Error(
        "Paiement indisponible : la clé Paystack n'est pas configurée sur ce déploiement. Essayez depuis l'adresse officielle de l'application.",
      );
    }

    if (data.paymentType !== "publication" && data.paymentType !== "addon_guestbook") {
      throw new Error("Type de paiement invalide.");
    }
    const amount = Math.round(Number(data.amountFcfa));
    if (!Number.isFinite(amount) || amount < 100 || amount > 10_000_000) {
      throw new Error("Montant invalide.");
    }

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
      const secretKey =
        process.env["PAYSTACK_SECRET_KEY"] || process.env["STRIPE_TEST_API_KEY"];
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

    return {
      found: true as const,
      status,
      paymentType: row.payment_type as PaystackPaymentType,
      weddingId: row.wedding_id as string | null,
    };
  });

