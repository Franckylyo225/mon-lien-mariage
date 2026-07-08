import { IconBell } from "@tabler/icons-react";

interface AppHeaderProps {
  title?: string;
  initial: string;
  onOpenDrawer: () => void;
  hasNotifications?: boolean;
}

export function AppHeader({ title, initial, onOpenDrawer, hasNotifications }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-14 border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-full max-w-xl items-center justify-between gap-3 px-4">
        <button
          onClick={onOpenDrawer}
          aria-label="Ouvrir le menu"
          className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary transition active:scale-95"
        >
          <span className="font-serif text-base italic text-primary">{initial}</span>
        </button>

        <h1 className="min-w-0 flex-1 truncate text-center text-[13px] font-medium tracking-wide text-foreground/80">
          {title ?? ""}
        </h1>

        <button
          aria-label="Notifications"
          className="relative grid size-9 shrink-0 place-items-center rounded-full text-foreground/70 transition active:scale-95"
        >
          <IconBell size={20} strokeWidth={1.75} />
          {hasNotifications ? (
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-destructive" />
          ) : null}
        </button>
      </div>
    </header>
  );
}
