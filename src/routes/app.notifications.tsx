import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  IconArrowLeft,
  IconBell,
  IconChecks,
  IconLoader2,
} from "@tabler/icons-react";
import { supabase } from "@/integrations/supabase/client";
import { useNotifications } from "@/hooks/use-notifications";

export const Route = createFileRoute("/app/notifications")({
  head: () => ({
    meta: [
      { title: "Mes notifications — MonInvit.com" },
      {
        name: "description",
        content:
          "Historique de vos notifications MonInvit : publication, livre d'or, confirmations de présence et réponses du support.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NotificationsPage,
});

function iconFor(type: string) {
  if (type === "rsvp_milestone") return "🎉";
  if (type === "rsvp_confirmed") return "💌";
  if (type === "publication_activated") return "🚀";
  if (type === "guestbook_activated") return "📖";
  if (type === "guestbook_message") return "✍️";
  if (type === "support_reply") return "💬";
  return "🔔";
}

function labelFor(type: string) {
  if (type === "rsvp_milestone") return "Palier RSVP";
  if (type === "rsvp_confirmed") return "Confirmation";
  if (type === "publication_activated") return "Publication";
  if (type === "guestbook_activated") return "Livre d'or";
  if (type === "guestbook_message") return "Livre d'or";
  if (type === "support_reply") return "Support";
  return "Notification";
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

type Filter = "all" | "unread";

function NotificationsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      setUserId(data.user?.id ?? null);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const { items, unreadCount, loading, markAllRead, markOneRead } =
    useNotifications(userId);

  const visible = useMemo(
    () => (filter === "unread" ? items.filter((n) => !n.read_at) : items),
    [items, filter],
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground"
          >
            <IconArrowLeft size={14} />
            Tableau de bord
          </Link>
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={markAllRead}
              className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3.5 py-1.5 text-[11px] font-medium text-foreground transition active:scale-95"
            >
              <IconChecks size={14} />
              Tout marquer comme lu
            </button>
          ) : null}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-secondary text-primary">
            <IconBell size={20} strokeWidth={1.5} />
          </span>
          <div>
            <h1 className="font-serif text-2xl italic">Notifications</h1>
            <p className="text-[12px] text-muted-foreground">
              {unreadCount > 0
                ? `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`
                : "Tout est à jour"}
            </p>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-2">
          {(["all", "unread"] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={
                "rounded-full px-3.5 py-1.5 text-[11px] font-medium transition active:scale-95 " +
                (filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground")
              }
            >
              {f === "all" ? "Toutes" : "Non lues"}
            </button>
          ))}
        </div>

        {!ready || loading ? (
          <div className="grid place-items-center py-16">
            <IconLoader2 size={20} className="animate-spin opacity-50" />
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 py-16 text-center text-sm text-muted-foreground">
            {filter === "unread"
              ? "Aucune notification non lue."
              : "Aucune notification pour le moment."}
          </div>
        ) : (
          <ul className="space-y-2">
            {visible.map((n) => {
              const unread = !n.read_at;
              return (
                <li key={n.id}>
                  <div
                    className={
                      "rounded-xl border p-4 transition " +
                      (unread
                        ? "border-primary/30 bg-secondary/40"
                        : "border-border/60 bg-card")
                    }
                  >
                    <div className="flex items-start gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-background text-[15px]">
                        {iconFor(n.type)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-secondary px-2 py-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">
                            {labelFor(n.type)}
                          </span>
                          <span
                            className={
                              "rounded-full px-2 py-0.5 text-[9px] uppercase tracking-wider " +
                              (unread
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-muted-foreground")
                            }
                          >
                            {unread ? "Non lu" : "Lu"}
                          </span>
                        </div>
                        <p className="mt-1.5 text-[14px] font-medium">{n.title}</p>
                        {n.body ? (
                          <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
                            {n.body}
                          </p>
                        ) : null}
                        <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                          {formatDate(n.created_at)}
                        </p>
                      </div>
                      {unread ? (
                        <button
                          type="button"
                          onClick={() => markOneRead(n.id)}
                          className="shrink-0 text-[11px] text-primary hover:underline"
                        >
                          Marquer lu
                        </button>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
