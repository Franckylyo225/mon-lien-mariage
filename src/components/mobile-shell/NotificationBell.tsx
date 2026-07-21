import { useEffect, useRef, useState } from "react";
import { IconBell, IconCheck, IconInbox } from "@tabler/icons-react";
import { useNotifications, type AppNotification } from "@/hooks/use-notifications";

interface Props {
  userId: string | null | undefined;
}

function timeAgo(iso: string) {
  const then = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - then);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `il y a ${d} j`;
  return new Date(iso).toLocaleDateString("fr-FR");
}

function iconFor(type: string) {
  if (type === "rsvp_milestone") return "🎉";
  if (type === "rsvp_confirmed") return "💌";
  return "🔔";
}

export function NotificationBell({ userId }: Props) {
  const { items, unreadCount, markAllRead, markOneRead } = useNotifications(userId);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && unreadCount > 0) {
      // Mark as read shortly after opening so the badge clears
      setTimeout(() => markAllRead(), 400);
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label="Notifications"
        className="relative grid size-9 shrink-0 place-items-center rounded-full text-foreground/70 transition active:scale-95"
      >
        <IconBell size={20} strokeWidth={1.75} />
        {unreadCount > 0 ? (
          <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-destructive text-[9px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-11 z-50 w-[min(92vw,22rem)] overflow-hidden rounded-2xl border border-border bg-background shadow-xl">
          <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
            <p className="text-sm font-medium">Notifications</p>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={markAllRead}
                className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
              >
                <IconCheck size={12} /> Tout marquer lu
              </button>
            ) : null}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center text-muted-foreground">
                <IconInbox size={28} strokeWidth={1.5} />
                <p className="text-xs">Aucune notification pour le moment.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border/60">
                {items.map((n) => (
                  <NotificationItem
                    key={n.id}
                    n={n}
                    onOpen={() => markOneRead(n.id)}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function NotificationItem({
  n,
  onOpen,
}: {
  n: AppNotification;
  onOpen: () => void;
}) {
  const unread = !n.read_at;
  return (
    <li
      className={`flex gap-3 px-4 py-3 transition ${unread ? "bg-secondary/50" : ""}`}
      onClick={onOpen}
    >
      <div className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-base">
        <span aria-hidden>{iconFor(n.type)}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={`truncate text-sm ${unread ? "font-medium" : ""}`}>
            {n.title}
          </p>
          {unread ? (
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-destructive" />
          ) : null}
        </div>
        {n.body ? (
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
            {n.body}
          </p>
        ) : null}
        <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground/70">
          {timeAgo(n.created_at)}
        </p>
      </div>
    </li>
  );
}
