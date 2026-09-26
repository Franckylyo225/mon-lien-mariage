import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CalendarPlus, Copy, ListChecks, MapPin, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  useWedding,
  formatFrenchDate,
  guestStats,
  daysUntil,
  ceremonyTimeStart,
  ceremonyVenue,
  isPastEvent,
  type Ceremony,
} from "@/lib/wedding-store";
import { useAllGuests } from "@/hooks/use-all-guests";
import { CeremonySheet } from "@/components/dashboard/CeremonySheet";
import { Skeleton } from "@/components/ui/skeleton";
import { IconBadge, PageHeader } from "@/components/dashboard/premium";

export const Route = createFileRoute("/dashboard/ceremonies")({
  validateSearch: (search: Record<string, unknown>): { edit?: string } =>
    typeof search.edit === "string" && search.edit ? { edit: search.edit } : {},
  head: () => ({
    meta: [
      { title: "Programme — MonInvit.com" },
      {
        name: "description",
        content: "Organisez les étapes et horaires de votre mariage sur MonInvit.",
      },
      { property: "og:title", content: "Programme — MonInvit.com" },
      {
        property: "og:description",
        content: "Organisez les étapes et horaires de votre mariage sur MonInvit.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CeremoniesPage,
});

const newId = () => Math.random().toString(36).slice(2, 9);

function CeremoniesPage() {
  const { ceremonies, addCeremony, updateCeremony, removeCeremony, couple } = useWedding();
  const { allGuests, loading: guestsLoading } = useAllGuests();
  const isPast = isPastEvent(couple.weddingDate);
  const navigate = useNavigate();
  const { edit } = Route.useSearch();
  const [editing, setEditing] = useState<Ceremony | null>(null);
  const [creating, setCreating] = useState(false);

  // Deep link (/dashboard/ceremonies?edit=<id>): open the sheet once, then clean the URL.
  useEffect(() => {
    if (!edit) return;
    const target = ceremonies.find((c) => c.id === edit);
    if (target && !isPast) setEditing(target);
    void navigate({ to: "/dashboard/ceremonies", search: {}, replace: true });
  }, [edit, ceremonies, isPast, navigate]);

  // The store keeps steps in chronological order; group them by day for the timeline.
  const days = useMemo(() => {
    const map = new Map<string, Ceremony[]>();
    for (const c of ceremonies) {
      const key = c.date || "";
      const list = map.get(key);
      if (list) list.push(c);
      else map.set(key, [c]);
    }
    return Array.from(map.entries());
  }, [ceremonies]);

  const duplicate = async (c: Ceremony) => {
    const copy = await addCeremony({
      type: c.type,
      label: c.label,
      name: `${c.name} (copie)`,
      date: c.date,
      timeStart: c.timeStart,
      timeEnd: c.timeEnd,
      venue: c.venue,
      mapsUrl: c.mapsUrl,
      dressCode: c.dressCode,
      color: c.color,
      capacity: c.capacity,
      notes: c.notes,
      program: c.program?.map((p) => ({ ...p, id: newId() })),
      status: c.status,
    });
    toast.success("Étape dupliquée — ajustez la date et l'heure.");
    setEditing(copy);
  };

  const firstDate = ceremonies.find((c) => c.date)?.date;
  const summary =
    ceremonies.length === 0
      ? "Aucune étape"
      : `${ceremonies.length} étape${ceremonies.length > 1 ? "s" : ""}${firstDate ? ` · dès le ${formatFrenchDate(firstDate).split(" ").slice(1, 3).join(" ")}` : ""}`;

  return (
    <div className="space-y-6 pt-2">
      <PageHeader
        title="Vos étapes"
        subtitle={summary}
        actions={
          isPast || ceremonies.length === 0 ? null : (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="btn-accent-gradient inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold"
            >
              <Plus className="size-4" />
              Étape
            </button>
          )
        }
      />

      {isPast ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50/70 px-3.5 py-2.5 text-[12px] text-amber-900">
          Cet événement est passé — le programme est en lecture seule.
        </p>
      ) : null}

      {ceremonies.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-6 py-12 text-center">
          <IconBadge className="size-14">
            <CalendarPlus className="size-6" strokeWidth={1.75} />
          </IconBadge>
          <div>
            <p className="font-produit text-lg font-bold">Construisez votre programme</p>
            <p className="mx-auto mt-1 max-w-xs text-[13px] text-muted-foreground">
              Mariage civil, dot, réception… choisissez un type et l'étape est prête en deux taps.
            </p>
          </div>
          {isPast ? null : (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="btn-accent-gradient inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold"
            >
              <Plus className="size-4" />
              Ajouter ma première étape
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {days.map(([date, items]) => (
            <section key={date || "undated"}>
              <DayHeading date={date} />
              <ol className="ml-1.5 border-l border-border">
                {items.map((c) => (
                  <CeremonyCard
                    key={c.id}
                    ceremony={c}
                    readOnly={isPast}
                    stats={guestsLoading ? null : guestStats(allGuests, c.id)}
                    onEdit={() => setEditing(c)}
                    onDuplicate={() => void duplicate(c)}
                  />
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}

      {creating ? (
        <CeremonySheet
          onClose={() => setCreating(false)}
          onSave={(c) => {
            void addCeremony(c);
            setCreating(false);
            toast.success("Étape ajoutée.");
          }}
        />
      ) : null}
      {editing ? (
        <CeremonySheet
          key={editing.id}
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={(c) => {
            void updateCeremony(editing.id, c);
            setEditing(null);
            toast.success("Étape enregistrée.");
          }}
          onDelete={() => {
            void removeCeremony(editing.id);
            setEditing(null);
            toast.success("Étape supprimée.");
          }}
        />
      ) : null}
    </div>
  );
}

function DayHeading({ date }: { date: string }) {
  if (!date) {
    return <p className="mb-2 text-[13px] font-medium text-muted-foreground">Date à définir</p>;
  }
  const past = isPastEvent(date);
  const n = daysUntil(date);
  const relative = past ? "Passé" : n === 0 ? "Aujourd'hui" : `dans ${n} jour${n > 1 ? "s" : ""}`;
  const label = formatFrenchDate(date);
  return (
    <div className="mb-2 flex items-center justify-between gap-3">
      <p className="text-[13px] font-medium capitalize">{label}</p>
      <span
        className={
          "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium " +
          (past ? "bg-muted text-muted-foreground" : "bg-secondary text-secondary-foreground")
        }
      >
        {relative}
      </span>
    </div>
  );
}

function CeremonyCard({
  ceremony: c,
  readOnly,
  stats,
  onEdit,
  onDuplicate,
}: {
  ceremony: Ceremony;
  readOnly: boolean;
  stats: ReturnType<typeof guestStats> | null;
  onEdit: () => void;
  onDuplicate: () => void;
}) {
  const start = ceremonyTimeStart(c);
  const venue = ceremonyVenue(c);
  const steps = c.program?.length ?? 0;

  const body = (
    <>
      <div className="flex items-baseline gap-2">
        <p className="text-[13px] font-semibold tabular-nums text-primary">
          {start ? (c.timeEnd ? `${start} – ${c.timeEnd}` : start) : "Heure à définir"}
        </p>
        <span className="truncate rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-primary">
          {c.label}
        </span>
      </div>
      <p className="mt-0.5 truncate font-serif text-lg leading-snug">{c.name}</p>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
        {venue ? (
          <span className="flex min-w-0 items-center gap-1">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">{venue}</span>
          </span>
        ) : null}
        {steps > 0 ? (
          <span className="flex items-center gap-1">
            <ListChecks className="size-3.5 shrink-0" />
            {steps} temps fort{steps > 1 ? "s" : ""}
          </span>
        ) : null}
      </div>
      <div className="mt-2 text-[12px] text-muted-foreground">
        {stats === null ? (
          <Skeleton className="h-3.5 w-40" />
        ) : stats.total === 0 ? (
          "Aucun invité pour cette étape"
        ) : (
          <>
            <span className="font-medium text-foreground">{stats.confirmés}</span> confirmé
            {stats.confirmés > 1 ? "s" : ""} · {stats.en_attente} en attente · {stats.déclinés}{" "}
            décliné{stats.déclinés > 1 ? "s" : ""}
          </>
        )}
      </div>
    </>
  );

  return (
    <li className="relative pb-3 pl-5">
      <span
        aria-hidden
        className="absolute -left-[5px] top-4 size-2.5 rounded-full ring-2 ring-background"
        style={{ backgroundColor: c.color }}
      />
      <div className="flex items-stretch rounded-2xl border border-border bg-card">
        {readOnly ? (
          <div className="min-w-0 flex-1 p-4">{body}</div>
        ) : (
          <>
            <button
              type="button"
              onClick={onEdit}
              aria-label={`Modifier ${c.name}`}
              className="min-w-0 flex-1 rounded-l-2xl p-4 text-left transition hover:bg-secondary/30"
            >
              {body}
            </button>
            <button
              type="button"
              onClick={onDuplicate}
              aria-label={`Dupliquer ${c.name}`}
              title="Dupliquer"
              className="grid w-12 shrink-0 place-items-center rounded-r-2xl border-l border-border text-muted-foreground transition hover:bg-secondary/30 hover:text-foreground"
            >
              <Copy className="size-4" />
            </button>
          </>
        )}
      </div>
    </li>
  );
}
