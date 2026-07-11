import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  IconChevronRight,
  IconPlus,
} from "@tabler/icons-react";


import {
  useWedding,
  formatShortDate,
  type WeddingSummary,
} from "@/lib/wedding-store";

export const Route = createFileRoute("/dashboard/events")({
  head: () => ({ meta: [{ title: "Mes événements — MonInvit.com" }] }),
  component: EventsPage,
});

const EVENT_TYPE_LABELS: Record<string, string> = {
  mariage: "Mariage",
  dot: "Dot",
  traditionnel: "Traditionnel",
  fiancailles: "Fiançailles",
  anniversaire: "Anniversaire",
  autre: "Événement",
};

function EventsPage() {
  const navigate = useNavigate();
  const {
    weddings,
    activeWeddingId,
    account,
    loading,
    switchActiveWedding,
    createNewWedding,
  } = useWedding();
  const [creating, setCreating] = useState(false);


  const { upcoming, past } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const up: WeddingSummary[] = [];
    const pa: WeddingSummary[] = [];
    for (const w of weddings) {
      const d = w.weddingDate ? new Date(w.weddingDate + "T00:00:00") : null;
      if (!d || d >= today || w.isPublished) up.push(w);
      else pa.push(w);
    }
    return { upcoming: up, past: pa };
  }, [weddings]);

  if (loading || !account.isAuthenticated) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-40">
          Chargement…
        </p>
      </div>
    );
  }

  const handleOpen = async (id: string) => {
    if (id !== activeWeddingId) await switchActiveWedding(id);
    navigate({ to: "/dashboard" });
  };

  const handleCreate = async () => {
    if (creating) return;
    setCreating(true);
    const id = await createNewWedding();
    setCreating(false);
    if (id) navigate({ to: "/onboarding/prenoms" });
  };


  return (
    <div className="space-y-6 py-2">

        {upcoming.length > 0 ? (
          <Section title="En cours">
            {upcoming.map((w) => (
              <EventCard
                key={w.id}
                w={w}
                isActive={w.id === activeWeddingId}
                onOpen={() => handleOpen(w.id)}
              />
            ))}
          </Section>
        ) : null}

        {past.length > 0 ? (
          <Section title="Passés">
            {past.map((w) => (
              <EventCard
                key={w.id}
                w={w}
                past
                isActive={w.id === activeWeddingId}
                onOpen={() => handleOpen(w.id)}
              />
            ))}
          </Section>
        ) : null}

        <button
          onClick={handleCreate}
          disabled={creating}
          className="flex w-full items-center gap-3 rounded-[10px] border border-dashed border-border px-3 py-3 text-left transition active:bg-secondary/60"
          style={{ borderWidth: "0.5px" }}
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-foreground">
            <IconPlus size={16} strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium">
              {creating ? "Création…" : "Nouvel événement"}
            </p>
          </div>
        </button>
    </div>
  );

}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
        {title}
      </p>
      <ul className="space-y-2">
        {Array.isArray(children)
          ? (children as React.ReactNode[]).map((c, i) => <li key={i}>{c}</li>)
          : <li>{children}</li>}
      </ul>
    </section>
  );
}

function EventCard({
  w,
  past = false,
  isActive,
  onOpen,
}: {
  w: WeddingSummary;
  past?: boolean;
  isActive: boolean;
  onOpen: () => void;
}) {
  const label = w.brideName || w.groomName
    ? `${w.brideName || "…"} & ${w.groomName || "…"}`
    : "Nouvel événement";
  const type = EVENT_TYPE_LABELS[w.eventType] ?? "Événement";
  const dot = w.isPublished ? "#059669" : "hsl(var(--border))";
  const badge = past
    ? { label: "Terminé", bg: "hsl(var(--muted))", fg: "hsl(var(--muted-foreground))" }
    : w.isPublished
      ? { label: "En ligne", bg: "#ecfdf5", fg: "#047857" }
      : { label: "Brouillon", bg: "hsl(var(--muted))", fg: "hsl(var(--muted-foreground))" };

  return (
    <button
      onClick={onOpen}
      className="flex w-full items-center gap-3 rounded-[10px] bg-card px-3 py-2.5 text-left transition active:bg-secondary/60"
      style={{
        border: "0.5px solid " + (isActive ? "hsl(var(--foreground))" : "hsl(var(--border))"),
        opacity: past ? 0.65 : 1,
      }}
    >
      <span
        className="mt-1 inline-block size-2 shrink-0 rounded-full"
        style={{ background: dot }}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-serif text-[13px] italic">{label}</p>
        <p className="truncate text-[10px] text-muted-foreground">
          {type}
          {w.weddingDate ? ` · ${formatShortDate(w.weddingDate)}` : ""}
        </p>
      </div>
      <span
        className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide"
        style={{ background: badge.bg, color: badge.fg }}
      >
        {badge.label}
      </span>
      <IconChevronRight size={14} className="shrink-0 text-muted-foreground" />
    </button>
  );
}

