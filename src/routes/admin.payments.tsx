import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { listPayments } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/payments")({
  component: AdminPayments,
});

function formatXof(n: number) {
  return n.toLocaleString("fr-FR") + " XOF";
}

function AdminPayments() {
  const fetchPayments = useServerFn(listPayments);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "payments"],
    queryFn: () => fetchPayments(),
  });

  const totals = useMemo(() => {
    if (!data) return { total: 0, count: 0, thisMonth: 0 };
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    let thisMonth = 0;
    let total = 0;
    for (const p of data) {
      total += p.amount_xof;
      if (String(p.paid_at).slice(0, 7) === monthKey) thisMonth += p.amount_xof;
    }
    return { total, count: data.length, thisMonth };
  }, [data]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl">Paiements</h1>
        <p className="text-sm text-muted-foreground">
          Historique des publications payées via Paystack
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Revenu total
          </div>
          <div className="text-xl font-semibold">{formatXof(totals.total)}</div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Ce mois-ci
          </div>
          <div className="text-xl font-semibold">{formatXof(totals.thisMonth)}</div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Transactions
          </div>
          <div className="text-xl font-semibold">{totals.count}</div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Couple</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3 text-right">Montant</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                  Chargement…
                </td>
              </tr>
            )}
            {(data ?? []).map((p) => (
              <tr key={p.wedding_id} className="hover:bg-neutral-50/60">
                <td className="px-4 py-3 text-[12px] text-muted-foreground">
                  {p.paid_at ? new Date(p.paid_at).toLocaleString("fr-FR") : "—"}
                </td>
                <td className="px-4 py-3">{p.couple}</td>
                <td className="px-4 py-3 text-[12px] text-muted-foreground">
                  {p.owner_email ?? "—"}
                </td>
                <td className="px-4 py-3 text-[12px] text-muted-foreground">
                  {p.slug ?? "—"}
                </td>
                <td className="px-4 py-3 text-right font-medium">{formatXof(p.amount_xof)}</td>
              </tr>
            ))}
            {!isLoading && (data ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                  Aucun paiement.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
