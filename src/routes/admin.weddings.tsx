import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { IconSearch, IconExternalLink } from "@tabler/icons-react";
import { listAllWeddings } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/weddings")({
  component: AdminWeddings,
});

function AdminWeddings() {
  const fetchWeddings = useServerFn(listAllWeddings);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "weddings"],
    queryFn: () => fetchWeddings(),
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    const s = q.trim().toLowerCase();
    return data.filter((w) => {
      if (filter === "published" && !w.is_published) return false;
      if (filter === "draft" && w.is_published) return false;
      if (!s) return true;
      return (
        w.bride_name.toLowerCase().includes(s) ||
        w.groom_name.toLowerCase().includes(s) ||
        (w.slug ?? "").toLowerCase().includes(s) ||
        (w.owner_email ?? "").toLowerCase().includes(s)
      );
    });
  }, [data, q, filter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl">Événements</h1>
          <p className="text-sm text-muted-foreground">{data?.length ?? 0} au total</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-full border border-border/60 bg-white text-[12px]">
            {(["all", "published", "draft"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={
                  "px-3 py-1.5 " +
                  (filter === k ? "bg-primary text-primary-foreground" : "text-muted-foreground")
                }
              >
                {k === "all" ? "Tous" : k === "published" ? "Publiés" : "Brouillons"}
              </button>
            ))}
          </div>
          <div className="relative">
            <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher…"
              className="rounded-full border border-border/60 bg-white py-1.5 pl-8 pr-3 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Couple</th>
              <th className="px-4 py-3">Propriétaire</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">RSVP</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">
                  Chargement…
                </td>
              </tr>
            )}
            {filtered.map((w) => (
              <tr key={w.id} className="hover:bg-neutral-50/60">
                <td className="px-4 py-3">
                  <p className="font-medium">
                    {w.bride_name} & {w.groom_name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{w.city ?? "—"}</p>
                </td>
                <td className="px-4 py-3 text-[12px] text-muted-foreground">
                  {w.owner_email ?? "—"}
                </td>
                <td className="px-4 py-3 text-[12px]">{w.event_type}</td>
                <td className="px-4 py-3 text-[12px] text-muted-foreground">
                  {w.wedding_date
                    ? new Date(w.wedding_date).toLocaleDateString("fr-FR")
                    : "—"}
                </td>
                <td className="px-4 py-3">{w.rsvp_count}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      "rounded-full px-2 py-0.5 text-[11px] " +
                      (w.is_published
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-neutral-100 text-neutral-600")
                    }
                  >
                    {w.is_published ? "Publié" : "Brouillon"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {w.is_published && w.slug ? (
                    <a
                      href={`/e/${w.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[12px] text-primary hover:underline"
                    >
                      <IconExternalLink size={12} /> Voir
                    </a>
                  ) : null}
                </td>
              </tr>
            ))}
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">
                  Aucun événement.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
