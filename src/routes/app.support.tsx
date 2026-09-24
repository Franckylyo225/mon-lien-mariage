import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ArrowLeft, Loader2, MessageCircle, Plus, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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

const WHATSAPP_BUSINESS_NUMBER = "2250718525502";

function whatsappSupportUrl(userEmail?: string | null) {
  const message = userEmail
    ? `Bonjour, j'ai besoin d'aide sur MonInvit (compte : ${userEmail}).`
    : "Bonjour, j'ai besoin d'aide sur MonInvit.";
  return `https://wa.me/${WHATSAPP_BUSINESS_NUMBER}?text=${encodeURIComponent(message)}`;
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

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
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
  }, []);

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

  // Mark all support_reply notifications as read when opening the support page
  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("user_id", u.user.id)
        .eq("type", "support_reply")
        .is("read_at", null);
    })();
  }, []);

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
    const subject = form.subject.trim();
    const message = form.message.trim();
    if (subject.length < 3) {
      toast.error("Le sujet doit contenir au moins 3 caractères.");
      return;
    }
    if (message.length < 5) {
      toast.error("Le message doit contenir au moins 5 caractères.");
      return;
    }
    setCreating(true);
    try {
      const r = await createFn({ data: { ...form, subject, message } });
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

      <a
        href={whatsappSupportUrl(userEmail)}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-6 flex items-center gap-3 rounded-2xl border border-[#25D366]/40 bg-[#25D366]/10 p-4 transition hover:bg-[#25D366]/15"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#25D366] text-white">
          <WhatsAppIcon className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-medium text-foreground">Discuter sur WhatsApp</span>
          <span className="block text-[12px] text-muted-foreground">
            Une question urgente ? Écrivez-nous directement sur notre WhatsApp Business.
          </span>
        </span>
        <Send size={16} className="shrink-0 text-[#25D366]" aria-hidden="true" />
      </a>

      {showNew && (
        <form onSubmit={submitNew} className="mb-6 space-y-3 rounded-2xl border border-border/70 bg-white p-4 shadow-sm">
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-widest text-muted-foreground">Sujet</label>
            <input
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              minLength={3}
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
              minLength={5}
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
