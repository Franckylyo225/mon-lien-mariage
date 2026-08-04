import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

function slugify(str: string): string {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function uniqueSlug(
  admin: { from: (t: string) => any },
  base: string,
): Promise<string> {
  const clean = base || `invitation-${Date.now()}`;
  let candidate = clean;
  for (let i = 2; i < 50; i++) {
    const { data } = await admin
      .from("weddings")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
    candidate = `${clean}-${i}`;
  }
  return `${clean}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export const Route = createFileRoute("/api/public/webhooks/paystack")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secretKey =
          process.env["PAYSTACK_SECRET_KEY"] || process.env["STRIPE_TEST_API_KEY"];
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

        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );
        const admin = supabaseAdmin as unknown as { from: (t: string) => any };

        const reference: string | undefined = event?.data?.reference;
        if (!reference) return new Response("OK", { status: 200 });

        const { data: payment } = await admin
          .from("payments")
          .select("*")
          .eq("paystack_reference", reference)
          .maybeSingle();

        if (!payment) {
          console.error("[paystack] payment not found", reference);
          return new Response("Not found", { status: 404 });
        }

        if (event.event !== "charge.success") {
          if (
            payment.status === "pending" &&
            (event.event === "charge.failed" || event.event === "charge.abandoned")
          ) {
            await admin
              .from("payments")
              .update({
                status: event.event === "charge.failed" ? "failed" : "abandoned",
              })
              .eq("paystack_reference", reference);
          }
          return new Response("OK", { status: 200 });
        }

        if (payment.status === "success") {
          return new Response("Already processed", { status: 200 });
        }

        await admin
          .from("payments")
          .update({
            status: "success",
            paystack_transaction_id: String(event.data?.id ?? ""),
            payment_method: event.data?.channel ?? null,
          })
          .eq("paystack_reference", reference);

        const metadata = event.data?.metadata ?? payment.metadata ?? {};
        const paymentType = metadata.payment_type || payment.payment_type;

        if (paymentType === "publication" && payment.wedding_id) {
          const { data: wedding } = await admin
            .from("weddings")
            .select("bride_name, groom_name, slug")
            .eq("id", payment.wedding_id)
            .maybeSingle();

          const desired =
            slugify(metadata.slug ?? "") ||
            slugify(wedding?.slug ?? "") ||
            slugify(
              `${wedding?.bride_name ?? ""}-et-${wedding?.groom_name ?? ""}`,
            );
          const slug = await uniqueSlug(admin, desired);

          const includeGuestbook =
            metadata.include_guestbook === true ||
            metadata.custom_fields?.find(
              (f: { variable_name?: string }) =>
                f.variable_name === "includes_guestbook",
            )?.value === "oui";

          await admin
            .from("weddings")
            .update({
              is_published: true,
              is_locked: true,
              published_at: new Date().toISOString(),
              has_envelope_animation: false,
              slug,
              ...(includeGuestbook ? { has_guestbook: true } : {}),
            })
            .eq("id", payment.wedding_id);
        } else if (paymentType === "addon_guestbook" && payment.wedding_id) {
          await admin
            .from("weddings")
            .update({ has_guestbook: true })
            .eq("id", payment.wedding_id);
        }

        return new Response("OK", { status: 200 });
      },
    },
  },
});
