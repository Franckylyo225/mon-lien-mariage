import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { listPayments } from "@/lib/admin.functions";
import { DataTable, type Column } from "@/components/admin/DataTable";

export const Route = createFileRoute("/admin/payments")({
  component: AdminPayments,
});

type Row = Awaited<ReturnType<typeof listPayments>>[number];

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

  const columns: Column<Row>[] = [
    {
      key: "date",
      label: "Date",
      sortValue: (p) => p.paid_at ?? "",
      csvValue: (p) => p.paid_at ?? "",
      render: (p) => (
        <span className="text-[12px] text-muted-foreground">
          {p.paid_at ? new Date(p.paid_at).toLocaleString("fr-FR") : "—"}
        </span>
      ),
    },
    { key: "couple", label: "Couple", sortValue: (p) => p.couple, render: (p) => p.couple },
    {
      key: "client",
      label: "Client",
      sortValue: (p) => p.owner_email ?? "",
      csvValue: (p) => p.owner_email ?? "",
      render: (p) => <span className="text-[12px] text-muted-foreground">{p.owner_email ?? "—"}</span>,
    },
    {
      key: "slug",
      label: "Slug",
      sortValue: (p) => p.slug ?? "",
      render: (p) => <span className="text-[12px] text-muted-foreground">{p.slug ?? "—"}</span>,
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
        <p className="text-sm text-muted-foreground">Historique des publications payées</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Revenu total</div>
          <div className="text-xl font-semibold">{formatXof(totals.total)}</div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Ce mois-ci</div>
          <div className="text-xl font-semibold">{formatXof(totals.thisMonth)}</div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Transactions</div>
          <div className="text-xl font-semibold">{totals.count}</div>
        </div>
      </div>

      <DataTable
        data={data}
        columns={columns}
        isLoading={isLoading}
        searchable={(p) => `${p.couple} ${p.owner_email ?? ""} ${p.slug ?? ""}`}
        rowKey={(p) => p.wedding_id}
        filename="paiements.csv"
      />
    </div>
  );
}
