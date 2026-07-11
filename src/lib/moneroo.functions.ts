import { createServerFn } from "@tanstack/react-start";
import { getRequestHost } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const MONEROO_BASE = "https://api.moneroo.io/v1";

interface InitInput {
  weddingId: string;
  slug: string;
  envelopeAnimation: boolean;
  amount: number;
  brideName: string;
  groomName: string;
}

export const initMonerooPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: InitInput) => data)
  .handler(async ({ data, context }) => {
    const secret = process.env.MONEROO_SECRET_KEY;
    if (!secret) throw new Error("MONEROO_SECRET_KEY is not configured");

    // Origin for return_url
    const host = getRequestHost();
    const proto = host.startsWith("localhost") ? "http" : "https";
    const origin = `${proto}://${host}`;

    // User email for the customer object
    const email = (context.claims as { email?: string })?.email ?? "invite@moninvit.com";
    const [firstName, ...rest] = (data.brideName || "Invite").split(" ");
    const lastName = rest.join(" ") || (data.groomName || "MonInvit");

    const payload = {
      amount: Math.round(data.amount),
      currency: "XOF",
      description: `Publication invitation ${data.brideName} & ${data.groomName}`,
      return_url: `${origin}/publish/success?wid=${encodeURIComponent(data.weddingId)}`,
      customer: {
        email,
        first_name: firstName || "Invite",
        last_name: lastName,
      },
      metadata: {
        wedding_id: data.weddingId,
        user_id: context.userId,
        slug: data.slug,
        envelope: data.envelopeAnimation ? "1" : "0",
      },
    };

    const res = await fetch(`${MONEROO_BASE}/payments/initialize`, {
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
      console.error(`[moneroo] initialize failed ${res.status}: ${body}`);
      throw new Error(`Moneroo error (${res.status}): ${body}`);
    }

    const json = (await res.json()) as {
      data?: { id: string; checkout_url: string };
    };
    if (!json.data?.checkout_url) {
      throw new Error("Moneroo: no checkout_url returned");
    }
    return { checkoutUrl: json.data.checkout_url, paymentId: json.data.id };
  });

interface VerifyInput {
  paymentId: string;
  weddingId: string;
  slug: string;
  envelopeAnimation: boolean;
}

export const verifyMonerooPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: VerifyInput) => data)
  .handler(async ({ data, context }) => {
    const secret = process.env.MONEROO_SECRET_KEY;
    if (!secret) throw new Error("MONEROO_SECRET_KEY is not configured");

    const res = await fetch(
      `${MONEROO_BASE}/payments/${encodeURIComponent(data.paymentId)}/verify`,
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
      console.error(`[moneroo] verify failed ${res.status}: ${body}`);
      throw new Error(`Moneroo verify error (${res.status}): ${body}`);
    }
    const json = (await res.json()) as {
      data?: { status?: string; amount?: number; currency?: string };
    };
    const status = json.data?.status;
    const success = status === "success" || status === "successful";

    if (success) {
      // Mark the wedding as published on behalf of the authenticated user.
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
        console.error("[moneroo] wedding update failed", error);
        throw new Error(`Publication échouée: ${error.message}`);
      }
    }

    return { status: status ?? "unknown", success };
  });
