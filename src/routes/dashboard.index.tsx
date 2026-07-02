import { createFileRoute, Link } from "@tanstack/react-router";
import {
  useWedding,
  daysUntil,
  guestStats,
  formatShortDate,
  nextCeremony,
} from "@/lib/wedding-store";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

function DashboardHome() {
  const { couple, ceremonies, guests } = useWedding();
  const days = daysUntil(couple.weddingDate);
  const stats = guestStats(guests);
  const upcoming = nextCeremony(ceremonies);

  const perCeremony = ceremonies.map((c) => {
    const s = guestStats(guests, c.id);
    return { c, s };
  });
  const totalConfirmedAll = perCeremony.reduce((a, b) => a + b.s.confirmés, 0) || 1;

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-50">
          Bienvenue, {couple.brideName}
        </p>
        <h1 className="mt-1 font-serif text-3xl italic">Tableau de bord</h1>
      </div>

      {/* Countdown */}
      <div className="relative overflow-hidden rounded-3xl bg-primary p-8 text-primary-foreground">
        <div className="absolute -right-6 -top-6 size-40 rounded-full bg-white/10 blur-3xl" />
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-80">
          Compte à rebours
        </p>
        <p className="mt-2 font-serif text-5xl italic">J − {days}</p>
        <p className="mt-1 text-sm opacity-80">{formatShortDate(couple.weddingDate)}</p>
        {upcoming ? (
          <p className="mt-4 inline-block rounded-full bg-white/15 px-3 py-1 font-mono text-[10px] uppercase tracking-widest">
            Prochaine : {upcoming.label} · {upcoming.timeStart}
          </p>
        ) : null}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total RSVP" value={stats.total} />
        <StatCard label="Confirmés" value={stats.confirmés} tone="primary" />
        <StatCard label="En attente" value={stats.en_attente} tone="warn" />
        <StatCard label="Déclinés" value={stats.déclinés} tone="mute" />
      </div>

      {/* Répartition par cérémonie */}
      <section className="rounded-3xl border border-border bg-card p-6">
        <h2 className="font-serif text-lg italic">Répartition par cérémonie</h2>
        <div className="mt-5 space-y-4">
          {perCeremony.map(({ c, s }) => {
            const pct = Math.round((s.confirmés / totalConfirmedAll) * 100);
            return (
              <div key={c.id}>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                    <span>{c.label}</span>
                  </div>
                  <span className="font-mono opacity-70">
                    {s.confirmés} conf. · {s.en_attente} att.
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{ width: pct + "%", backgroundColor: c.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Ceremonies status */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-lg italic">Statut des cérémonies</h2>
          <Link
            to="/dashboard/ceremonies"
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary hover:underline"
          >
            Gérer
          </Link>
        </div>
        <div className="space-y-2">
          {ceremonies.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: c.color }}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm">{c.name}</p>
                  <p className="font-mono text-[10px] uppercase tracking-widest opacity-60">
                    {formatShortDate(c.date)} · {c.timeStart}
                  </p>
                </div>
              </div>
              <span
                className={
                  "shrink-0 rounded-full px-2 py-1 font-mono text-[9px] uppercase tracking-widest " +
                  (c.status === "publiée"
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground")
                }
              >
                {c.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/dashboard/invites"
          className="rounded-2xl bg-foreground py-4 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-background transition hover:opacity-90"
        >
          + Ajouter un invité
        </Link>
        <Link
          to="/dashboard/ceremonies"
          className="rounded-2xl border border-foreground/15 py-4 text-center font-mono text-[10px] uppercase tracking-[0.25em] transition hover:bg-accent/20"
        >
          + Cérémonie
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "primary" | "warn" | "mute";
}) {
  const color =
    tone === "primary"
      ? "text-primary"
      : tone === "warn"
        ? "text-amber-600"
        : tone === "mute"
          ? "text-muted-foreground"
          : "text-foreground";
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="font-mono text-[9px] uppercase tracking-widest opacity-50">{label}</p>
      <p className={"mt-1 font-mono text-2xl " + color}>{value}</p>
    </div>
  );
}
