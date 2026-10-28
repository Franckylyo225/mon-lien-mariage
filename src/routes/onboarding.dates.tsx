import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarDays, Check, MapPin } from "lucide-react";
import { useWedding } from "@/lib/wedding-store";
import {
  onboardingNextDestination,
  onboardingStepAfter,
  onboardingStepTitle,
} from "@/lib/onboarding-steps";
import { Field } from "./signup";

const STEP = "/onboarding/dates";

export const Route = createFileRoute("/onboarding/dates")({
  head: () => ({ meta: [{ title: onboardingStepTitle(STEP, "Les dates clés") }] }),
  component: StepDates,
});

/** Dates travel as `YYYY-MM-DD`, the shape `<input type="date">` and the DB share. */
function addDays(iso: string, days: number): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const LONG_DATE = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatLong(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return "";
  const text = LONG_DATE.format(d);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Whole days from today to `iso`; negative once the date has passed. */
function daysUntil(iso: string): number | null {
  const target = new Date(iso + "T00:00:00");
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

function StepDates() {
  const { couple, updateCouple, setOnboardingStep } = useWedding();
  const navigate = useNavigate();
  const [weddingDate, setWeddingDate] = useState(couple.weddingDate ?? "");
  const [rsvpDeadline, setRsvpDeadline] = useState(
    couple.rsvpDeadline ?? (couple.weddingDate ? addDays(couple.weddingDate, -30) : ""),
  );
  const [rsvpTouched, setRsvpTouched] = useState(!!couple.rsvpDeadline);
  const [city, setCity] = useState(couple.city && couple.city !== "Abidjan" ? couple.city : "");
  const [undated, setUndated] = useState(false);
  const [saving, setSaving] = useState(false);

  const onWeddingChange = (v: string) => {
    setWeddingDate(v);
    if (!rsvpTouched && v) setRsvpDeadline(addDays(v, -30));
  };

  const goNext = async () => {
    if (saving) return;
    setSaving(true);
    try {
      // "À définir" clears both dates but still keeps the city, which the old
      // skip path used to drop along with everything else.
      await updateCouple(
        undated
          ? { weddingDate: "", rsvpDeadline: undefined, city: city.trim() || "Abidjan" }
          : {
              weddingDate: weddingDate || "",
              rsvpDeadline: rsvpDeadline || undefined,
              city: city.trim() || "Abidjan",
            },
      );
      await setOnboardingStep(onboardingStepAfter(STEP));
      navigate({ to: onboardingNextDestination(STEP) });
    } catch {
      setSaving(false);
    }
  };

  const showDateDetail = !undated && Boolean(weddingDate);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Les dates clés</h1>
        <p className="mt-2.5 text-sm text-muted-foreground">
          Ces deux dates guident toute la planification.
        </p>
      </div>

      <div className="space-y-4">
        <Field label="Date du mariage">
          <IconInput icon={<CalendarDays className="size-[17px]" />}>
            <input
              type="date"
              value={weddingDate}
              disabled={undated}
              onChange={(e) => onWeddingChange(e.target.value)}
              className="wizard-input pl-11 disabled:opacity-45"
            />
          </IconInput>
        </Field>

        {showDateDetail ? <Countdown iso={weddingDate} /> : null}

        {showDateDetail ? (
          <>
            <Timeline />
            <div>
              <Field label="Date limite des confirmations (RSVP)">
                <IconInput icon={<CalendarDays className="size-[17px]" />}>
                  <input
                    type="date"
                    value={rsvpDeadline}
                    onChange={(e) => {
                      setRsvpDeadline(e.target.value);
                      setRsvpTouched(true);
                    }}
                    className="wizard-input pl-11"
                  />
                </IconInput>
              </Field>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                {!rsvpTouched ? (
                  <span className="rounded-full bg-champagne-light px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-champagne-deep">
                    Auto · 30 j avant
                  </span>
                ) : null}
                <span className="text-[11px] text-muted-foreground">
                  Vous pouvez l'ajuster à tout moment.
                </span>
              </div>
            </div>
          </>
        ) : null}

        <Field label="Ville du mariage (optionnel)">
          <IconInput icon={<MapPin className="size-[17px]" />}>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Abidjan"
              maxLength={80}
              className="wizard-input pl-11"
            />
          </IconInput>
        </Field>
      </div>

      <UndatedToggle
        checked={undated}
        onChange={(v) => {
          setUndated(v);
          if (v) setRsvpTouched(false);
        }}
      />

      <div className="pb-[env(safe-area-inset-bottom)]">
        <button
          type="button"
          onClick={goNext}
          disabled={saving}
          className="w-full btn-accent-gradient rounded-xl px-4 py-3.5 text-sm font-semibold disabled:opacity-60"
        >
          {saving ? "Enregistrement…" : "Continuer"}
        </button>
      </div>
    </div>
  );
}

/** Wraps a field so an icon can sit inside its left padding. */
function IconInput({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="relative">
      <span
        aria-hidden
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
      >
        {icon}
      </span>
      {children}
    </div>
  );
}

/** The emotional payoff of picking a date: how long is left, spelled out. */
function Countdown({ iso }: { iso: string }) {
  const days = daysUntil(iso);
  const long = formatLong(iso);
  if (days === null || !long) return null;

  return (
    <div
      aria-live="polite"
      className="rounded-2xl border border-champagne-light bg-gradient-to-br from-[#FDFBF7] to-[#F5EDDF] px-4 py-4 text-center"
    >
      {days > 0 ? (
        <>
          <p className="font-serif text-[40px] leading-none text-foreground">{days}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-champagne-deep">
            {days === 1 ? "jour avant le grand jour" : "jours avant le grand jour"}
          </p>
        </>
      ) : days === 0 ? (
        <p className="font-serif text-[26px] leading-tight text-foreground">C'est aujourd'hui !</p>
      ) : (
        <p className="font-serif text-[20px] leading-tight text-muted-foreground">
          Cette date est déjà passée
        </p>
      )}
      <p className="mt-2 text-[13px] text-muted-foreground">{long}</p>
    </div>
  );
}

/** Ties the two dates together: the wedding, then the RSVP cut-off. */
function Timeline() {
  return (
    <div aria-hidden className="flex items-center gap-2 px-1">
      <span className="size-2 shrink-0 rounded-full bg-primary" />
      <span className="h-px flex-1 bg-gradient-to-r from-primary to-champagne" />
      <span className="size-2 shrink-0 rounded-full bg-champagne" />
      <span className="ml-1 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
        Clôture RSVP
      </span>
    </div>
  );
}

/** Opting out of dates entirely — a real checkbox, not a buried link. */
function UndatedToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 text-left transition hover:bg-secondary/20"
    >
      <span
        aria-hidden
        className={
          "grid size-5 shrink-0 place-items-center rounded-md border transition " +
          (checked
            ? "border-transparent bg-primary text-primary-foreground"
            : "border-input bg-background")
        }
      >
        {checked ? <Check size={13} strokeWidth={3} /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-medium">Je ne connais pas encore la date</span>
        <span className="block text-[11px] text-muted-foreground">
          Vous la renseignerez plus tard, votre page reste modifiable.
        </span>
      </span>
    </button>
  );
}
