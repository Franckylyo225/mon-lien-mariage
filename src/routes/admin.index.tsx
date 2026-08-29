import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  IconUsers,
  IconCalendarHeart,
  IconWorldWww,
  IconCash,
  IconUsersGroup,
  IconTrendingUp,
  IconTrendingDown,
} from "@tabler/icons-react";
import { getPlatformStats } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

type PeriodKey = "week" | "month" | "year" | "custom";

const DAY_MS = 24 * 3600 * 1000;

function periodRange(key: PeriodKey, customFrom: string, customTo: string) {
  const now = Date.now();
  if (key === "week") return { from: new Date(now - 7 * DAY_MS).toISOString(), to: new Date(now).toISOString() };
  if (key === "month") return { from: new Date(now - 30 * DAY_MS).toISOString(), to: new Date(now).toISOString() };
  if (key === "year") return { from: new Date(now - 365 * DAY_MS).toISOString(), to: new Date(now).toISOString() };
  const from = customFrom ? new Date(customFrom + "T00:00:00").toISOString() : new Date(now - 30 * DAY_MS).toISOString();
  const to = customTo ? new Date(customTo + "T23:59:59").toISOString() : new Date(now).toISOString();
  return { from, to };
}

function formatPeriodLabel(range: { from: string; to: string }) {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  return `${fmt(range.from)} — ${fmt(range.to)}`;
}

function formatXof(n: number) {
  return n.toLocaleString("fr-FR") + " XOF";
}

function TrendBadge({ value }: { value: number }) {
  if (value === 0)
    return <span className="text-[11px] text-muted-foreground">—</span>;
  const positive = value > 0;
  const Icon = positive ? IconTrendingUp : IconTrendingDown;
  return (
    <span
      className={
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium " +
        (positive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700")
      }
    >
      <Icon size={11} />
      {positive ? "+" : ""}
      {value}%
    </span>
  );
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

  const cards = [
    {
      label: "Utilisateurs",
      value: data.users.toLocaleString("fr-FR"),
      trend: data.trends.users,
      Icon: IconUsers,
      tint: "bg-blue-50 text-blue-700",
    },
    {
      label: "Événements",
      value: data.weddings.toLocaleString("fr-FR"),
      trend: data.trends.weddings,
      Icon: IconCalendarHeart,
      tint: "bg-rose-50 text-rose-700",
    },
    {
      label: "Publiés",
      value: data.published.toLocaleString("fr-FR"),
      trend: data.trends.published,
      Icon: IconWorldWww,
      tint: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Revenu total",
      value: formatXof(data.revenueXof),
      trend: data.trends.revenue,
      Icon: IconCash,
      tint: "bg-amber-50 text-amber-800",
    },
    {
      label: "RSVP reçus",
      value: data.rsvps.toLocaleString("fr-FR"),
      trend: data.trends.rsvps,
      Icon: IconUsersGroup,
      tint: "bg-violet-50 text-violet-700",
    },
    {
      label: "Taux conversion",
      value: `${data.conversionRate}%`,
      trend: 0,
      Icon: IconTrendingUp,
      tint: "bg-slate-100 text-slate-700",
    },
  ];

  const maxDay = Math.max(1, ...data.publishedSeries.map((d) => d.count));
  const maxRsvp = Math.max(1, ...data.rsvpSeries.map((d) => d.count));
  const maxTheme = Math.max(1, ...data.topThemes.map((t) => t.count));

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
        <h1 className="font-serif text-2xl">Vue d'ensemble</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pilotez la plateforme : croissance, publications, revenus.
        </p>
      </div>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <div
            key={c.label}
            className="group rounded-2xl border border-border/60 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-12px_rgba(16,24,40,0.25)]"
          >
            <div className="mb-3 flex items-start justify-between">
              <div className={`inline-grid size-9 place-items-center rounded-xl ${c.tint}`}>
                <c.Icon size={17} />
              </div>
              <TrendBadge value={c.trend} />
            </div>
            <div className="text-[20px] font-semibold leading-tight tracking-tight">{c.value}</div>
            <div className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {c.label}
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)] lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
            <div>
              <h2 className="font-serif text-lg">Revenus — 30 derniers jours</h2>
              <p className="text-[12px] text-muted-foreground">
                1 publication = {formatXof(data.pricePerPublish)}
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-medium text-emerald-700">
              {formatXof(data.revenue30Xof)}
            </span>
          </div>
          <div className="flex h-36 items-end gap-[3px] px-5 py-4">
            {data.publishedSeries.map((d) => (
              <div
                key={d.date}
                className="group relative flex-1 rounded-t-md bg-gradient-to-t from-primary/40 to-primary/90 transition hover:from-primary/60 hover:to-primary"
                style={{ height: `${(d.count / maxDay) * 100}%`, minHeight: d.count ? 4 : 2 }}
              >
                <span className="pointer-events-none absolute -top-7 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-neutral-900 px-2 py-1 text-[10px] text-white opacity-0 shadow-lg group-hover:opacity-100">
                  {d.date} · {d.count} · {formatXof(d.revenueXof)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
          <h2 className="border-b border-border/50 px-5 py-4 font-serif text-lg">Top thèmes</h2>
          <ul className="space-y-3 px-5 py-4">
            {data.topThemes.map((t) => (
              <li key={t.theme} className="space-y-1.5">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="capitalize">{t.theme.replace(/-/g, " ")}</span>
                  <span className="tabular-nums text-muted-foreground">{t.count}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary"
                    style={{ width: `${(t.count / maxTheme) * 100}%` }}
                  />
                </div>
              </li>
            ))}
            {data.topThemes.length === 0 && (
              <li className="text-[12px] text-muted-foreground">Aucun thème utilisé.</li>
            )}
          </ul>
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
          <h2 className="font-serif text-lg">RSVP — 30 derniers jours</h2>
          <span className="rounded-full bg-violet-50 px-3 py-1 text-[12px] font-medium text-violet-700">
            Total : {data.rsvps.toLocaleString("fr-FR")}
          </span>
        </div>
        <div className="flex h-28 items-end gap-[3px] px-5 py-4">
          {data.rsvpSeries.map((d) => (
            <div
              key={d.date}
              className="flex-1 rounded-t-md bg-gradient-to-t from-violet-200 to-violet-400"
              style={{ height: `${(d.count / maxRsvp) * 100}%`, minHeight: d.count ? 4 : 2 }}
              title={`${d.date} — ${d.count}`}
            />
          ))}
        </div>
      </section>


      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-border/60 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
          <h2 className="border-b border-border/50 px-5 py-4 font-serif text-lg">Derniers événements</h2>
          <ul className="divide-y divide-border/50">
            {data.recentWeddings.map((w) => (
              <li key={w.id} className="flex items-center gap-3 px-5 py-3 text-sm transition hover:bg-neutral-50/70">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-rose-50 font-serif text-[12px] italic text-rose-700">
                  {(w.bride_name?.[0] ?? "?").toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate">{w.bride_name} & {w.groom_name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(w.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <span
                  className={
                    "shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium " +
                    (w.is_published
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-neutral-100 text-neutral-600")
                  }
                >
                  {w.is_published ? "Publié" : "Brouillon"}
                </span>
              </li>
            ))}
            {data.recentWeddings.length === 0 && (
              <li className="px-5 py-4 text-sm text-muted-foreground">Aucun événement.</li>
            )}
          </ul>
        </section>

        <section className="rounded-2xl border border-border/60 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
          <h2 className="border-b border-border/50 px-5 py-4 font-serif text-lg">Derniers inscrits</h2>
          <ul className="divide-y divide-border/50">
            {data.recentUsers.map((u) => (
              <li key={u.id} className="flex items-center gap-3 px-5 py-3 text-sm transition hover:bg-neutral-50/70">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-blue-50 text-[12px] font-medium text-blue-700">
                  {(u.user_first_name?.[0] ?? u.email?.[0] ?? "?").toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
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
