import {
  IconArrowRight,
  IconCheck,
  IconEdit,
  IconEye,
  IconLoader2,
  IconShare,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { SaveStatus } from "@/hooks/use-autosave";

/**
 * Sticky action bar rendered directly below the AppHeader on the preview
 * page. Two slots: a secondary action on the left, a primary action on the
 * right. Contents depend on preview/edit mode and publish state.
 */
interface Props {
  mode: "preview" | "edit";
  isPublished: boolean;
  isPublishing?: boolean;
  saveStatus: SaveStatus;
  onEditToggle: () => void;
  onPublish: () => void;
  onShare: () => void;
  onView: () => void;
}

export function PageActionBar({
  mode,
  isPublished,
  isPublishing = false,
  saveStatus,
  onEditToggle,
  onPublish,
  onShare,
  onView,
}: Props) {
  const editing = mode === "edit";

  return (
    <div
      className={cn(
        "sticky top-14 z-20 border-b border-border/60 bg-background/95 backdrop-blur",
      )}
    >
      <div className="mx-auto flex h-13 max-w-xl items-center justify-between gap-2 px-3 py-2 sm:h-14 sm:px-5">
        {/* Secondary (left) */}
        <div className="flex min-w-0 items-center">
          {editing ? (
            <SaveStatusIndicator status={saveStatus} />
          ) : isPublishing ? (
            <span aria-hidden />
          ) : (
            <button
              type="button"
              onClick={onEditToggle}
              aria-label="Passer en mode édition"
              className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-transparent px-3 py-1.5 text-[11px] font-medium text-foreground transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:px-4 sm:py-2 sm:text-[13px]"
            >
              <IconEdit size={14} strokeWidth={2} />
              <span>Modifier</span>
            </button>
          )}
        </div>

        {/* Primary (right) */}
        <div className="flex shrink-0 items-center">
          {isPublishing ? (
            <button
              type="button"
              disabled
              aria-label="Publication en cours"
              className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-[11px] font-medium text-muted-foreground opacity-70 sm:px-4 sm:py-2 sm:text-[13px]"
            >
              <IconLoader2 size={14} className="motion-safe:animate-spin" />
              <span>Publication…</span>
            </button>
          ) : editing ? (
            <button
              type="button"
              onClick={onEditToggle}
              aria-label="Terminer l'édition"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:px-4 sm:py-2 sm:text-[13px]"
              style={{ backgroundColor: "#1A1A1A", color: "#ffffff" }}
            >
              <IconCheck size={14} strokeWidth={2.5} />
              <span>Terminer</span>
            </button>
          ) : isPublished ? (
            <button
              type="button"
              onClick={onShare}
              aria-label="Partager le lien de votre page"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:px-4 sm:py-2 sm:text-[13px]"
              style={{ backgroundColor: "#4B1528", color: "#FBEAF0" }}
            >
              <IconShare size={14} strokeWidth={2} />
              <span>Partager</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onPublish}
              aria-label="Publier votre mariage"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:px-4 sm:py-2 sm:text-[13px]"
              style={{ backgroundColor: "#4B1528", color: "#FBEAF0" }}
            >
              <span>Publier</span>
              <IconArrowRight size={14} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  // Treat idle as "saved" once the user is in edit mode — cleaner UX than
  // showing nothing.
  const showAsSaving = status === "saving";
  const showAsError = status === "error";

  return (
    <span
      role="status"
      aria-live="polite"
      className="inline-flex items-center gap-1.5 text-[11px] font-medium sm:text-[12px]"
      style={{
        color: showAsError
          ? "hsl(var(--destructive))"
          : showAsSaving
            ? "#4B5563"
            : "#059669",
      }}
    >
      {showAsSaving ? (
        <IconLoader2
          size={14}
          strokeWidth={2}
          className="motion-safe:animate-spin"
          aria-hidden
        />
      ) : showAsError ? (
        <IconCheck size={14} strokeWidth={2.5} aria-hidden />
      ) : (
        <IconCheck size={14} strokeWidth={2.5} aria-hidden />
      )}
      <span>
        {showAsSaving
          ? "Enregistrement…"
          : showAsError
            ? "Erreur — réessayez"
            : "Enregistré"}
      </span>
    </span>
  );
}
