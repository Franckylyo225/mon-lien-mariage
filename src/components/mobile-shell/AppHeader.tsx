import { useState, type ReactNode } from "react";
import { Bell, ChevronLeft } from "lucide-react";
import { NotificationBell } from "./NotificationBell";

interface AppHeaderProps {
  title?: string;
  initial: string;
  /** Profile photo (e.g. from Google sign-in). Falls back to the initial when absent or broken. */
  avatarUrl?: string | null;
  onOpenDrawer: () => void;
  hasNotifications?: boolean;
  /**
   * When provided, the bell shows a live unread badge and dropdown backed by
   * the notifications table for this user. Falls back to the legacy static dot
   * (based on `hasNotifications`) when no userId is available.
   */
  userId?: string | null;
  /**
   * Custom node rendered in the center slot. When provided, it replaces the
   * default h1 title (used on routes like /dashboard/preview that show a
   * status pill instead of a page title).
   */
  centerContent?: ReactNode;
  /**
   * When provided, the leading avatar is replaced by a back chevron. Immersive
   * routes (the page editor) use it: the drawer is unreachable there anyway
   * since the bottom tab bar is hidden, so the slot is better spent on an exit.
   */
  onBack?: () => void;
  backLabel?: string;
}

export function AppHeader({
  title,
  initial,
  avatarUrl,
  onOpenDrawer,
  hasNotifications,
  userId,
  centerContent,
  onBack,
  backLabel,
}: AppHeaderProps) {
  const [photoFailed, setPhotoFailed] = useState(false);
  return (
    <header className="sticky top-0 z-30 h-14 border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-full max-w-xl items-center justify-between gap-3 px-3 sm:px-5">
        {onBack ? (
          <button
            onClick={onBack}
            aria-label={backLabel ?? "Retour"}
            className="grid size-10 shrink-0 place-items-center rounded-full border border-border/70 bg-card text-foreground transition active:scale-95"
          >
            <ChevronLeft size={20} strokeWidth={2} />
          </button>
        ) : (
          <button
            onClick={onOpenDrawer}
            aria-label="Ouvrir le menu"
            className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-secondary to-card p-0.5 shadow-[0_0_0_4px] shadow-primary/10 ring-1 ring-primary/30 transition active:scale-95"
          >
            {avatarUrl && !photoFailed ? (
              <img
                src={avatarUrl}
                alt=""
                referrerPolicy="no-referrer"
                onError={() => setPhotoFailed(true)}
                className="size-full rounded-full object-cover"
              />
            ) : (
              <span className="font-produit text-[15px] font-bold text-primary">{initial}</span>
            )}
          </button>
        )}

        <div className="flex min-w-0 flex-1 items-center justify-center">
          {centerContent ?? (
            <h1 className="min-w-0 truncate text-center text-[13px] font-medium tracking-wide text-foreground/80">
              {title ?? ""}
            </h1>
          )}
        </div>

        {userId ? (
          <NotificationBell userId={userId} />
        ) : (
          <button
            aria-label="Notifications"
            className="relative grid size-9 shrink-0 place-items-center rounded-full text-foreground/70 transition active:scale-95"
          >
            <Bell size={20} strokeWidth={1.75} />
            {hasNotifications ? (
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-destructive" />
            ) : null}
          </button>
        )}
      </div>
    </header>
  );
}
