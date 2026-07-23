import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ArrowLeft, Loader2, MessageCircle, Plus, Send } from "lucide-react";
import {
  listMyTickets,
  getTicket,
  createTicket,
  replyToTicket,
  type SupportTicket,
  type SupportMessage,
} from "@/lib/support.functions";

export const Route = createFileRoute("/app/support")({
  head: () => ({
    meta: [
      { title: "Contacter le support — MonInvit.com" },
      { name: "description", content: "Ouvrez un ticket et échangez avec l'équipe MonInvit." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SupportPage,
});

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

const CATEGORIES = [
  { value: "general", label: "Question générale" },
  { value: "billing", label: "Paiement & facturation" },
  { value: "technical", label: "Problème technique" },
  { value: "account", label: "Compte & connexion" },
  { value: "feature", label: "Suggestion / autre" },
];

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

function SupportPage() {
  const listFn = useServerFn(listMyTickets);
  const getFn = useServerFn(getTicket);
  const createFn = useServerFn(createTicket);
  const replyFn = useServerFn(replyToTicket);

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ subject: "", category: "general", message: "" });
  const [creating, setCreating] = useState(false);

  const reload = useCallback(() => {
    setLoading(true);
    listFn()
      .then((r) => setTickets(r.tickets))
      .catch((e) => toast.error(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setLoading(false));
  }, [listFn]);

  useEffect(() => {
    reload();
  }, [reload]);

  const openTicket = useCallback(
    (id: string) => {
      setSelectedId(id);
      setMsgLoading(true);
      getFn({ data: { ticketId: id } })
        .then((r) => setMessages(r.messages))
        .catch((e) => toast.error(e instanceof Error ? e.message : "Erreur"))
        .finally(() => setMsgLoading(false));
    },
    [getFn],
  );

  const selected = useMemo(() => tickets.find((t) => t.id === selectedId) ?? null, [tickets, selectedId]);

  async function submitNew(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const r = await createFn({ data: form });
      toast.success("Ticket créé");
      setShowNew(false);
      setForm({ subject: "", category: "general", message: "" });
      reload();
      openTicket(r.ticket.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setCreating(false);
    }
  }

  async function submitReply(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId || !reply.trim()) return;
    setSending(true);
    try {
      await replyFn({ data: { ticketId: selectedId, body: reply } });
      setReply("");
      openTicket(selectedId);
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 pb-24">
      <div className="mb-5 flex items-center justify-between gap-3">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground">
          <ArrowLeft size={14} /> Retour
        </Link>
        <button
          onClick={() => setShowNew((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground"
        >
          <Plus size={14} /> Nouveau ticket
        </button>
      </div>

      <div className="mb-6">
        <h1 className="font-serif text-2xl">Contacter le support</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Notre équipe vous répond en général sous 24h ouvrées.
        </p>
      </div>

      {showNew && (
        <form onSubmit={submitNew} className="mb-6 space-y-3 rounded-2xl border border-border/70 bg-white p-4 shadow-sm">
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-widest text-muted-foreground">Sujet</label>
            <input
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              maxLength={140}
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[14px]"
              placeholder="Décrivez votre problème en quelques mots"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-widest text-muted-foreground">Catégorie</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[14px]"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-widest text-muted-foreground">Message</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={5}
              maxLength={5000}
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[14px]"
              placeholder="Décrivez précisément votre besoin, les étapes déjà tentées, l'appareil utilisé…"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowNew(false)} className="rounded-full border border-border bg-white px-4 py-2 text-[13px]">
              Annuler
            </button>
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground disabled:opacity-50"
            >
              {creating ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Envoyer
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4 md:grid-cols-[320px_1fr]">
        <div className="space-y-2">
          <h2 className="mb-2 text-[11px] uppercase tracking-widest text-muted-foreground">Mes tickets</h2>
          {loading ? (
            <p className="text-[13px] text-muted-foreground">Chargement…</p>
          ) : tickets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-6 text-center">
              <MessageCircle size={22} className="mx-auto mb-2 text-muted-foreground" />
              <p className="text-[13px] text-muted-foreground">Aucun ticket pour l'instant.</p>
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
                <p className="mt-1 text-[11px] text-muted-foreground">{fmt(t.last_message_at)}</p>
              </button>
            ))
          )}
        </div>

        <div className="rounded-2xl border border-border/70 bg-white">
          {!selected ? (
            <div className="grid h-full min-h-[240px] place-items-center p-6 text-center text-[13px] text-muted-foreground">
              Sélectionnez un ticket ou créez-en un nouveau.
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="border-b border-border/70 p-4">
                <p className="font-serif text-lg">{selected.subject}</p>
                <p className="mt-0.5 text-[11px] uppercase tracking-widest text-muted-foreground">
                  {STATUS_LABEL[selected.status]} · {selected.category}
                </p>
              </div>
              <div className="max-h-[420px] space-y-3 overflow-y-auto p-4">
                {msgLoading ? (
                  <p className="text-[13px] text-muted-foreground">Chargement…</p>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={
                        "max-w-[85%] rounded-2xl px-3.5 py-2 text-[13px] " +
                        (m.author_role === "admin"
                          ? "bg-primary/10 text-foreground"
                          : "ml-auto bg-secondary text-foreground")
                      }
                    >
                      <p className="mb-0.5 text-[10px] uppercase tracking-widest opacity-60">
                        {m.author_role === "admin" ? "Support MonInvit" : "Vous"} · {fmt(m.created_at)}
                      </p>
                      <p className="whitespace-pre-wrap">{m.body}</p>
                    </div>
                  ))
                )}
              </div>
              {selected.status !== "closed" && (
                <form onSubmit={submitReply} className="flex items-end gap-2 border-t border-border/70 p-3">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={2}
                    maxLength={5000}
                    placeholder="Votre message…"
                    className="flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-[13px]"
                  />
                  <button
                    type="submit"
                    disabled={sending || !reply.trim()}
                    className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-[13px] font-medium text-primary-foreground disabled:opacity-50"
                  >
                    {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
