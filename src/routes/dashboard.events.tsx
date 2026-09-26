import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CalendarHeart, ChevronRight, Plus, Trash } from "lucide-react";
import { IconBadge, PageHeader } from "@/components/dashboard/premium";
import { Skeleton } from "@/components/ui/skeleton";
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

import { useWedding, formatShortDate, isPastEvent, type WeddingSummary } from "@/lib/wedding-store";

export const Route = createFileRoute("/dashboard/events")({
  head: () => ({ meta: [{ title: "Mes événements — MonInvit.com" }] }),
  component: EventsPage,
});

const EVENT_TYPE_LABELS: Record<string, string> = {
  mariage: "Mariage",
  dot: "Mariage traditionnel",
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
  const [showAllPast, setShowAllPast] = useState(false);

  const handleDelete = async () => {
    if (!pendingDelete || deleting) return;
    setDeleting(true);
    const ok = await deleteWedding(pendingDelete.id);
    setDeleting(false);
    setPendingDelete(null);
    toast[ok ? "success" : "error"](ok ? "Brouillon supprimé." : "Suppression impossible.");
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
      <div className="space-y-6 pt-2">
        <PageHeader title="Mes événements" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
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
    <div className="space-y-6 pt-2">
      <PageHeader
        title="Mes événements"
        subtitle={`${weddings.length} événement${weddings.length > 1 ? "s" : ""}`}
        actions={
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating}
            className="btn-accent-gradient inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold"
          >
            <Plus size={16} strokeWidth={2} />
            {creating ? "Création…" : "Nouvel événement"}
          </button>
        }
      />

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
          <h2 className="mb-3 text-[15px] font-semibold">Passés</h2>
          <ul className="space-y-2.5">
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
              className="mt-3 w-full rounded-xl border border-dashed border-border px-3 py-2.5 text-[13px] text-muted-foreground transition hover:bg-secondary/40"
            >
              {showAllPast ? "Réduire" : `Voir tous les événements passés (${past.length})`}
            </button>
          ) : null}
        </section>
      ) : null}

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(o) => {
          if (!o && !deleting) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce brouillon ?</AlertDialogTitle>
            <AlertDialogDescription>
              Toutes les informations de cet événement (programme, invités, messages) seront
              définitivement effacées. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleDelete();
              }}
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
      <h2 className="mb-3 text-[15px] font-semibold">{title}</h2>
      <ul className="space-y-2.5">
        {Array.isArray(children) ? (
          (children as React.ReactNode[]).map((c, i) => <li key={i}>{c}</li>)
        ) : (
          <li>{children}</li>
        )}
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
  const label =
    w.brideName || w.groomName
      ? `${w.brideName || "…"} & ${w.groomName || "…"}`
      : "Nouvel événement";
  const type = EVENT_TYPE_LABELS[w.eventType] ?? "Événement";
  const status = past
    ? w.isPublished
      ? { label: "Terminé", cls: "bg-muted text-muted-foreground" }
      : { label: "Non publié", cls: "bg-amber-50 text-amber-700" }
    : w.isPublished
      ? { label: "En ligne", cls: "bg-champagne-light text-champagne-deep" }
      : { label: "Brouillon", cls: "bg-secondary text-primary" };

  return (
    <div
      className={
        "flex w-full items-center gap-2 rounded-2xl border bg-card pr-1.5 transition " +
        (isActive ? "border-primary/50 ring-1 ring-primary/20" : "border-border") +
        (past ? " opacity-70" : "")
      }
    >
      <button
        onClick={onOpen}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl p-3.5 text-left transition hover:bg-secondary/30"
      >
        <IconBadge>
          <CalendarHeart className="size-[18px]" strokeWidth={1.75} />
        </IconBadge>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold">{label}</p>
          <p className="truncate text-[12px] text-muted-foreground">
            {type}
            {w.weddingDate ? ` · ${formatShortDate(w.weddingDate)}` : ""}
          </p>
        </div>
        <span
          className={"shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold " + status.cls}
        >
          {status.label}
        </span>
        <ChevronRight size={14} className="shrink-0 text-muted-foreground" />
      </button>
      {onDelete ? (
        <button
          type="button"
          onClick={onDelete}
          aria-label="Supprimer ce brouillon"
          className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash size={15} strokeWidth={1.75} />
        </button>
      ) : null}
    </div>
  );
}
