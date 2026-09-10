import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  IconChevronRight,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


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
  coutumier: "Mariage coutumier",
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
    deleteWedding,
  } = useWedding();
  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<WeddingSummary | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!pendingDelete || deleting) return;
    setDeleting(true);
    const ok = await deleteWedding(pendingDelete.id);
    setDeleting(false);
    setPendingDelete(null);
    toast[ok ? "success" : "error"](
      ok ? "Brouillon supprimé." : "Suppression impossible.",
    );
  };


  const { upcoming, past } = useMemo(() => {
    const up: WeddingSummary[] = [];
    const pa: WeddingSummary[] = [];
    for (const w of weddings) {
      if (isPastEvent(w.weddingDate)) pa.push(w);
      else up.push(w);
    }
    pa.sort((a, b) => (b.weddingDate ?? "").localeCompare(a.weddingDate ?? ""));
    return { upcoming: up, past: pa };
  }, [weddings]);

  const visiblePast = showAllPast ? past : past.slice(0, 5);

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
                onDelete={w.isPublished ? undefined : () => setPendingDelete(w)}
              />
            ))}
          </Section>
        ) : null}

        {past.length > 0 ? (
          <section>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
              Passés
            </p>
            <ul className="space-y-2">
              {visiblePast.map((w) => (
                <li key={w.id}>
                  <EventCard
                    w={w}
                    past
                    isActive={w.id === activeWeddingId}
                    onOpen={() => handleOpen(w.id)}
                    onDelete={w.isPublished ? undefined : () => setPendingDelete(w)}
                  />
                </li>
              ))}
            </ul>
            {past.length > 5 ? (
              <button
                type="button"
                onClick={() => setShowAllPast((v) => !v)}
                className="mt-2 w-full rounded-[10px] border border-dashed border-border px-3 py-2 text-[11px] text-muted-foreground transition active:bg-secondary/60"
                style={{ borderWidth: "0.5px" }}
              >
                {showAllPast
                  ? "Réduire"
                  : `Voir tous les événements passés (${past.length})`}
              </button>
            ) : null}
          </section>
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

        <AlertDialog
          open={pendingDelete !== null}
          onOpenChange={(o) => { if (!o && !deleting) setPendingDelete(null); }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer ce brouillon ?</AlertDialogTitle>
              <AlertDialogDescription>
                Toutes les informations de cet événement (programme, invités,
                messages) seront définitivement effacées. Cette action est
                irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => { e.preventDefault(); void handleDelete(); }}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? "Suppression…" : "Supprimer"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
  onDelete,
}: {
  w: WeddingSummary;
  past?: boolean;
  isActive: boolean;
  onOpen: () => void;
  onDelete?: () => void;
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
    <div
      className="flex w-full items-center gap-2 rounded-[10px] bg-card pr-1 transition"
      style={{
        border: "0.5px solid " + (isActive ? "hsl(var(--foreground))" : "hsl(var(--border))"),
        opacity: past ? 0.65 : 1,
      }}
    >
      <button
        onClick={onOpen}
        className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 text-left transition active:bg-secondary/60"
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
      {onDelete ? (
        <button
          type="button"
          onClick={onDelete}
          aria-label="Supprimer ce brouillon"
          className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground transition active:bg-secondary"
        >
          <IconTrash size={15} strokeWidth={1.75} />
        </button>
      ) : null}
    </div>
  );
}

