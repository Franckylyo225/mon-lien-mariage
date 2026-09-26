import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  CalendarClock,
  CircleCheck,
  LayoutList,
  PartyPopper,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  configProgress,
  confirmedHeadcount,
  daysUntil,
  formatFrenchDate,
  isPastEvent,
  useWedding,
} from "@/lib/wedding-store";
import { useAllGuests, type PublicRsvpRow } from "@/hooks/use-all-guests";
import { useCountUp } from "@/hooks/use-count-up";
import { Skeleton } from "@/components/ui/skeleton";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** People confirmed through the public form during the last 7 days (one headcount per guest). */
function confirmedThisWeek(rsvps: PublicRsvpRow[]): number {
  const since = Date.now() - WEEK_MS;
  const perGuest = new Map<string, number>();
  for (const r of rsvps) {
    if (!r.attending || new Date(r.created_at).getTime() < since) continue;
    const key = `${r.guest_name.trim().toLowerCase()}|${(r.guest_phone ?? "").trim()}`;
    perGuest.set(key, Math.max(perGuest.get(key) ?? 0, 1 + (r.companions ?? 0)));
  }
  let total = 0;
  for (const n of perGuest.values()) total += n;
  return total;
}

/** Flips to true right after mount so width / stroke transitions animate from 0. */
function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return mounted;
}

/** Event identity (names, date, city) followed by three at-a-glance stats, in a single card. */
export function StatusPanel({ onEditDate }: { onEditDate?: () => void }) {
  const { couple, ceremonies, weddings } = useWedding();
  const { allGuests, publicRsvps, loading } = useAllGuests();

  const confirmed = useMemo(() => confirmedHeadcount(allGuests), [allGuests]);
  const weekly = useMemo(() => confirmedThisWeek(publicRsvps), [publicRsvps]);
  const { done, total } = configProgress({ couple, ceremonies });
  const quota = couple.rsvpQuota && couple.rsvpQuota > 0 ? couple.rsvpQuota : null;

  return (
    <section
      aria-label="Vue d'ensemble de votre événement"
      className="rounded-xl border border-border bg-gradient-to-b from-secondary/50 to-card px-3 pb-4 pt-5"
    >
      <header className="px-1 text-center">
        <p className="text-balance font-serif text-[26px] italic leading-tight">
          {couple.brideName || "Prénom A"}
          <span className="mx-1 text-primary">&amp;</span>
          {couple.groomName || "Prénom B"}
        </p>
        {couple.weddingDate ? (
          <p className="mt-1.5 text-[12px] text-muted-foreground">
            {formatFrenchDate(couple.weddingDate)}
            {couple.city ? <> · {couple.city}</> : null}
          </p>
        ) : (
          <button
            type="button"
            onClick={onEditDate}
            className="mt-1.5 text-[12px] italic text-muted-foreground underline underline-offset-2"
          >
            Date à définir
          </button>
        )}
        {weddings.length > 1 ? (
          <Link
            to="/dashboard/events"
            className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground transition hover:text-foreground"
          >
            <LayoutList size={11} strokeWidth={1.75} />
            <span>Mes événements</span>
          </Link>
        ) : null}
      </header>

      <div className="mt-4 grid grid-cols-3 divide-x divide-border/70 border-t border-border/70 pt-4">
        <Countdown weddingDate={couple.weddingDate} />
        <Confirmations
          confirmed={confirmed}
          quota={quota}
          weekly={weekly}
          loading={loading}
          rsvpEnabled={!!couple.rsvpEnabled}
        />
        <SetupRing done={done} total={total} />
      </div>
    </section>
  );
}

/** One stat: a fixed-height value area (keeps the three cells aligned) and a small icon + label under it. */
function Stat({
  value,
  icon,
  label,
  extra,
}: {
  value: ReactNode;
  icon: ReactNode;
  label: string;
  extra?: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center px-1.5 text-center">
      <div className="flex h-12 w-full flex-col items-center justify-center">{value}</div>
      <p className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
        {icon}
        {label}
      </p>
      {extra}
    </div>
  );
}

function Countdown({ weddingDate }: { weddingDate?: string | null }) {
  const past = isPastEvent(weddingDate);
  const days = weddingDate ? daysUntil(weddingDate) : 0;
  const animated = useCountUp(past || !weddingDate ? 0 : days);
  const icon = <CalendarClock className="size-3 shrink-0" />;

  if (weddingDate && past) {
    return (
      <Stat
        value={<PartyPopper className="size-7 text-primary" strokeWidth={1.75} />}
        icon={icon}
        label="grand jour passé"
      />
    );
  }
  if (weddingDate && days === 0) {
    return (
      <Stat
        value={<span className="text-[17px] font-semibold text-primary">Aujourd'hui</span>}
        icon={icon}
        label="c'est le grand jour"
      />
    );
  }
  return (
    <Stat
      value={
        <span className="text-2xl font-semibold leading-none tabular-nums text-primary">
          {weddingDate ? animated : "—"}
        </span>
      }
      icon={icon}
      label={days === 1 ? "jour restant" : "jours restants"}
    />
  );
}

function Confirmations({
  confirmed,
  quota,
  weekly,
  loading,
  rsvpEnabled,
}: {
  confirmed: number;
  quota: number | null;
  weekly: number;
  loading: boolean;
  rsvpEnabled: boolean;
}) {
  const animated = useCountUp(loading ? 0 : confirmed);
  const mounted = useMounted();
  const pct = quota ? Math.min(100, Math.round((confirmed / quota) * 100)) : 0;
  const icon = <Users className="size-3 shrink-0" />;
  const label = confirmed > 1 ? "confirmés" : "confirmé";

  if (loading) {
    return <Stat value={<Skeleton className="h-7 w-14" />} icon={icon} label="confirmés" />;
  }

  if (!rsvpEnabled && confirmed === 0) {
    return (
      <Stat
        value={
          <Link
            to="/dashboard/guests"
            className="text-[12px] leading-snug text-muted-foreground underline underline-offset-2"
          >
            Activer les RSVP
          </Link>
        }
        icon={icon}
        label="confirmés"
      />
    );
  }

  if (quota) {
    return (
      <Stat
        value={
          <>
            <p className="whitespace-nowrap leading-none tabular-nums">
              <span className="text-2xl font-semibold text-primary">{animated}</span>
              <span className="ml-1 text-[12px] text-muted-foreground">/ {quota}</span>
            </p>
            <div
              role="progressbar"
              aria-label={`${confirmed} confirmés sur ${quota} invités`}
              aria-valuemin={0}
              aria-valuemax={quota}
              aria-valuenow={Math.min(confirmed, quota)}
              className="mt-2 h-1.5 w-full max-w-[5.5rem] overflow-hidden rounded-full bg-muted"
            >
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out motion-reduce:transition-none"
                style={{ width: (mounted ? pct : 0) + "%" }}
              />
            </div>
          </>
        }
        icon={icon}
        label={label}
      />
    );
  }

  return (
    <Stat
      value={
        <span className="text-2xl font-semibold leading-none tabular-nums text-primary">
          {animated}
        </span>
      }
      icon={icon}
      label={label}
      extra={
        weekly > 0 ? (
          <p className="mt-1 inline-flex items-center gap-0.5 whitespace-nowrap text-[11px] font-medium text-emerald-700">
            <TrendingUp className="size-3" />+{weekly} cette semaine
          </p>
        ) : null
      }
    />
  );
}

const RING_R = 20;
const RING_C = 2 * Math.PI * RING_R;

function SetupRing({ done, total }: { done: number; total: number }) {
  const mounted = useMounted();
  const frac = total > 0 ? done / total : 0;
  const complete = done === total;

  return (
    <Stat
      value={
        <div
          role="img"
          aria-label={`${done} étapes sur ${total} terminées`}
          className="relative size-12"
        >
          <svg viewBox="0 0 48 48" className="size-full -rotate-90">
            <circle
              cx="24"
              cy="24"
              r={RING_R}
              fill="none"
              strokeWidth="5"
              className="stroke-muted"
            />
            <circle
              cx="24"
              cy="24"
              r={RING_R}
              fill="none"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={RING_C}
              strokeDashoffset={RING_C * (1 - (mounted ? frac : 0))}
              className={
                (complete ? "stroke-emerald-600" : "stroke-primary") +
                " transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none"
              }
            />
          </svg>
          <span className="absolute inset-0 grid place-items-center text-[12px] font-semibold tabular-nums">
            {done}/{total}
          </span>
        </div>
      }
      icon={<CircleCheck className="size-3 shrink-0" />}
      label={complete ? "tout est prêt" : "configuration"}
    />
  );
}
