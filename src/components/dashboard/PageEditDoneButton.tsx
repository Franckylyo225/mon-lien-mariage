import { Check } from "lucide-react";

/**
 * Takes the place of the status pill in the AppHeader center slot while the
 * page editor is open. The "Édition" pill would only restate what the editing
 * chrome already shows, so the slot is spent on the way out instead.
 *
 * Save feedback is not repeated here: PreviewEditor's own SaveIndicator toast
 * already announces it.
 */
export function PageEditDoneButton({ onDone }: { onDone: () => void }) {
  return (
    <button
      type="button"
      onClick={onDone}
      aria-label="Terminer l'édition"
      className="inline-flex min-h-8 items-center gap-1.5 rounded-full px-3.5 text-[12px] font-medium transition hover:opacity-90 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:text-[13px]"
      style={{ backgroundColor: "#1A1A1A", color: "#ffffff" }}
    >
      <Check size={14} strokeWidth={2.5} />
      <span>Terminer</span>
    </button>
  );
}
