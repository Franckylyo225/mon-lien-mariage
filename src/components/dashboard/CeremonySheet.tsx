import { useMemo, useRef, useState, type ReactNode } from "react";
import { Drawer } from "vaul";
import { ChevronDown, GripVertical, Plus, Trash2 } from "lucide-react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  useWedding,
  type Ceremony,
  type CeremonyType,
  type ProgramItem,
} from "@/lib/wedding-store";
import { ceremonyMeta } from "@/lib/ceremony-meta";
import { useVisualViewport } from "@/hooks/use-visual-viewport";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";

const TYPE_ORDER = Object.keys(ceremonyMeta) as CeremonyType[];

type Draft = {
  type: CeremonyType | null;
  label: string;
  name: string;
  color: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  venue: string;
  program: ProgramItem[];
};

interface Props {
  /** Present when editing an existing step. */
  initial?: Ceremony;
  onClose: () => void;
  onSave: (c: Omit<Ceremony, "id" | "publicSlug">) => void;
  onDelete?: () => void;
}

const newItemId = () => Math.random().toString(36).slice(2, 9);
const hasDetails = (it: ProgramItem) => !!(it.description || it.location || it.mapsUrl);

export function CeremonySheet({ initial, onClose, onSave, onDelete }: Props) {
  const { couple } = useWedding();
  const vv = useVisualViewport();

  const baseline = useRef<Draft>(
    initial
      ? {
          type: initial.type,
          label: initial.label,
          name: initial.name,
          color: initial.color,
          date: initial.date,
          timeStart: initial.timeStart ?? "",
          timeEnd: initial.timeEnd ?? "",
          venue: initial.venue ?? "",
          program: initial.program ?? [],
        }
      : {
          type: null,
          label: "",
          name: "",
          color: "#d97757",
          date: couple.weddingDate ?? "",
          timeStart: "",
          timeEnd: "",
          venue: "",
          program: [],
        },
  );
  const [draft, setDraft] = useState<Draft>(baseline.current);
  const [nameTouched, setNameTouched] = useState(!!initial);
  const [programOpen, setProgramOpen] = useState((initial?.program?.length ?? 0) > 0);
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set((initial?.program ?? []).filter(hasDetails).map((it) => it.id)),
  );
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }));
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(baseline.current), [draft]);
  const canSave =
    !!draft.type && draft.name.trim().length > 0 && !!draft.date && (dirty || !initial);

  const pickType = (t: CeremonyType) => {
    const meta = ceremonyMeta[t];
    setDraft((d) => ({
      ...d,
      type: t,
      label: meta.label,
      color: meta.color,
      name: nameTouched ? d.name : meta.label,
    }));
  };

  const handleOpenChange = (open: boolean) => {
    if (open) return;
    if (dirty) setConfirmDiscard(true);
    else onClose();
  };

  const save = () => {
    if (!canSave || !draft.type) return;
    onSave({
      type: draft.type,
      label: draft.label,
      name: draft.name.trim(),
      date: draft.date,
      timeStart: draft.timeStart,
      timeEnd: draft.timeEnd || undefined,
      venue: draft.venue.trim(),
      mapsUrl: initial?.mapsUrl,
      dressCode: initial?.dressCode,
      color: draft.color,
      capacity: initial?.capacity,
      notes: initial?.notes,
      program: draft.program
        .map((it) => ({
          ...it,
          title: it.title.trim(),
          description: it.description?.trim() || undefined,
        }))
        .filter((it) => it.title.length > 0),
      status: initial?.status ?? "publiée",
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    setDraft((d) => {
      const from = d.program.findIndex((it) => it.id === active.id);
      const to = d.program.findIndex((it) => it.id === over.id);
      return from < 0 || to < 0 ? d : { ...d, program: arrayMove(d.program, from, to) };
    });
  };

  const updateItem = (id: string, p: Partial<ProgramItem>) =>
    setDraft((d) => ({
      ...d,
      program: d.program.map((it) => (it.id === id ? { ...it, ...p } : it)),
    }));
  const addItem = () => {
    setProgramOpen(true);
    setDraft((d) => ({
      ...d,
      program: [...d.program, { id: newItemId(), time: "", title: "", description: "" }],
    }));
  };
  const removeItem = (id: string) =>
    setDraft((d) => ({ ...d, program: d.program.filter((it) => it.id !== id) }));
  const toggleExpanded = (id: string) =>
    setExpanded((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const locked = couple.isLocked;

  return (
    <>
      <ConfirmDialog
        open={confirmDiscard}
        onOpenChange={setConfirmDiscard}
        title="Abandonner les modifications ?"
        description="Les changements non enregistrés seront perdus."
        confirmLabel="Abandonner"
        cancelLabel="Continuer l'édition"
        destructive
        onConfirm={onClose}
      />
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Supprimer cette étape ?"
        description="Les réponses des invités pour cette étape seront aussi supprimées. Cette action est définitive."
        confirmLabel="Supprimer"
        destructive
        onConfirm={() => onDelete?.()}
      />
      <Drawer.Root open onOpenChange={handleOpenChange} repositionInputs={false}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
          <Drawer.Content
            style={
              vv
                ? { bottom: vv.keyboardHeight, maxHeight: Math.max(vv.visibleHeight - 12, 240) }
                : undefined
            }
            className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[90vh] w-full max-w-xl flex-col rounded-t-3xl border border-b-0 border-border bg-background outline-none"
          >
            <Drawer.Title className="sr-only">
              {initial ? "Modifier l'étape" : "Nouvelle étape"}
            </Drawer.Title>
            <div className="flex items-center justify-center pt-3">
              <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
            </div>

            <header className="flex items-center justify-between gap-3 px-5 pb-3 pt-4">
              <h2 className="font-serif text-xl">
                {initial ? "Modifier l'étape" : "Nouvelle étape"}
              </h2>
              <button
                type="button"
                onClick={save}
                disabled={!canSave}
                className={cn(
                  "rounded-full px-4 py-1.5 text-[13px] font-semibold transition",
                  canSave ? "btn-accent-gradient" : "bg-muted text-muted-foreground",
                )}
              >
                Enregistrer
              </button>
            </header>

            <div className="flex-1 space-y-5 overflow-y-auto px-5 pb-8 pt-2">
              <Field label="Type d'étape">
                <div className="flex flex-wrap gap-2">
                  {TYPE_ORDER.map((t) => {
                    const meta = ceremonyMeta[t];
                    const active = draft.type === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        aria-pressed={active}
                        onClick={() => pickType(t)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-full border px-3 py-2 text-[13px] transition",
                          active
                            ? "border-primary bg-secondary font-medium"
                            : "border-border bg-card hover:bg-secondary/40",
                        )}
                      >
                        <span aria-hidden style={{ color: meta.color }}>
                          {meta.icon}
                        </span>
                        {meta.short}
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label="Nom affiché">
                <input
                  value={draft.name}
                  onChange={(e) => {
                    setNameTouched(true);
                    patch({ name: e.target.value });
                  }}
                  placeholder="Ex : Mariage traditionnel"
                  className={inputClass}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Field label="Date">
                    <input
                      type="date"
                      value={draft.date}
                      onChange={(e) => patch({ date: e.target.value })}
                      className={inputClass}
                    />
                  </Field>
                </div>
                <Field label="Début">
                  <input
                    type="time"
                    value={draft.timeStart}
                    onChange={(e) => patch({ timeStart: e.target.value })}
                    className={inputClass}
                  />
                </Field>
                <Field label="Fin (facultatif)">
                  <input
                    type="time"
                    value={draft.timeEnd}
                    onChange={(e) => patch({ timeEnd: e.target.value })}
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field label="Lieu">
                <input
                  value={draft.venue}
                  onChange={(e) => patch({ venue: e.target.value })}
                  placeholder="Ex : Hôtel de ville de Cocody"
                  className={inputClass}
                />
              </Field>

              <div className="rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() => setProgramOpen((o) => !o)}
                  aria-expanded={programOpen}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                >
                  <span>
                    <span className="block text-[14px] font-medium">
                      Déroulé{draft.program.length > 0 ? ` · ${draft.program.length}` : ""}
                    </span>
                    <span className="block text-[12px] text-muted-foreground">
                      Facultatif — les temps forts affichés aux invités
                    </span>
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-4 shrink-0 text-muted-foreground transition-transform",
                      programOpen && "rotate-180",
                    )}
                  />
                </button>

                {programOpen ? (
                  <div className="space-y-2 border-t border-border p-3" data-vaul-no-drag>
                    {draft.program.length === 0 ? (
                      <p className="rounded-lg border border-dashed border-border p-3 text-center text-[12px] text-muted-foreground">
                        Aucun temps fort. Ajoutez le déroulé (accueil, discours, dîner…).
                      </p>
                    ) : (
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={onDragEnd}
                      >
                        <SortableContext
                          items={draft.program.map((it) => it.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <ul className="space-y-2">
                            {draft.program.map((it) => (
                              <ProgramRow
                                key={it.id}
                                item={it}
                                expanded={expanded.has(it.id)}
                                onToggle={() => toggleExpanded(it.id)}
                                onChange={(p) => updateItem(it.id, p)}
                                onRemove={() => removeItem(it.id)}
                              />
                            ))}
                          </ul>
                        </SortableContext>
                      </DndContext>
                    )}
                    <button
                      type="button"
                      onClick={addItem}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-card py-2.5 text-[13px] font-medium transition hover:bg-secondary/40"
                    >
                      <Plus className="size-4" />
                      Ajouter un temps fort
                    </button>
                  </div>
                ) : null}
              </div>

              {initial && onDelete ? (
                <div className="border-t border-border pt-4 text-center">
                  <button
                    type="button"
                    disabled={locked}
                    onClick={() => setConfirmDelete(true)}
                    className="text-[13px] text-destructive hover:underline disabled:no-underline disabled:opacity-40"
                  >
                    Supprimer cette étape
                  </button>
                  {locked ? (
                    <p className="mt-1 text-[12px] text-muted-foreground">
                      Impossible après la publication de la page.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}

const inputClass =
  "w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[12px] font-medium text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

function ProgramRow({
  item,
  expanded,
  onToggle,
  onChange,
  onRemove,
}: {
  item: ProgramItem;
  expanded: boolean;
  onToggle: () => void;
  onChange: (p: Partial<ProgramItem>) => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "rounded-xl border border-border bg-background p-2.5",
        isDragging && "relative z-10 shadow-lg",
      )}
    >
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label="Déplacer ce temps fort"
          className="grid size-8 shrink-0 cursor-grab touch-none place-items-center rounded-md text-muted-foreground hover:bg-muted active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </button>
        <input
          type="time"
          value={item.time}
          onChange={(e) => onChange({ time: e.target.value })}
          aria-label="Heure"
          className="w-[6.5rem] shrink-0 rounded-lg border border-input bg-card px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <input
          value={item.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Titre (ex : Discours)"
          aria-label="Titre"
          className="min-w-0 flex-1 rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="button"
          onClick={onRemove}
          aria-label="Supprimer ce temps fort"
          className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="ml-10 mt-1.5 text-[12px] text-muted-foreground underline underline-offset-2"
      >
        {expanded ? "Masquer les détails" : "Détails (description, lieu, lien)"}
      </button>
      {expanded ? (
        <div className="ml-10 mt-2 space-y-2">
          <textarea
            value={item.description ?? ""}
            onChange={(e) => onChange({ description: e.target.value })}
            rows={2}
            placeholder="Description (facultative)"
            className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            value={item.location ?? ""}
            onChange={(e) => onChange({ location: e.target.value })}
            placeholder="Lieu (ex : Église Saint-Paul, Plateau)"
            className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            value={item.mapsUrl ?? ""}
            onChange={(e) => onChange({ mapsUrl: e.target.value })}
            placeholder="Lien Google Maps (facultatif)"
            className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      ) : null}
    </li>
  );
}
