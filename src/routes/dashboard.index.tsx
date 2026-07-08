import { createFileRoute, Link } from "@tanstack/react-router";
import {
  IconShare,
  IconChevronRight,
  IconCheck,
} from "@tabler/icons-react";
import {
  useWedding,
  daysUntil,
  formatFrenchDate,
  configProgress,
} from "@/lib/wedding-store";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "Accueil — MonMariage.ci" }] }),
  component: DashboardHome,
});

function DashboardHome() {
  const { couple, ceremonies, guests } = useWedding();
  const days = couple.weddingDate ? daysUntil(couple.weddingDate) : null;
  const { pct, items } = configProgress({ couple, ceremonies, guests });
  const todo = items.filter((i) => !i.done).slice(0, 4);
  const done = items.filter((i) => i.done);

  return (
    <div className="space-y-8 pt-2">
      {couple.isPublished && couple.slug ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-[#059669]/25 bg-[#059669]/10 px-4 py-3">
          <p className="text-[12px] text-[#065F46]">Votre mariage est publié</p>
          <Link
            to="/e/$slug"
            params={{ slug: couple.slug }}
            className="flex items-center gap-1 text-[11px] font-medium text-[#065F46] underline"
          >
            <IconShare size={14} /> Partager
          </Link>
        </div>
      ) : null}

      {/* Prénoms */}
      <section className="pt-4 text-center">
        <p className="font-serif text-[42px] italic leading-tight">
          {couple.brideName || "Prénom A"}
        </p>
        <p className="my-1 font-serif text-[22px] italic text-primary">&</p>
        <p className="font-serif text-[42px] italic leading-tight">
          {couple.groomName || "Prénom B"}
        </p>
        <p className="mt-5 text-[12px] text-muted-foreground">
          {couple.weddingDate ? (
            <>
              {formatFrenchDate(couple.weddingDate)}
              {days !== null ? (
                <> · <span className="text-primary">{days} jours</span></>
              ) : null}
            </>
          ) : (
            <Link to="/dashboard/ceremonies" className="underline">
              Date à définir
            </Link>
          )}
        </p>
      </section>

      {/* Progress */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Configuration
          </p>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-foreground">
            {pct}%
          </p>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-foreground transition-all duration-500 ease-out"
            style={{ width: pct + "%" }}
          />
        </div>
      </section>

      {/* Metrics */}
      <section className="grid grid-cols-2 gap-3">
        <Metric label="Cérémonies" value={ceremonies.length} to="/dashboard/ceremonies" />
        <Metric label="Invités" value={guests.length} to="/dashboard/guests" />
      </section>

      {/* Checklist */}
      {todo.length > 0 ? (
        <section>
          <h2 className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            À finaliser
          </h2>
          <ul className="divide-y divide-border/60 rounded-xl border border-border bg-card">
            {todo.map((i) => (
              <li key={i.label}>
                <Link
                  to={destFor(i.label)}
                  className="flex items-center gap-3 px-4 py-3 transition active:bg-secondary/60"
                >
                  <span className="grid size-5 shrink-0 place-items-center rounded-full border border-border" />
                  <span className="min-w-0 flex-1 text-[13px]">{i.label}</span>
                  <IconChevronRight size={16} className="text-muted-foreground" />
                </Link>
              </li>
            ))}
            {done.slice(0, 2).map((i) => (
              <li key={i.label} className="flex items-center gap-3 px-4 py-3">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                  <IconCheck size={12} strokeWidth={3} />
                </span>
                <span className="min-w-0 flex-1 text-[13px] text-muted-foreground line-through">
                  {i.label}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* CTA */}
      <Link
        to="/dashboard/preview"
        className="block w-full rounded-xl bg-foreground py-4 text-center text-[13px] font-medium text-background transition active:scale-[0.99]"
      >
        Voir ma page d'invitation
      </Link>
    </div>
  );
}

function Metric({ label, value, to }: { label: string; value: number; to: string }) {
  return (
    <Link
      to={to}
      className="rounded-xl border border-border bg-card p-4 transition active:bg-secondary/60"
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-serif text-[22px] italic leading-none">{value}</p>
    </Link>
  );
}

function destFor(label: string): string {
  if (label.includes("Prénoms") || label.includes("Date") || label.includes("Photo") || label.includes("Thème"))
    return "/dashboard/landing";
  if (label.toLowerCase().includes("cérémonie")) return "/dashboard/ceremonies";
  if (label.toLowerCase().includes("invités")) return "/dashboard/guests";
  return "/dashboard";
}
