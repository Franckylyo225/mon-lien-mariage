import type { GuestSource, RSVPStatus } from "@/lib/wedding-store";
import { guestTypeMeta, type GuestType } from "@/lib/guest-meta";
import { cn } from "@/lib/utils";

/** One status for a guest across all their steps: confirmed / declined only when unanimous. */
export function globalRsvp(all: RSVPStatus[]): RSVPStatus {
  if (all.length === 0) return "en_attente";
  if (all.every((s) => s === "confirmé")) return "confirmé";
  if (all.every((s) => s === "décliné")) return "décliné";
  return "en_attente";
}

export const statusLabel: Record<RSVPStatus, string> = {
  confirmé: "Confirmé",
  en_attente: "En attente",
  décliné: "Décliné",
  sans_reponse: "En attente",
};

const statusStyle: Record<RSVPStatus, string> = {
  confirmé: "bg-emerald-50 text-emerald-700",
  en_attente: "bg-amber-50 text-amber-700",
  décliné: "bg-muted text-muted-foreground",
  sans_reponse: "bg-amber-50 text-amber-700",
};

export function StatusBadge({ status, className }: { status: RSVPStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-medium",
        statusStyle[status],
        className,
      )}
    >
      {statusLabel[status]}
    </span>
  );
}

export function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0] ?? "")
    .join("")
    .toUpperCase();
}

export function GuestAvatar({
  name,
  guestType,
  className,
}: {
  name: string;
  guestType: GuestType;
  className?: string;
}) {
  const meta = guestTypeMeta[guestType] ?? guestTypeMeta.autre;
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-full text-[14px] font-medium",
        className,
      )}
      style={{ backgroundColor: meta.bg, color: meta.fg }}
    >
      {initialsOf(name) || "?"}
    </span>
  );
}

export const sourceLabel: Record<GuestSource, string> = {
  manuel: "Ajouté manuellement",
  csv: "Importé",
  auto: "Inscrit via le lien public",
  qr_signup: "Inscrit via le QR code",
};

export const isSelfSignup = (source: GuestSource) => source === "auto" || source === "qr_signup";
