/**
 * Activation partagée après un paiement Paystack réussi.
 *
 * Sécurité : aucune clé service-role n'est requise. L'activation passe par la
 * fonction Postgres `activate_payment_secure`, protégée par une clé partagée
 * (PAYMENT_ACTIVATION_SECRET) dont seule l'empreinte est stockée en base.
 * Cela permet d'héberger l'application sur n'importe quelle plateforme
 * (Vercel, etc.) sans y exposer de clé d'administration.
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL_FALLBACK =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? "";
const SUPABASE_KEY_FALLBACK =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ?? "";

function createPublicClient() {
  const url = process.env["SUPABASE_URL"] || SUPABASE_URL_FALLBACK;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] || SUPABASE_KEY_FALLBACK;
  if (!url || !key) throw new Error("Configuration backend indisponible.");

  const isNewKey = key.startsWith("sb_publishable_") || key.startsWith("sb_secret_");
  return createClient(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (isNewKey && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

export interface ChargeData {
  id?: string | number;
  channel?: string | null;
  metadata?: Record<string, any> | null;
}

export type ActivationResult =
  | "activated"
  | "already"
  | "not_found"
  | "unauthorized";

/**
 * Marque le paiement comme réussi et active la publication / le livre d'or.
 * Idempotent côté base : un paiement déjà "success" renvoie "already".
 */
export async function activatePaystackPayment(
  reference: string,
  charge: ChargeData,
): Promise<ActivationResult> {
  const token = process.env["PAYMENT_ACTIVATION_SECRET"];
  if (!token) {
    console.error("[paystack] PAYMENT_ACTIVATION_SECRET manquant");
    return "unauthorized";
  }

  const supabase = createPublicClient();
  const { data, error } = await supabase.rpc("activate_payment_secure", {
    _token: token,
    _reference: reference,
    _transaction_id: charge.id != null ? String(charge.id) : null,
    _channel: charge.channel ?? null,
    _metadata: charge.metadata ?? null,
  } as never);

  if (error) {
    console.error("[paystack] activation rpc failed", error.message);
    throw new Error("Activation du paiement impossible.");
  }

  return (data as ActivationResult) ?? "not_found";
}

/** Marque un paiement en échec/abandon (sans clé d'administration). */
export async function markPaystackPaymentFailed(
  reference: string,
  status: "failed" | "abandoned",
): Promise<void> {
  const token = process.env["PAYMENT_ACTIVATION_SECRET"];
  if (!token) {
    console.error("[paystack] PAYMENT_ACTIVATION_SECRET manquant");
    return;
  }
  const supabase = createPublicClient();
  const { error } = await supabase.rpc("mark_payment_failed_secure", {
    _token: token,
    _reference: reference,
    _status: status,
  } as never);
  if (error) console.error("[paystack] mark failed rpc", error.message);
}
