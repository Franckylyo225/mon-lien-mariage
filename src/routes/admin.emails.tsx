import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { IconMailCheck, IconMailX, IconClock } from "@tabler/icons-react";
import { listEmailLog } from "@/lib/admin.functions";
import { DataTable, type Column } from "@/components/admin/DataTable";

export const Route = createFileRoute("/admin/emails")({
  component: AdminEmails,
});

type Row = Awaited<ReturnType<typeof listEmailLog>>["logs"][number];

function AdminEmails() {
  const fetch = useServerFn(listEmailLog);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "emails"],
    queryFn: () => fetch(),
  });

  const totals = data?.totals ?? { sent: 0, failed: 0, last24: 0 };

  const columns: Column<Row>[] = [
    {
      key: "date",
      label: "Date",
      sortValue: (r) => r.created_at,
      render: (r) => (
        <span className="text-[12px] text-muted-foreground">
          {new Date(r.created_at).toLocaleString("fr-FR")}
        </span>
      ),
    },
    {
      key: "template",
      label: "Template",
      sortValue: (r) => r.template_name ?? "",
      render: (r) => <span className="text-[12px]">{r.template_name ?? "—"}</span>,
    },
    {
      key: "recipient",
      label: "Destinataire",
      sortValue: (r) => r.recipient_email ?? "",
      render: (r) => <span className="text-[12px]">{r.recipient_email ?? "—"}</span>,
    },
    {
      key: "status",
      label: "Statut",
      sortValue: (r) => r.status ?? "",
      render: (r) => {
        const s = r.status ?? "";
        const cls =
          s === "sent"
            ? "bg-emerald-50 text-emerald-700"
            : s === "failed"
              ? "bg-rose-50 text-rose-700"
              : "bg-amber-50 text-amber-700";
        return <span className={`rounded-full px-2 py-0.5 text-[11px] ${cls}`}>{s || "—"}</span>;
      },
    },
    {
      key: "error",
      label: "Erreur",
      render: (r) =>
        r.error_message ? (
          <span className="line-clamp-2 max-w-xs text-[11px] text-rose-700">{r.error_message}</span>
        ) : (
          <span className="text-[11px] text-muted-foreground">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl">Emails</h1>
        <p className="text-sm text-muted-foreground">
          Journal des envois transactionnels (auth, notifications).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
          <div className="mb-1 inline-grid size-8 place-items-center rounded-full bg-emerald-50 text-emerald-700">
            <IconMailCheck size={16} />
          </div>
          <div className="text-xl font-semibold">{totals.sent.toLocaleString("fr-FR")}</div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Envoyés</div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
          <div className="mb-1 inline-grid size-8 place-items-center rounded-full bg-rose-50 text-rose-700">
            <IconMailX size={16} />
          </div>
          <div className="text-xl font-semibold">{totals.failed.toLocaleString("fr-FR")}</div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Échecs</div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
          <div className="mb-1 inline-grid size-8 place-items-center rounded-full bg-blue-50 text-blue-700">
            <IconClock size={16} />
          </div>
          <div className="text-xl font-semibold">{totals.last24.toLocaleString("fr-FR")}</div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Dernières 24h</div>
        </div>
      </div>

      <DataTable
        data={data?.logs}
        columns={columns}
        isLoading={isLoading}
        searchable={(r) => `${r.recipient_email ?? ""} ${r.template_name ?? ""} ${r.status ?? ""}`}
        rowKey={(r) => r.id}
        filename="emails.csv"
      />
    </div>
  );
}
