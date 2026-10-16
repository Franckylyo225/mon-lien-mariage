import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type ComponentType } from "react";
import { Building2, Cake, Check, Droplet, Gem, Sparkles } from "lucide-react";
import { useWedding, type EventType } from "@/lib/wedding-store";
import { EVENT_CHOICES, isSelectableChoice, type EventChoice } from "@/lib/ceremony-meta";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding/evenement")({
  head: () => ({ meta: [{ title: "Étape 2 / 4 — Votre événement" }] }),
  component: StepEvenement,
});

/** Two interlocking bands — lucide has no wedding-rings glyph. */
function Rings({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      aria-hidden
    >
      <circle cx="9" cy="14.5" r="6" />
      <circle cx="15" cy="14.5" r="6" />
      <path d="M12 3.2 10.3 5.6h3.4L12 3.2Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  rings: Rings,
  gem: Gem,
  cake: Cake,
  droplet: Droplet,
  building: Building2,
  sparkles: Sparkles,
};

function ChoiceIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Sparkles;
  return <Icon className={className} />;
}

function StepEvenement() {
  const { couple, updateCouple, setOnboardingStep } = useWedding();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<EventType>(couple.eventType ?? "mariage");
  const [saving, setSaving] = useState(false);

  const hero = EVENT_CHOICES.find((c) => c.id === "mariage")!;
  const band = EVENT_CHOICES.find((c) => c.id === "autre")!;
  const tiles = EVENT_CHOICES.filter((c) => c.id !== "mariage" && c.id !== "autre");

  const selectedLabel = EVENT_CHOICES.find((c) => c.id === selected)?.label ?? hero.label;

  const choose = (choice: EventChoice) => {
    if (!isSelectableChoice(choice)) return;
    setSelected(choice.id);
  };

  const submit = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await updateCouple({ eventType: selected });
      await setOnboardingStep(2);
      navigate({ to: "/onboarding/dates" });
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Votre événement</h1>
        <p className="mt-2.5 text-sm text-muted-foreground">Quel moment allez-vous célébrer ?</p>
      </div>

      <HeroChoice choice={hero} active={selected === hero.id} onSelect={() => choose(hero)} />

      <div className="grid grid-cols-2 gap-3">
        {tiles.map((choice) => (
          <DecorTile
            key={choice.id}
            choice={choice}
            active={selected === choice.id}
            onSelect={() => choose(choice)}
          />
        ))}
      </div>

      <BandChoice choice={band} active={selected === band.id} onSelect={() => choose(band)} />

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Les étapes de votre mariage (dot, civil, réception…) se configurent plus tard dans le
        programme.
      </p>

      <div className="pb-[env(safe-area-inset-bottom)]">
        <button
          type="button"
          onClick={submit}
          disabled={saving}
          className="w-full btn-accent-gradient rounded-xl px-4 py-3.5 text-sm font-semibold disabled:opacity-60"
        >
          <span className="truncate">
            {saving ? "Enregistrement…" : `Continuer — ${selectedLabel}`}
          </span>
        </button>
      </div>
    </div>
  );
}

/** Check pastille shown on the selected card. */
function SelectedBadge({ accent }: { accent: string }) {
  return (
    <span
      className="absolute right-3 top-3 z-20 grid size-6 place-items-center rounded-full text-white shadow-sm"
      style={{ background: accent }}
    >
      <Check size={13} strokeWidth={3} />
    </span>
  );
}

/** The dominant card: a photo, darkened at the foot so the text stays legible. */
function HeroChoice({
  choice,
  active,
  onSelect,
}: {
  choice: EventChoice;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      aria-label={choice.label}
      className="relative block h-[200px] w-full overflow-hidden rounded-2xl text-left transition active:scale-[0.99]"
      style={{
        boxShadow: active ? `0 0 0 2.5px ${choice.accent}` : undefined,
        background: `linear-gradient(135deg, ${choice.gradient[0]}, ${choice.gradient[1]})`,
      }}
    >
      {choice.image ? (
        <img
          src={choice.image}
          alt=""
          aria-hidden
          loading="eager"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      ) : null}
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.05) 38%, rgba(0,0,0,0.72) 100%)",
        }}
      />
      {active ? <SelectedBadge accent={choice.accent} /> : null}

      <span className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-4">
        <span className="flex items-center gap-2">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/18 text-white backdrop-blur-sm">
            <ChoiceIcon name={choice.icon} className="size-[18px]" />
          </span>
          <span className="rounded-full bg-white/18 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-white backdrop-blur-sm">
            Le plus choisi
          </span>
        </span>
        <span className="page-title text-[28px] leading-none text-white">{choice.label}</span>
        <span className="text-[12px] leading-snug text-white/85">{choice.sublabel}</span>
      </span>
    </button>
  );
}

/** Secondary types: no photo, a colour wash plus a watermark motif. */
function DecorTile({
  choice,
  active,
  onSelect,
}: {
  choice: EventChoice;
  active: boolean;
  onSelect: () => void;
}) {
  /**
   * A type can be retired from the picker while accounts created before still
   * carry it. Such an account keeps its choice readable and selected — only
   * the cards that are *not* the current one are locked, so nobody is shown a
   * tile that is greyed out and ticked at the same time.
   */
  const locked = Boolean(choice.comingSoon) && !active;
  return (
    <button
      type="button"
      onClick={onSelect}
      // aria-disabled rather than `disabled`: a teasing card still has to be
      // reachable and announced, and `choose()` already refuses the selection.
      aria-pressed={locked ? undefined : active}
      aria-disabled={locked || undefined}
      aria-label={locked ? `${choice.label} — bientôt disponible` : choice.label}
      className={cn(
        "relative flex h-[138px] w-full flex-col justify-end overflow-hidden rounded-2xl p-3.5 text-left transition",
        locked ? "cursor-not-allowed opacity-55" : "active:scale-[0.98]",
      )}
      style={{
        background: `linear-gradient(140deg, ${choice.gradient[0]}, ${choice.gradient[1]})`,
        boxShadow: active ? `0 0 0 2.5px ${choice.accent}` : undefined,
      }}
    >
      {/* Watermark: the type's own icon, oversized and barely there. */}
      <ChoiceIcon
        name={choice.icon}
        className="pointer-events-none absolute -right-3 -top-3 size-20 text-white/10"
      />
      {active ? <SelectedBadge accent={choice.accent} /> : null}
      {locked ? (
        <span className="absolute right-2.5 top-2.5 rounded-full bg-black/35 px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.16em] text-white backdrop-blur-sm">
          Bientôt
        </span>
      ) : null}

      <span className="relative grid size-8 place-items-center rounded-full bg-white/18 text-white backdrop-blur-sm">
        <ChoiceIcon name={choice.icon} className="size-[17px]" />
      </span>
      <span className="relative mt-2 text-[13px] font-semibold leading-tight text-white">
        {choice.label}
      </span>
      <span className="relative text-[10px] leading-tight text-white/75">{choice.sublabel}</span>
    </button>
  );
}

/** The quiet catch-all, full width at the foot of the list. */
function BandChoice({
  choice,
  active,
  onSelect,
}: {
  choice: EventChoice;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      aria-label={choice.label}
      className={cn(
        "relative flex w-full items-center gap-3 rounded-2xl border bg-card px-4 py-3.5 text-left transition",
        active ? "border-transparent" : "border-border hover:bg-secondary/20",
      )}
      style={{ boxShadow: active ? `0 0 0 2.5px ${choice.accent}` : undefined }}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary/60 text-muted-foreground">
        <ChoiceIcon name={choice.icon} className="size-[17px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-medium">{choice.label}</span>
        <span className="block text-[11px] text-muted-foreground">{choice.sublabel}</span>
      </span>
      {active ? (
        <span
          className="grid size-5 shrink-0 place-items-center rounded-full text-white"
          style={{ background: choice.accent }}
        >
          <Check size={11} strokeWidth={3} />
        </span>
      ) : null}
    </button>
  );
}
