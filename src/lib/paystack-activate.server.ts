/**
 * Activation partagée après un paiement Paystack réussi.
 * Utilisée par le webhook ET par la vérification de repli côté /payment/callback
 * (utile en test tant que le webhook n'est pas encore configuré côté Paystack).
 */

type Admin = { from: (t: string) => any };

export function slugify(str: string): string {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function uniqueSlug(admin: Admin, base: string): Promise<string> {
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

export interface ChargeData {
  id?: string | number;
  channel?: string | null;
  metadata?: Record<string, any> | null;
}

/**
 * Marque le paiement comme réussi et active la publication / le livre d'or.
 * Idempotent : si le paiement est déjà "success", ne fait rien.
 */
export async function activatePaystackPayment(
  admin: Admin,
  reference: string,
  charge: ChargeData,
): Promise<"activated" | "already" | "not_found"> {
  const { data: payment } = await admin
    .from("payments")
    .select("*")
    .eq("paystack_reference", reference)
    .maybeSingle();

  if (!payment) return "not_found";
  if (payment.status === "success") return "already";

  await admin
    .from("payments")
    .update({
      status: "success",
      paystack_transaction_id: String(charge.id ?? ""),
      payment_method: charge.channel ?? null,
    })
    .eq("paystack_reference", reference);

  const metadata = charge.metadata ?? payment.metadata ?? {};
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
      slugify(`${wedding?.bride_name ?? ""}-et-${wedding?.groom_name ?? ""}`);
    const slug = await uniqueSlug(admin, desired);

    const includeGuestbook =
      metadata.include_guestbook === true ||
      metadata.custom_fields?.find(
        (f: { variable_name?: string }) => f.variable_name === "includes_guestbook",
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

    if (payment.user_id) {
      await admin.from("notifications").insert({
        user_id: payment.user_id,
        wedding_id: payment.wedding_id,
        type: "publication_activated",
        title: "Votre invitation est publiée",
        body: includeGuestbook
          ? "Le paiement est confirmé : votre page est en ligne et le livre d'or est activé."
          : "Le paiement est confirmé : votre page est désormais en ligne.",
        data: { slug, reference, include_guestbook: includeGuestbook },
      });
    }
  } else if (paymentType === "addon_guestbook" && payment.wedding_id) {
    await admin
      .from("weddings")
      .update({ has_guestbook: true })
      .eq("id", payment.wedding_id);

    if (payment.user_id) {
      await admin.from("notifications").insert({
        user_id: payment.user_id,
        wedding_id: payment.wedding_id,
        type: "guestbook_activated",
        title: "Livre d'or activé",
        body: "Le paiement est confirmé : vos invités peuvent maintenant vous laisser un message.",
        data: { reference },
      });
    }
  }

  return "activated";
}
