import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, Send, MessageCircle } from "lucide-react";
import {
  adminListTickets,
  adminGetTicket,
  adminUpdateTicketStatus,
  replyToTicket,
  type SupportTicket,
  type SupportMessage,
} from "@/lib/support.functions";

export const Route = createFileRoute("/admin/support")({
  head: () => ({ meta: [{ title: "Support — Admin MonInvit" }, { name: "robots", content: "noindex" }] }),
  component: AdminSupportPage,
});

type Row = SupportTicket & { user_email: string | null; user_name: string | null };

const STATUS_LABEL: Record<string, string> = {
  open: "Ouvert",
  pending: "En attente",
  resolved: "Résolu",
  closed: "Fermé",
};
const STATUS_COLOR: Record<string, string> = {
  open: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  resolved: "bg-sky-100 text-sky-700",
  closed: "bg-neutral-200 text-neutral-600",
};

function fmt(iso: string) {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

function AdminSupportPage() {
  const listFn = useServerFn(adminListTickets);
  const getFn = useServerFn(adminGetTicket);
  const replyFn = useServerFn(replyToTicket);
  const statusFn = useServerFn(adminUpdateTicketStatus);

  const [filter, setFilter] = useState<string>("all");
  const [tickets, setTickets] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const reload = useCallback(() => {
    setLoading(true);
    listFn({ data: { status: filter } })
      .then((r) => setTickets(r.tickets as Row[]))
      .catch((e) => toast.error(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setLoading(false));
  }, [listFn, filter]);

  useEffect(() => {
    reload();
  }, [reload]);

  const openTicket = useCallback(
    (id: string) => {
      setSelectedId(id);
      getFn({ data: { ticketId: id } })
        .then((r) => {
          setMessages(r.messages);
          setProfile(r.profile);
        })
        .catch((e) => toast.error(e instanceof Error ? e.message : "Erreur"));
    },
    [getFn],
  );

  const selected = useMemo(() => tickets.find((t) => t.id === selectedId) ?? null, [tickets, selectedId]);

  async function submitReply(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId || !reply.trim()) return;
    setSending(true);
    try {
      await replyFn({ data: { ticketId: selectedId, body: reply } });
      setReply("");
      openTicket(selectedId);
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSending(false);
    }
  }

  async function changeStatus(status: string) {
    if (!selectedId) return;
    try {
      await statusFn({ data: { ticketId: selectedId, status } });
      toast.success("Statut mis à jour");
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    }
  }

  const counts = useMemo(() => {
    const c = { all: tickets.length, open: 0, pending: 0, resolved: 0, closed: 0 };
    for (const t of tickets) (c as any)[t.status]++;
    return c;
  }, [tickets]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl">Support & Tickets</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">Gérez les demandes des utilisateurs.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "open", "pending", "resolved", "closed"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={
              "rounded-full border px-3 py-1 text-[12px] " +
              (filter === s ? "border-primary bg-primary text-primary-foreground" : "border-border bg-white")
            }
          >
            {s === "all" ? "Tous" : STATUS_LABEL[s]} ({(counts as any)[s] ?? 0})
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className="space-y-2">
          {loading ? (
            <p className="text-[13px] text-muted-foreground">Chargement…</p>
          ) : tickets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-6 text-center">
              <MessageCircle size={22} className="mx-auto mb-2 text-muted-foreground" />
              <p className="text-[13px] text-muted-foreground">Aucun ticket.</p>
            </div>
          ) : (
            tickets.map((t) => (
              <button
                key={t.id}
                onClick={() => openTicket(t.id)}
                className={
                  "w-full rounded-xl border p-3 text-left transition " +
                  (selectedId === t.id ? "border-primary bg-primary/5" : "border-border bg-white hover:bg-secondary/40")
                }
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="line-clamp-1 text-[13px] font-medium">{t.subject}</p>
                  <span className={"shrink-0 rounded-full px-2 py-0.5 text-[10px] " + (STATUS_COLOR[t.status] ?? "")}>
                    {STATUS_LABEL[t.status] ?? t.status}
                  </span>
                </div>
                <p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">
                  {t.user_name || t.user_email || t.user_id.slice(0, 8)} · {fmt(t.last_message_at)}
                </p>
              </button>
            ))
          )}
        </div>

        <div className="rounded-2xl border border-border/70 bg-white">
          {!selected ? (
            <div className="grid h-full min-h-[280px] place-items-center p-6 text-center text-[13px] text-muted-foreground">
              Sélectionnez un ticket pour l'ouvrir.
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/70 p-4">
                <div>
                  <p className="font-serif text-lg">{selected.subject}</p>
                  <p className="mt-0.5 text-[11px] uppercase tracking-widest text-muted-foreground">
                    {selected.category} · {profile?.email ?? "—"}
                  </p>
                </div>
                <select
                  value={selected.status}
                  onChange={(e) => changeStatus(e.target.value)}
                  className="rounded-lg border border-border bg-white px-2 py-1 text-[12px]"
                >
                  {Object.entries(STATUS_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="max-h-[480px] space-y-3 overflow-y-auto p-4">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={
                      "max-w-[85%] rounded-2xl px-3.5 py-2 text-[13px] " +
                      (m.author_role === "admin"
                        ? "ml-auto bg-primary/10 text-foreground"
                        : "bg-secondary text-foreground")
                    }
                  >
                    <p className="mb-0.5 text-[10px] uppercase tracking-widest opacity-60">
                      {m.author_role === "admin" ? "Support" : "Client"} · {fmt(m.created_at)}
                    </p>
                    <p className="whitespace-pre-wrap">{m.body}</p>
                  </div>
                ))}
              </div>
              <form onSubmit={submitReply} className="flex items-end gap-2 border-t border-border/70 p-3">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={2}
                  maxLength={5000}
                  placeholder="Répondre au client…"
                  className="flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-[13px]"
                />
                <button
                  type="submit"
                  disabled={sending || !reply.trim()}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-[13px] font-medium text-primary-foreground disabled:opacity-50"
                >
                  {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Envoyer
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
