import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "node:crypto";

// Paystack signe le corps brut du webhook avec HMAC-SHA512 en utilisant la
// clé secrète, dans l'en-tête `x-paystack-signature`.
// Docs : https://paystack.com/docs/payments/webhooks/

interface PaystackEvent {
  event: string;
  data: {
    reference: string;
    status: string;
    amount: number;
    currency: string;
    metadata?: Record<string, unknown> | string | null;
  };
}

function parseMetadata(
  raw: PaystackEvent["data"]["metadata"],
): Record<string, unknown> {
  if (!raw) return {};
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return raw;
}

export const Route = createFileRoute("/api/public/webhooks/paystack")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.PAYSTACK_SECRET_KEY;
        if (!secret) {
          console.error("[paystack-webhook] PAYSTACK_SECRET_KEY missing");
          return new Response("Server misconfigured", { status: 500 });
        }

        const signature = request.headers.get("x-paystack-signature") ?? "";
        const rawBody = await request.text();

        const expected = createHmac("sha512", secret).update(rawBody).digest("hex");
        const sigBuf = Buffer.from(signature);
        const expBuf = Buffer.from(expected);
        if (
          sigBuf.length !== expBuf.length ||
          !timingSafeEqual(sigBuf, expBuf)
        ) {
          console.warn("[paystack-webhook] invalid signature");
          return new Response("Invalid signature", { status: 401 });
        }

        let event: PaystackEvent;
        try {
          event = JSON.parse(rawBody) as PaystackEvent;
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        // On ne traite que les succès. Les autres événements sont ACK-ed
        // (200) pour ne pas déclencher de rejeu inutile côté Paystack.
        if (event.event !== "charge.success" || event.data.status !== "success") {
          return new Response("ok", { status: 200 });
        }

        const meta = parseMetadata(event.data.metadata);
        const weddingId =
          typeof meta.wedding_id === "string" ? meta.wedding_id : null;
        const slug = typeof meta.slug === "string" ? meta.slug : null;
        const envelope =
          typeof meta.envelope === "string" ? meta.envelope === "1" : false;

        if (!weddingId) {
          console.error(
            "[paystack-webhook] missing wedding_id in metadata",
            event.data.reference,
          );
          // 200 pour éviter les rejeux — l'événement n'appartient pas à l'app.
          return new Response("ok", { status: 200 });
        }

        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );

        // Idempotence : si déjà publié, on ne réécrit pas published_at.
        const { data: existing, error: readErr } = await supabaseAdmin
          .from("weddings")
          .select("id, is_published")
          .eq("id", weddingId)
          .maybeSingle();

        if (readErr) {
          console.error("[paystack-webhook] read wedding failed", readErr);
          return new Response("db read error", { status: 500 });
        }
        if (!existing) {
          console.error("[paystack-webhook] wedding not found", weddingId);
          return new Response("ok", { status: 200 });
        }

        if (existing.is_published) {
          return new Response("ok", { status: 200 });
        }

        const update: Record<string, unknown> = {
          is_published: true,
          is_locked: true,
          published_at: new Date().toISOString(),
          has_envelope_animation: envelope,
        };
        if (slug) update.slug = slug;

        const { error: updateErr } = await supabaseAdmin
          .from("weddings")
          .update(update as never)
          .eq("id", weddingId);

        if (updateErr) {
          console.error("[paystack-webhook] update failed", updateErr);
          return new Response("db update error", { status: 500 });
        }

        console.log(
          `[paystack-webhook] wedding ${weddingId} published via ${event.data.reference}`,
        );
        return new Response("ok", { status: 200 });
      },
    },
  },
});
