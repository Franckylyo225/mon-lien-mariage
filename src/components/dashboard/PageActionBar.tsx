import type { ReactNode } from "react";
import { ArrowRight, Pencil, Eye, LoaderCircle, Share } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMorphPhase } from "@/hooks/use-morph-phase";

/**
 * Floating action dock pinned to the bottom of the page editor.
 *
 * It owns the bottom of the screen in preview mode only: tapping "Modifier"
 * hands that spot over to the editor's chip bar, which anchors at the same
 * place, so one shrinks away as the other grows in. Coming back out is the
 * header's "Terminer" button.
 *
 * The space both bars occupy is mirrored by `--page-dock-h` on the dashboard
 * chrome, which page content uses to keep clear of them.
 */
interface Props {
  mode: "preview" | "edit";
  isPublished: boolean;
  isPublishing?: boolean;
  onEditToggle: () => void;
  onPublish: () => void;
  onShare: () => void;
  onView: () => void;
}

export function PageActionBar({
  mode,
  isPublished,
  isPublishing = false,
  onEditToggle,
  onPublish,
  onShare,
  onView,
}: Props) {
  const phase = useMorphPhase(mode !== "edit");
  if (phase === "hidden") return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40">
      <div className="mx-auto max-w-xl px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div
          className={cn(
            "pointer-events-auto rounded-full border border-border/70 bg-background/90 p-1.5 shadow-[0_14px_36px_-14px_rgba(26,26,26,0.45)] backdrop-blur",
            phase === "out" ? "animate-dock-out" : "animate-dock-in",
          )}
        >
          {/* Keyed so switching to and from the publishing state crossfades. */}
          <div
            key={isPublishing ? "publishing" : "actions"}
            className="animate-dock-swap flex items-center gap-1"
          >
            {isPublishing ? (
              <DockButton
                variant="primary"
                disabled
                label="Publication…"
                ariaLabel="Publication en cours"
                icon={<LoaderCircle size={16} className="motion-safe:animate-spin" />}
              />
            ) : (
              <>
                <DockButton
                  onClick={onView}
                  label="Aperçu"
                  ariaLabel="Voir la page en plein écran comme un visiteur"
                  icon={<Eye size={16} strokeWidth={2} />}
                />
                <DockButton
                  onClick={onEditToggle}
                  label="Modifier"
                  ariaLabel="Passer en mode édition"
                  icon={<Pencil size={16} strokeWidth={2} />}
                />
                {isPublished ? (
                  <DockButton
                    variant="primary"
                    onClick={onShare}
                    label="Partager"
                    ariaLabel="Partager le lien de votre page"
                    icon={<Share size={16} strokeWidth={2} />}
                  />
                ) : (
                  <DockButton
                    variant="primary"
                    onClick={onPublish}
                    label="Publier"
                    ariaLabel="Publier votre mariage"
                    icon={<ArrowRight size={16} strokeWidth={2} />}
                    iconAfter
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Matches the publish flow's brand buttons. */
const PRIMARY_STYLE = { backgroundColor: "#4B1528", color: "#FBEAF0" };

function DockButton({
  label,
  ariaLabel,
  icon,
  iconAfter = false,
  variant = "ghost",
  disabled = false,
  onClick,
}: {
  label: string;
  ariaLabel: string;
  icon: ReactNode;
  iconAfter?: boolean;
  variant?: "ghost" | "primary";
  disabled?: boolean;
  onClick?: () => void;
}) {
  const filled = variant === "primary";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        "inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full px-3 text-[12px] font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:text-[13px]",
        disabled
          ? "cursor-not-allowed opacity-70"
          : filled
            ? "hover:opacity-90 active:scale-[0.97]"
            : "text-foreground hover:bg-muted active:scale-[0.97]",
      )}
      style={filled ? PRIMARY_STYLE : undefined}
    >
      {iconAfter ? null : icon}
      <span>{label}</span>
      {iconAfter ? icon : null}
    </button>
  );
}
