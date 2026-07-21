import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  IconUsers,
  IconCalendarHeart,
  IconWorldWww,
  IconCash,
  IconUsersGroup,
} from "@tabler/icons-react";
import { getPlatformStats } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function formatXof(n: number) {
  return n.toLocaleString("fr-FR") + " XOF";
}

function AdminOverview() {
  const fetchStats = useServerFn(getPlatformStats);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => fetchStats(),
    retry: false,
  });


  if (isLoading) return <p className="text-sm text-muted-foreground">Chargement…</p>;
  if (error || !data)
    return (
      <p className="text-sm text-destructive">
        Impossible de charger les statistiques. {(error as Error)?.message}
      </p>
    );

  const maxDay = Math.max(1, ...data.publishedSeries.map((d) => d.count));

  const cards = [
    { label: "Utilisateurs", value: data.users, Icon: IconUsers, tint: "bg-blue-50 text-blue-700" },
    { label: "Événements", value: data.weddings, Icon: IconCalendarHeart, tint: "bg-rose-50 text-rose-700" },
    { label: "Publiés", value: data.published, Icon: IconWorldWww, tint: "bg-emerald-50 text-emerald-700" },
    {
      label: "Revenu total",
      value: formatXof(data.revenueXof),
      Icon: IconCash,
      tint: "bg-amber-50 text-amber-800",
    },
    { label: "RSVP reçus", value: data.rsvps, Icon: IconUsersGroup, tint: "bg-violet-50 text-violet-700" },
    { label: "Invités ajoutés", value: data.guests, Icon: IconUsersGroup, tint: "bg-slate-100 text-slate-700" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl">Vue d'ensemble</h1>
        <p className="text-sm text-muted-foreground">
          Pilotez la plateforme : croissance, publications, revenus.
        </p>
      </div>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm"
          >
            <div className={`mb-2 inline-grid size-8 place-items-center rounded-full ${c.tint}`}>
              <c.Icon size={16} />
            </div>
            <div className="text-lg font-semibold">{c.value}</div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {c.label}
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg">Publications — 30 derniers jours</h2>
            <p className="text-[12px] text-muted-foreground">
              1 publication = {formatXof(data.pricePerPublish)}
            </p>
          </div>
        </div>
        <div className="flex h-32 items-end gap-[3px]">
          {data.publishedSeries.map((d) => (
            <div
              key={d.date}
              className="flex-1 rounded-t bg-primary/80"
              style={{ height: `${(d.count / maxDay) * 100}%`, minHeight: d.count ? 4 : 2 }}
              title={`${d.date} — ${d.count}`}
            />
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-serif text-lg">Derniers événements</h2>
          <ul className="divide-y divide-border/60">
            {data.recentWeddings.map((w) => (
              <li key={w.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate">
                    {w.bride_name} & {w.groom_name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(w.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <span
                  className={
                    "shrink-0 rounded-full px-2 py-0.5 text-[10px] " +
                    (w.is_published
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-neutral-100 text-neutral-600")
                  }
                >
                  {w.is_published ? "Publié" : "Brouillon"}
                </span>
              </li>
            ))}
            {data.recentWeddings.length === 0 && (
              <li className="py-2 text-sm text-muted-foreground">Aucun événement.</li>
            )}
          </ul>
        </section>

        <section className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-serif text-lg">Derniers inscrits</h2>
          <ul className="divide-y divide-border/60">
            {data.recentUsers.map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate">{u.user_first_name ?? u.email ?? "Utilisateur"}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{u.email}</p>
                </div>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {new Date(u.created_at).toLocaleDateString("fr-FR")}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
