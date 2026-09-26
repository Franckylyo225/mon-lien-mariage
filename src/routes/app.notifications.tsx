import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Bell, CheckCheck } from "lucide-react";
import { IconBadge, PageHeader } from "@/components/dashboard/premium";
import { Skeleton } from "@/components/ui/skeleton";
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

  const { items, unreadCount, loading, markAllRead, markOneRead } = useNotifications(userId);

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
            className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={16} />
            Tableau de bord
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <PageHeader
          title="Notifications"
          subtitle={
            unreadCount > 0
              ? `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`
              : "Tout est à jour"
          }
          actions={
            unreadCount > 0 ? (
              <button
                type="button"
                onClick={markAllRead}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm font-medium transition hover:bg-secondary/40"
              >
                <CheckCheck size={16} />
                Tout marquer comme lu
              </button>
            ) : null
          }
        />

        <div className="flex items-center gap-2">
          {(["all", "unread"] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={
                "rounded-full px-4 py-2 text-[13px] font-medium transition active:scale-95 " +
                (filter === f
                  ? "btn-accent-gradient"
                  : "border border-border bg-card text-muted-foreground hover:bg-secondary/40")
              }
            >
              {f === "all" ? "Toutes" : "Non lues"}
            </button>
          ))}
        </div>

        {!ready || loading ? (
          <ul className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="size-10 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-1/2" />
                    <Skeleton className="h-3 w-4/5" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-6 py-14 text-center">
            <IconBadge className="size-14">
              <Bell className="size-6" strokeWidth={1.75} />
            </IconBadge>
            <div>
              <p className="font-produit text-lg font-bold">
                {filter === "unread"
                  ? "Aucune notification non lue"
                  : "Aucune notification pour l'instant"}
              </p>
              <p className="mx-auto mt-1 max-w-xs text-[13px] text-muted-foreground">
                Les nouvelles réponses et messages de vos invités apparaîtront ici.
              </p>
            </div>
          </div>
        ) : (
          <ul className="space-y-3">
            {visible.map((n) => {
              const unread = !n.read_at;
              return (
                <li key={n.id}>
                  <div
                    className={
                      "rounded-2xl border p-4 shadow-sm transition " +
                      (unread ? "border-primary/30 bg-secondary/40" : "border-border bg-card")
                    }
                  >
                    <div className="flex items-start gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-background text-[16px] ring-1 ring-border">
                        {iconFor(n.type)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                            {labelFor(n.type)}
                          </span>
                          <span
                            className={
                              "rounded-full px-2.5 py-0.5 text-[11px] font-semibold " +
                              (unread
                                ? "bg-champagne-light text-champagne-deep"
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
                        <p className="mt-2 text-[12px] text-muted-foreground">
                          {formatDate(n.created_at)}
                        </p>
                      </div>
                      {unread ? (
                        <button
                          type="button"
                          onClick={() => markOneRead(n.id)}
                          className="shrink-0 text-[12px] font-medium text-primary hover:underline"
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
