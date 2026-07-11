import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { IconReceipt, IconCircleCheck } from "@tabler/icons-react";
import { supabase } from "@/integrations/supabase/client";
import { useWedding } from "@/lib/wedding-store";

export const Route = createFileRoute("/dashboard/billing")({
  head: () => ({ meta: [{ title: "Paiement & facture — MonInvit.com" }] }),
  component: BillingPage,
});

const UNIT_PRICE_XOF = 24900;

interface PaymentRow {
  id: string;
  brideName: string;
  groomName: string;
  publishedAt: string;
  slug: string | null;
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
      const { data, error } = await supabase
        .from("weddings")
        .select("id, bride_name, groom_name, published_at, slug, is_published")
        .eq("is_published", true)
        .not("published_at", "is", null)
        .order("published_at", { ascending: false });
      if (cancelled) return;
      if (error) {
        setError(error.message);
        setRows([]);
        return;
      }
      setRows(
        (data ?? []).map((w) => ({
          id: w.id as string,
          brideName: (w.bride_name as string) ?? "",
          groomName: (w.groom_name as string) ?? "",
          publishedAt: (w.published_at as string) ?? "",
          slug: (w.slug as string | null) ?? null,
        })),
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

  const total = rows.length * UNIT_PRICE_XOF;

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
              return (
                <li key={r.id}>
                  <div
                    className="flex items-center gap-3 rounded-[10px] bg-card px-3 py-3"
                    style={{ border: "0.5px solid hsl(var(--border))" }}
                  >
                    <span
                      className="grid size-9 shrink-0 place-items-center rounded-full"
                      style={{ background: "#ecfdf5", color: "#047857" }}
                    >
                      <IconCircleCheck size={18} strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-serif text-[13px] italic">{label}</p>
                      <p className="truncate text-[10px] text-muted-foreground">
                        Publication · {formatDateLong(r.publishedAt)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[13px] font-medium tabular-nums">{formatXOF(UNIT_PRICE_XOF)}</p>
                      <p className="text-[9px] uppercase tracking-wide text-emerald-700">Payé</p>
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
