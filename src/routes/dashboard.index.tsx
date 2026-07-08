import { createFileRoute, Link } from "@tanstack/react-router";
import {
  useWedding,
  daysUntil,
  guestStats,
  formatFrenchDate,
  configProgress,
} from "@/lib/wedding-store";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "Tableau de bord — MonMariage.ci" }] }),
  component: DashboardHome,
});

function DashboardHome() {
  const { couple, ceremonies, guests } = useWedding();
  const days = couple.weddingDate ? daysUntil(couple.weddingDate) : null;
  const stats = guestStats(guests);
  const { pct, items } = configProgress({ couple, ceremonies, guests });

  return (
    <div className="space-y-10">
      {/* Prénoms du couple */}
      <section className="text-center py-6">
        <p className="font-serif text-4xl italic sm:text-5xl">{couple.brideName}</p>
        <p className="my-2 font-serif text-2xl italic text-primary sm:text-3xl">&</p>
        <p className="font-serif text-4xl italic sm:text-5xl">{couple.groomName}</p>
        <p className="mt-6 text-sm text-muted-foreground">
          {couple.weddingDate ? (
            <>
              {formatFrenchDate(couple.weddingDate)}
              {days !== null ? <> · <span className="text-primary">{days} jours</span></> : null}
            </>
          ) : (
            <Link to="/dashboard/ceremonies" className="underline">
              Date à définir
            </Link>
          )}
        </p>
      </section>

      {/* Progression */}
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Configuration</p>
          <p className="font-mono text-sm">{pct}%</p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-foreground transition-all"
            style={{ width: pct + "%" }}
          />
        </div>
        <ul className="mt-5 space-y-2">
          {items.slice(0, 4).map((i) => (
            <li
              key={i.label}
              className={
                "flex items-center gap-3 text-sm " +
                (i.done ? "text-muted-foreground line-through" : "")
              }
            >
              <span
                className={
                  "grid size-5 shrink-0 place-items-center rounded-full text-[10px] " +
                  (i.done
                    ? "bg-primary text-primary-foreground"
                    : "border border-border")
                }
              >
                {i.done ? "✓" : ""}
              </span>
              {i.label}
            </li>
          ))}
        </ul>
      </section>

      {/* Métriques */}
      <section className="grid grid-cols-2 gap-3">
        <MetricCard label="Cérémonies" value={ceremonies.length} to="/dashboard/ceremonies" />
        <MetricCard label="Invités" value={guests.length} to="/dashboard/guests" />
      </section>

      {/* KPI RSVP */}
      <section>
        <h2 className="mb-3 font-serif text-lg italic">Réponses des invités</h2>
        <div className="grid grid-cols-3 gap-2">
          <KPI label="Confirmés" value={stats.confirmés} tone="primary" />
          <KPI label="En attente" value={stats.en_attente} />
          <KPI label="Refus" value={stats.déclinés} tone="mute" />
        </div>
      </section>

      {/* Actions */}
      <section className="grid gap-3 sm:grid-cols-2">
        <Link
          to="/dashboard/guests/new"
          className="rounded-lg border border-border bg-card px-4 py-4 text-sm font-medium transition hover:bg-secondary/40"
        >
          + Ajouter un invité
        </Link>
        <Link
          to="/dashboard/ceremonies"
          className="rounded-lg border border-border bg-card px-4 py-4 text-sm font-medium transition hover:bg-secondary/40"
        >
          Gérer les cérémonies
        </Link>
      </section>

      {couple.isPublished && couple.slug ? (
        <div className="space-y-3">
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-center">
            <p className="font-mono text-[10px] uppercase tracking-widest text-primary">
              Publié le {new Date(couple.publishedAt ?? "").toLocaleDateString("fr-FR")}
            </p>
            <p className="mt-1 text-sm">Votre page est en ligne.</p>
          </div>
          <Link
            to="/e/$slug"
            params={{ slug: couple.slug }}
            className="block w-full rounded-lg bg-primary py-4 text-center text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Voir ma page publique
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <Link
            to="/dashboard/preview"
            className="block w-full rounded-lg border border-border bg-card py-4 text-center text-sm font-medium transition hover:bg-secondary/40"
          >
            Aperçu privé de ma page
          </Link>
          <Link
            to="/publish"
            className="block w-full rounded-lg bg-primary py-4 text-center text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Publier mon invitation
          </Link>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, to }: { label: string; value: number; to: string }) {
  return (
    <Link
      to={to}
      className="rounded-xl border border-border bg-card p-5 transition hover:border-primary"
    >
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 font-serif text-3xl italic">{value}</p>
    </Link>
  );
}

function KPI({ label, value, tone }: { label: string; value: number; tone?: "primary" | "mute" }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 text-center">
      <p
        className={
          "font-serif text-3xl italic " +
          (tone === "primary" ? "text-primary" : tone === "mute" ? "text-muted-foreground" : "")
        }
      >
        {value}
      </p>
      <p className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
