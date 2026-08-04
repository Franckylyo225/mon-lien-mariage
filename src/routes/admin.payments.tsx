import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { listPayments } from "@/lib/admin.functions";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/payments")({
  component: AdminPayments,
});

type Row = Awaited<ReturnType<typeof listPayments>>[number];

function formatXof(n: number) {
  return n.toLocaleString("fr-FR") + " XOF";
}

const STATUS_META: Record<string, { label: string; className: string }> = {
  pending: { label: "En attente", className: "bg-amber-100 text-amber-800" },
  success: { label: "Payé", className: "bg-emerald-100 text-emerald-800" },
  failed: { label: "Échoué", className: "bg-red-100 text-red-800" },
  abandoned: { label: "Annulé", className: "bg-muted text-muted-foreground" },
};

function statusMeta(s: string) {
  return STATUS_META[s] ?? { label: s, className: "bg-muted text-muted-foreground" };
}

const TYPE_LABEL: Record<string, string> = {
  publication: "Publication",
  addon_guestbook: "Livre d'or",
};

const FILTERS = [
  { key: "all", label: "Tous" },
  { key: "success", label: "Payés" },
  { key: "pending", label: "En attente" },
  { key: "failed", label: "Échoués" },
  { key: "abandoned", label: "Annulés" },
] as const;

function AdminPayments() {
  const fetchPayments = useServerFn(listPayments);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "payments"],
    queryFn: () => fetchPayments(),
  });

  const totals = useMemo(() => {
    const base = { total: 0, count: 0, pending: 0, failed: 0 };
    if (!data) return base;
    for (const p of data) {
      if (p.status === "success") {
        base.total += p.amount_xof;
        base.count += 1;
      } else if (p.status === "pending") base.pending += 1;
      else base.failed += 1;
    }
    return base;
  }, [data]);

  const rows = useMemo(() => {
    if (!data) return data;
    if (filter === "all") return data;
    return data.filter((p) => p.status === filter);
  }, [data, filter]);

  const columns: Column<Row>[] = [
    {
      key: "date",
      label: "Date",
      sortValue: (p) => p.created_at ?? "",
      csvValue: (p) => p.created_at ?? "",
      render: (p) => (
        <span className="text-[12px] text-muted-foreground">
          {p.created_at ? new Date(p.created_at).toLocaleString("fr-FR") : "—"}
        </span>
      ),
    },
    {
      key: "reference",
      label: "Référence Paystack",
      sortValue: (p) => p.reference,
      csvValue: (p) => p.reference,
      render: (p) => (
        <span className="font-mono text-[11px]">{p.reference}</span>
      ),
    },
    {
      key: "type",
      label: "Type",
      sortValue: (p) => p.payment_type,
      csvValue: (p) => p.payment_type,
      render: (p) => (
        <span className="text-[12px]">{TYPE_LABEL[p.payment_type] ?? p.payment_type}</span>
      ),
    },
    { key: "couple", label: "Couple", sortValue: (p) => p.couple, render: (p) => p.couple },
    {
      key: "client",
      label: "Client",
      sortValue: (p) => p.owner_email ?? "",
      csvValue: (p) => p.owner_email ?? "",
      render: (p) => (
        <span className="text-[12px] text-muted-foreground">{p.owner_email ?? "—"}</span>
      ),
    },
    {
      key: "status",
      label: "État",
      sortValue: (p) => p.status,
      csvValue: (p) => statusMeta(p.status).label,
      render: (p) => {
        const m = statusMeta(p.status);
        return (
          <span
            className={cn(
              "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
              m.className,
            )}
          >
            {m.label}
          </span>
        );
      },
    },
    {
      key: "amount",
      label: "Montant",
      align: "right",
      sortValue: (p) => p.amount_xof,
      csvValue: (p) => p.amount_xof,
      render: (p) => <span className="font-medium">{formatXof(p.amount_xof)}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl">Paiements</h1>
        <p className="text-sm text-muted-foreground">
          Historique complet des transactions Paystack (mode test inclus)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Revenu encaissé
          </div>
          <div className="text-xl font-semibold">{formatXof(totals.total)}</div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Payés</div>
          <div className="text-xl font-semibold">{totals.count}</div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            En attente
          </div>
          <div className="text-xl font-semibold">{totals.pending}</div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Échoués / annulés
          </div>
          <div className="text-xl font-semibold">{totals.failed}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-full border px-3 py-1 text-[12px] transition",
              filter === f.key
                ? "border-foreground bg-foreground text-background"
                : "border-border/60 bg-white text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <DataTable
        data={rows}
        columns={columns}
        isLoading={isLoading}
        searchable={(p) =>
          `${p.reference} ${p.couple} ${p.owner_email ?? ""} ${p.slug ?? ""} ${p.status}`
        }
        rowKey={(p) => p.id}
        filename="paiements.csv"
      />
    </div>
  );
}
