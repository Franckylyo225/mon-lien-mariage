import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { IconExternalLink } from "@tabler/icons-react";
import { listAllWeddings } from "@/lib/admin.functions";
import { DataTable, type Column } from "@/components/admin/DataTable";

export const Route = createFileRoute("/admin/weddings")({
  component: AdminWeddings,
});

type Row = Awaited<ReturnType<typeof listAllWeddings>>[number];

function AdminWeddings() {
  const fetchWeddings = useServerFn(listAllWeddings);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "weddings"],
    queryFn: () => fetchWeddings(),
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    if (filter === "all") return data;
    return data.filter((w) => (filter === "published" ? w.is_published : !w.is_published));
  }, [data, filter]);

  const columns: Column<Row>[] = [
    {
      key: "couple",
      label: "Couple",
      sortValue: (w) => `${w.bride_name} ${w.groom_name}`,
      csvValue: (w) => `${w.bride_name} & ${w.groom_name}`,
      render: (w) => (
        <div>
          <p className="font-medium">{w.bride_name} & {w.groom_name}</p>
          <p className="text-[11px] text-muted-foreground">{w.city ?? "—"}</p>
        </div>
      ),
    },
    {
      key: "owner",
      label: "Propriétaire",
      sortValue: (w) => w.owner_email ?? "",
      csvValue: (w) => w.owner_email ?? "",
      render: (w) => <span className="text-[12px] text-muted-foreground">{w.owner_email ?? "—"}</span>,
    },
    { key: "type", label: "Type", sortValue: (w) => w.event_type ?? "", render: (w) => <span className="text-[12px] capitalize">{w.event_type}</span> },
    { key: "theme", label: "Thème", sortValue: (w) => (w as any).theme ?? "", render: (w) => <span className="text-[12px] capitalize text-muted-foreground">{((w as any).theme ?? "—").toString().replace(/-/g, " ")}</span> },
    {
      key: "date",
      label: "Date",
      sortValue: (w) => w.wedding_date ?? "",
      render: (w) => (
        <span className="text-[12px] text-muted-foreground">
          {w.wedding_date ? new Date(w.wedding_date).toLocaleDateString("fr-FR") : "—"}
        </span>
      ),
    },
    { key: "rsvp", label: "RSVP", sortValue: (w) => w.rsvp_count, align: "right", render: (w) => w.rsvp_count },
    {
      key: "status",
      label: "Statut",
      sortValue: (w) => (w.is_published ? 1 : 0),
      csvValue: (w) => (w.is_published ? "publié" : "brouillon"),
      render: (w) => (
        <span
          className={
            "rounded-full px-2 py-0.5 text-[11px] " +
            (w.is_published ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-600")
          }
        >
          {w.is_published ? "Publié" : "Brouillon"}
        </span>
      ),
    },
    {
      key: "link",
      label: "",
      align: "right",
      render: (w) =>
        w.slug ? (
          <a
            href={`/e/${w.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-white px-2 py-1 text-[11px] hover:bg-secondary"
          >
            <IconExternalLink size={11} /> Voir
          </a>
        ) : null,
    },
  ];

  const filters = (
    <div className="flex overflow-hidden rounded-full border border-border/60 bg-white text-[12px]">
      {(["all", "published", "draft"] as const).map((k) => (
        <button
          key={k}
          onClick={() => setFilter(k)}
          className={
            "px-3 py-1.5 " +
            (filter === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary")
          }
        >
          {k === "all" ? "Tous" : k === "published" ? "Publiés" : "Brouillons"}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl">Événements</h1>
        <p className="text-sm text-muted-foreground">{data?.length ?? 0} au total</p>
      </div>
      <DataTable
        data={filtered}
        columns={columns}
        isLoading={isLoading}
        searchable={(w) => `${w.bride_name} ${w.groom_name} ${w.slug ?? ""} ${w.owner_email ?? ""} ${w.city ?? ""}`}
        rowKey={(w) => w.id}
        filters={filters}
        filename="evenements.csv"
      />
    </div>
  );
}
