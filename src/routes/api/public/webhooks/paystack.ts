import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

export const Route = createFileRoute("/api/public/webhooks/paystack")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secretKey = process.env["PAYSTACK_SECRET_KEY"];
        if (!secretKey) return new Response("Not configured", { status: 500 });

        const body = await request.text();
        const signature = request.headers.get("x-paystack-signature") ?? "";
        const expected = createHmac("sha512", secretKey).update(body).digest("hex");
        const sig = Buffer.from(signature);
        const exp = Buffer.from(expected);
        if (sig.length !== exp.length || !timingSafeEqual(sig, exp)) {
          console.error("[paystack] invalid webhook signature");
          return new Response("Unauthorized", { status: 401 });
        }

        let event: any;
        try {
          event = JSON.parse(body);
        } catch {
          return new Response("Bad request", { status: 400 });
        }

        const reference: string | undefined = event?.data?.reference;
        if (!reference) return new Response("OK", { status: 200 });

        if (event.event !== "charge.success") {
          if (event.event === "charge.failed" || event.event === "charge.abandoned") {
            const { markPaystackPaymentFailed } = await import(
              "@/lib/paystack-activate.server"
            );
            await markPaystackPaymentFailed(
              reference,
              event.event === "charge.failed" ? "failed" : "abandoned",
            );
          }
          return new Response("OK", { status: 200 });
        }

        const { activatePaystackPayment } = await import(
          "@/lib/paystack-activate.server"
        );
        const result = await activatePaystackPayment(reference, {
          id: event.data?.id,
          channel: event.data?.channel ?? null,
          metadata: event.data?.metadata ?? null,
        });

        if (result === "not_found") {
          console.error("[paystack] payment not found", reference);
          return new Response("Not found", { status: 404 });
        }
        if (result === "unauthorized") {
          return new Response("Not configured", { status: 500 });
        }


        return new Response("OK", { status: 200 });
      },
    },
  },
});
