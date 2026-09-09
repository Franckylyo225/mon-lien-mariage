import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { IconReceipt, IconCircleCheck, IconDownload } from "@tabler/icons-react";
import { supabase } from "@/integrations/supabase/client";
import { useWedding } from "@/lib/wedding-store";
import { downloadInvoicePdf, type InvoiceLine } from "@/lib/invoice-pdf";

export const Route = createFileRoute("/dashboard/billing")({
  head: () => ({ meta: [{ title: "Paiement & facture — MonInvit.com" }] }),
  component: BillingPage,
});

const UNIT_PRICE_XOF = 24900;
const GUESTBOOK_PRICE_XOF = 1990;

interface PaymentRow {
  id: string;
  brideName: string;
  groomName: string;
  publishedAt: string;
  slug: string | null;
  hasGuestbook: boolean;
  amount: number;
  lines: InvoiceLine[];
}

function formatDateLong(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatXOF(amount: number): string {
  return amount.toLocaleString("fr-FR").replace(/\u202f|\u00a0/g, " ") + " F CFA";
}

function BillingPage() {
  const { account, loading: accountLoading } = useWedding();
  const [rows, setRows] = useState<PaymentRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (accountLoading || !account.isAuthenticated) return;
    let cancelled = false;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (cancelled) return;
      if (!uid) {
        setRows([]);
        return;
      }

      const [weddingsRes, paymentsRes] = await Promise.all([
        supabase
          .from("weddings")
          .select("id, bride_name, groom_name, published_at, slug, is_published, has_guestbook, owner_id")
          .eq("owner_id", uid)
          .eq("is_published", true)
          .not("published_at", "is", null)
          .order("published_at", { ascending: false }),
        supabase
          .from("payments")
          .select("id, wedding_id, amount_fcfa, payment_type, status, metadata, user_id")
          .eq("user_id", uid)
          .eq("status", "success"),
      ]);
      if (cancelled) return;
      if (weddingsRes.error) {
        setError(weddingsRes.error.message);
        setRows([]);
        return;
      }

      const payments = paymentsRes.data ?? [];

      setRows(
        (weddingsRes.data ?? []).map((w) => {
          const id = w.id as string;
          const label =
            `${(w.bride_name as string) || "…"} & ${(w.groom_name as string) || "…"}`;
          const own = payments.filter((p) => p.wedding_id === id);
          const paid = own.reduce((s, p) => s + Number(p.amount_fcfa ?? 0), 0);
          const addonPaid =
            (w.has_guestbook as boolean) === true ||
            own.some(
              (p) =>
                p.payment_type === "addon_guestbook" ||
                (p.metadata as { include_guestbook?: boolean } | null)?.include_guestbook === true,
            );

          const lines: InvoiceLine[] = [
            {
              description: `Publication de l'invitation « ${label} » sur MonInvit.com`,
              amountXof: UNIT_PRICE_XOF,
            },
          ];
          if (addonPaid) {
            lines.push({
              description: "Option Livre d'or (add-on)",
              amountXof: GUESTBOOK_PRICE_XOF,
            });
          }
          const gross = lines.reduce((s, l) => s + l.amountXof, 0);
          const amount = paid > 0 ? paid : gross;
          if (paid > 0 && paid !== gross) {
            lines.push({ description: "Remise appliquée", amountXof: paid - gross });
          }

          return {
            id,
            brideName: (w.bride_name as string) ?? "",
            groomName: (w.groom_name as string) ?? "",
            publishedAt: (w.published_at as string) ?? "",
            slug: (w.slug as string | null) ?? null,
            hasGuestbook: addonPaid,
            amount,
            lines,
          };
        }),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [accountLoading, account.isAuthenticated]);

  if (accountLoading || rows === null) {
    return (
      <div className="py-10 text-center font-mono text-[10px] uppercase tracking-[0.3em] opacity-40">
        Chargement…
      </div>
    );
  }

  const total = rows.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-6 py-2">
      <section className="rounded-[12px] bg-card p-4" style={{ border: "0.5px solid hsl(var(--border))" }}>
        <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
          Total dépensé
        </p>
        <p className="mt-1 font-serif text-[22px] italic">{formatXOF(total)}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {rows.length} publication{rows.length > 1 ? "s" : ""}
        </p>
      </section>

      {error ? (
        <p className="text-[12px] text-destructive">Erreur : {error}</p>
      ) : null}

      {rows.length === 0 ? (
        <div className="rounded-[12px] bg-card px-4 py-10 text-center" style={{ border: "0.5px dashed hsl(var(--border))" }}>
          <IconReceipt size={28} strokeWidth={1.5} className="mx-auto text-muted-foreground" />
          <p className="mt-3 font-serif text-[14px] italic">Aucun paiement pour le moment</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Vos factures apparaîtront ici après la publication d'un événement.
          </p>
        </div>
      ) : (
        <section>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
            Historique
          </p>
          <ul className="space-y-2">
            {rows.map((r) => {
              const label =
                r.brideName || r.groomName
                  ? `${r.brideName || "…"} & ${r.groomName || "…"}`
                  : "Publication";
              const invoiceNumber = `INV-${(r.publishedAt || "").slice(0, 10).replace(/-/g, "")}-${r.id.slice(0, 6).toUpperCase()}`;
              const safeName = (r.brideName || r.groomName || "moninvit")
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
              const handleDownload = () => {
                downloadInvoicePdf(
                  {
                    invoiceNumber,
                    issuedAt: r.publishedAt,
                    paidAt: r.publishedAt,
                    customerName: label,
                    customerEmail: account.email ?? null,
                    description: `Publication de l'invitation « ${label} » sur MonInvit.com`,
                    amountXof: r.amount,
                    lines: r.lines,
                    slug: r.slug,
                  },
                  `facture-moninvit-${safeName}-${invoiceNumber}.pdf`,
                );
              };
              return (
                <li key={r.id}>
                  <div
                    className="rounded-[10px] bg-card px-3 py-3"
                    style={{ border: "0.5px solid hsl(var(--border))" }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="grid size-9 shrink-0 place-items-center rounded-full"
                        style={{ background: "#ecfdf5", color: "#047857" }}
                      >
                        <IconCircleCheck size={18} strokeWidth={1.75} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-serif text-[13px] italic">{label}</p>
                        <p className="truncate text-[10px] text-muted-foreground">
                          Publication{r.hasGuestbook ? " + Livre d'or" : ""} ·{" "}
                          {formatDateLong(r.publishedAt)}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[13px] font-medium tabular-nums">{formatXOF(r.amount)}</p>
                        <p className="text-[9px] uppercase tracking-wide text-emerald-700">Payé</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2 border-t border-border/50 pt-2">
                      <p className="truncate font-mono text-[9px] uppercase tracking-wide text-muted-foreground">
                        {invoiceNumber}
                      </p>
                      <button
                        type="button"
                        onClick={handleDownload}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-[11px] font-medium text-foreground transition active:scale-95"
                      >
                        <IconDownload size={13} strokeWidth={1.75} />
                        Facture PDF
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <p className="text-center text-[10px] text-muted-foreground">
        Pour toute question de facturation, contactez le support.
      </p>
    </div>
  );
}
