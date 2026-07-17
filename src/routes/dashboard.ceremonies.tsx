import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  useWedding,
  formatShortDate,
  guestStats,
  type Ceremony,
  type CeremonyType,
  type ProgramItem,
} from "@/lib/wedding-store";

export const Route = createFileRoute("/dashboard/ceremonies")({
  component: CeremoniesPage,
});

const typeOptions: { value: CeremonyType; label: string }[] = [
  { value: "dot", label: "Dot traditionnelle" },
  { value: "civil", label: "Mariage civil" },
  { value: "religieux", label: "Mariage religieux" },
  { value: "traditionnel", label: "Étape traditionnelle" },
  { value: "diner", label: "Dîner / Réception" },
  { value: "anniversaire", label: "Anniversaire de mariage" },
  { value: "autre", label: "Autre" },
];




function CeremoniesPage() {
  const { ceremonies, addCeremony, updateCeremony, removeCeremony, guests } = useWedding();
  const [editing, setEditing] = useState<Ceremony | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-50">
            {ceremonies.length} étapes
          </p>
          <h1 className="mt-1 font-serif text-3xl italic">Vos étapes</h1>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="rounded-full bg-primary px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-primary-foreground shadow-md shadow-primary/20 transition hover:opacity-90"
        >
          + Étape
        </button>
      </div>

      <ul className="space-y-3">
        {ceremonies.map((c) => {
          const s = guestStats(guests, c.id);
          return (
            <li key={c.id} className="rounded-3xl border border-border bg-card p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex flex-1 items-start gap-3">
                  <span
                    className="mt-1.5 size-3 shrink-0 rounded-full"
                    style={{ backgroundColor: c.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-serif text-lg">{c.name}</h3>
                      <span
                        className={
                          "rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest " +
                          (c.status === "publiée"
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground")
                        }
                      >
                        {c.status}
                      </span>
                    </div>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest opacity-60">
                      {c.label} · {formatShortDate(c.date)} · {c.timeStart}
                      {c.timeEnd ? `–${c.timeEnd}` : ""}
                    </p>
                    <p className="mt-1 text-xs opacity-70">{c.venue}</p>
                    {c.dressCode ? (
                      <p className="mt-2 inline-block rounded-full bg-accent/20 px-2.5 py-0.5 text-[10px] opacity-80">
                        {c.dressCode}
                      </p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-widest">
                      <span>
                        <span className="text-primary">{s.confirmés}</span> conf.
                      </span>
                      <span>
                        <span className="text-amber-600">{s.en_attente}</span> att.
                      </span>
                      <span>
                        <span className="opacity-60">{s.déclinés}</span> décl.
                      </span>
                      {c.capacity ? (
                        <span className="opacity-60">/ {c.capacity} max</span>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2 sm:flex-col">
                  <button
                    onClick={() => setEditing(c)}
                    className="flex-1 rounded-full border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest hover:bg-accent/20 sm:flex-none"
                  >
                    Éditer
                  </button>
                  <button
                    onClick={() =>
                      updateCeremony(c.id, {
                        status: c.status === "publiée" ? "brouillon" : "publiée",
                      })
                    }
                    className="flex-1 rounded-full border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest hover:bg-accent/20 sm:flex-none"
                  >
                    {c.status === "publiée" ? "Dépublier" : "Publier"}
                  </button>
                </div>
              </div>
            </li>

          );
        })}
      </ul>

      {creating ? (
        <CeremonySheet
          onClose={() => setCreating(false)}
          onSave={(c) => {
            addCeremony(c);
            setCreating(false);
          }}
        />
      ) : null}
      {editing ? (
        <CeremonySheet
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={(c) => {
            updateCeremony(editing.id, c);
            setEditing(null);
          }}
          onDelete={() => {
            removeCeremony(editing.id);
            setEditing(null);
          }}
        />
      ) : null}
    </div>
  );
}

function CeremonySheet({
  initial,
  onClose,
  onSave,
  onDelete,
}: {
  initial?: Ceremony;
  onClose: () => void;
  onSave: (c: Omit<Ceremony, "id" | "publicSlug">) => void;
  onDelete?: () => void;
}) {
  const [type, setType] = useState<CeremonyType>(initial?.type ?? "diner");
  const [label, setLabel] = useState(initial?.label ?? "Dîner");

  const [name, setName] = useState(initial?.name ?? "");
  const [date, setDate] = useState(initial?.date ?? "2027-02-14");
  const [timeStart, setTimeStart] = useState(initial?.timeStart ?? "18:00");
  const [timeEnd, setTimeEnd] = useState(initial?.timeEnd ?? "");
  const [venue, setVenue] = useState(initial?.venue ?? "");
  const [dressCode, setDressCode] = useState(initial?.dressCode ?? "");
  const [color, setColor] = useState(initial?.color ?? "#d97757");
  const [capacity, setCapacity] = useState<number | "">(initial?.capacity ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [status, setStatus] = useState<Ceremony["status"]>(initial?.status ?? "brouillon");
  const [program, setProgram] = useState<ProgramItem[]>(initial?.program ?? []);

  const addProgramItem = () =>
    setProgram((p) => [
      ...p,
      { id: Math.random().toString(36).slice(2, 9), time: "", title: "", description: "" },
    ]);
  const updateProgramItem = (id: string, patch: Partial<ProgramItem>) =>
    setProgram((p) => p.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const removeProgramItem = (id: string) =>
    setProgram((p) => p.filter((it) => it.id !== id));
  const moveProgramItem = (id: string, dir: -1 | 1) =>
    setProgram((p) => {
      const i = p.findIndex((it) => it.id === id);
      if (i < 0) return p;
      const j = i + dir;
      if (j < 0 || j >= p.length) return p;
      const next = [...p];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-background p-6 sm:rounded-3xl"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border sm:hidden" />
        <h3 className="font-serif text-xl italic">
          {initial ? "Éditer la étape" : "Nouvelle étape"}
        </h3>

        <div className="mt-4 space-y-3">
          <select
            value={type}
            onChange={(e) => {
              const v = e.target.value as CeremonyType;
              setType(v);
              const preset = typeOptions.find((x) => x.value === v);
              if (preset && !initial) setLabel(preset.label);
            }}
            className="w-full rounded-full border border-input bg-background px-4 py-3 text-sm"
          >
            {typeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Libellé court (ex: Dot)"
            className="w-full rounded-full border border-input bg-background px-4 py-3 text-sm"
          />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom affiché (ex: Dot chez la famille Diabaté)"
            className="w-full rounded-full border border-input bg-background px-4 py-3 text-sm"
          />
          <input
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            placeholder="Lieu"
            className="w-full rounded-full border border-input bg-background px-4 py-3 text-sm"
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-full border border-input bg-background px-3 py-3 text-sm"
            />
            <input
              type="time"
              value={timeStart}
              onChange={(e) => setTimeStart(e.target.value)}
              className="rounded-full border border-input bg-background px-3 py-3 text-sm"
            />
            <input
              type="time"
              value={timeEnd}
              onChange={(e) => setTimeEnd(e.target.value)}
              className="rounded-full border border-input bg-background px-3 py-3 text-sm"
            />
          </div>
          <input
            value={dressCode}
            onChange={(e) => setDressCode(e.target.value)}
            placeholder="Dress code / thème"
            className="w-full rounded-full border border-input bg-background px-4 py-3 text-sm"
          />
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest opacity-60">
              Couleur d'accent
            </p>
            <div className="flex flex-wrap gap-2">
              {paletteChoices.map((p) => (
                <button
                  key={p}
                  onClick={() => setColor(p)}
                  className={
                    "size-8 rounded-full transition " +
                    (color === p ? "ring-2 ring-offset-2 ring-foreground" : "")
                  }
                  style={{ backgroundColor: p }}
                  aria-label={p}
                />
              ))}
            </div>
          </div>
          <input
            type="number"
            min={0}
            value={capacity}
            onChange={(e) => setCapacity(e.target.value ? Number(e.target.value) : "")}
            placeholder="Capacité max (optionnel)"
            className="w-full rounded-full border border-input bg-background px-4 py-3 text-sm"
          />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Notes internes (invisible pour les invités)"
            className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm"
          />
          <div className="flex items-center justify-between rounded-full border border-input px-4 py-2">
            <span className="font-mono text-[10px] uppercase tracking-widest opacity-60">
              Statut
            </span>
            <button
              onClick={() =>
                setStatus((s) => (s === "publiée" ? "brouillon" : "publiée"))
              }
              className={
                "rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-widest " +
                (status === "publiée"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground")
              }
            >
              {status}
            </button>
          </div>

          <div className="rounded-2xl border border-border bg-muted/30 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest opacity-60">
                  Programme de la étape
                </p>
                <p className="mt-0.5 text-[11px] opacity-60">
                  Les étapes affichées aux invités.
                </p>
              </div>
              <button
                type="button"
                onClick={addProgramItem}
                className="shrink-0 rounded-full border border-border bg-background px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest hover:bg-accent/20"
              >
                + Étape
              </button>
            </div>
            {program.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border bg-background/50 p-4 text-center text-[11px] opacity-60">
                Aucune étape. Ajoutez le déroulé (accueil, discours, dîner…).
              </p>
            ) : (
              <ul className="space-y-2">
                {program.map((it, idx) => (
                  <li
                    key={it.id}
                    className="rounded-xl border border-border bg-background p-3"
                  >
                    <div className="flex gap-2">
                      <input
                        type="time"
                        value={it.time}
                        onChange={(e) => updateProgramItem(it.id, { time: e.target.value })}
                        className="w-24 shrink-0 rounded-lg border border-input bg-background px-2 py-2 text-xs"
                      />
                      <input
                        value={it.title}
                        onChange={(e) => updateProgramItem(it.id, { title: e.target.value })}
                        placeholder="Titre de l'étape"
                        className="min-w-0 flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <textarea
                      value={it.description ?? ""}
                      onChange={(e) =>
                        updateProgramItem(it.id, { description: e.target.value })
                      }
                      rows={2}
                      placeholder="Description (optionnelle)"
                      className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs"
                    />
                    <div className="mt-2 flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => moveProgramItem(it.id, -1)}
                        disabled={idx === 0}
                        className="rounded-full border border-border px-2 py-1 font-mono text-[9px] uppercase tracking-widest disabled:opacity-30 hover:bg-accent/20"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveProgramItem(it.id, 1)}
                        disabled={idx === program.length - 1}
                        className="rounded-full border border-border px-2 py-1 font-mono text-[9px] uppercase tracking-widest disabled:opacity-30 hover:bg-accent/20"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeProgramItem(it.id)}
                        className="rounded-full border border-destructive/30 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-destructive hover:bg-destructive/10"
                      >
                        Suppr.
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>


        <div className="mt-6 flex gap-2">
          {onDelete ? (
            <button
              onClick={onDelete}
              className="rounded-full border border-destructive/30 px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-destructive hover:bg-destructive/10"
            >
              Supprimer
            </button>
          ) : null}
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-border py-3 font-mono text-[10px] uppercase tracking-widest hover:bg-accent/20"
          >
            Annuler
          </button>
          <button
            disabled={!name.trim() || !venue.trim()}
            onClick={() =>
              onSave({
                type,
                label,
                name: name.trim(),
                date,
                timeStart,
                timeEnd: timeEnd || undefined,
                venue: venue.trim(),
                dressCode: dressCode.trim() || undefined,
                color,
                capacity: capacity === "" ? undefined : capacity,
                notes: notes.trim() || undefined,
                program: program
                  .map((it) => ({
                    ...it,
                    title: it.title.trim(),
                    description: it.description?.trim() || undefined,
                  }))
                  .filter((it) => it.title.length > 0),
                status,
              })
            }
            className="flex-1 rounded-full bg-primary py-3 font-mono text-[10px] uppercase tracking-widest text-primary-foreground disabled:opacity-40"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
