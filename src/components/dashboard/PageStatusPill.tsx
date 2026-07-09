import { IconLoader2 } from "@tabler/icons-react";

export type PageStatus = "draft" | "edit" | "live" | "publishing";

interface Style {
  bg: string;
  ink: string;
  dot: string;
  label: string;
  dotAnim?: "pulse" | "spin";
}

const STYLES: Record<PageStatus, Style> = {
  draft: {
    bg: "#F3F4F6",
    ink: "#4B5563",
    dot: "#6B7280",
    label: "Brouillon",
  },
  edit: {
    bg: "#FEF3C7",
    ink: "#92400E",
    dot: "#D97706",
    label: "Édition",
    dotAnim: "pulse",
  },
  live: {
    bg: "#D1FAE5",
    ink: "#065F46",
    dot: "#059669",
    label: "En ligne",
  },
  publishing: {
    bg: "#DBEAFE",
    ink: "#1E40AF",
    dot: "#1E40AF",
    label: "Publication en cours",
    dotAnim: "spin",
  },
};

/**
 * Compact status pill rendered in the AppHeader center slot on the preview
 * page. Announces state changes to assistive tech via aria-live="polite".
 */
export function PageStatusPill({ status }: { status: PageStatus }) {
  const s = STYLES[status];

  return (
    <span
      role="status"
      aria-live="polite"
      className="inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium sm:gap-2 sm:px-3 sm:py-1 sm:text-[12px]"
      style={{ backgroundColor: s.bg, color: s.ink }}
    >
      {s.dotAnim === "spin" ? (
        <IconLoader2
          size={12}
          strokeWidth={2.5}
          className="motion-safe:animate-spin"
          style={{ color: s.dot }}
          aria-hidden
        />
      ) : (
        <span
          aria-hidden
          className={
            "inline-block size-1.5 shrink-0 rounded-full sm:size-2 " +
            (s.dotAnim === "pulse" ? "motion-safe:animate-pulse-dot" : "")
          }
          style={{ backgroundColor: s.dot }}
        />
      )}
      <span className="truncate">{s.label}</span>
    </span>
  );
}
