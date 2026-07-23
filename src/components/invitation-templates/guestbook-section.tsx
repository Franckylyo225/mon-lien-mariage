import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { BookHeart, Send, Loader2 } from "lucide-react";
import {
  listPublicGuestbook,
  submitGuestbookMessage,
} from "@/lib/guestbook.functions";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  author_name: string;
  message: string;
  created_at: string;
}

interface Props {
  weddingId: string;
  title?: string;
  subtitle?: string;
}

function formatDate(iso: string): string {
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

export function GuestbookSection({ weddingId, title, subtitle }: Props) {
  const listFn = useServerFn(listPublicGuestbook);
  const submitFn = useServerFn(submitGuestbookMessage);
  const [messages, setMessages] = useState<Message[]>([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listFn({ data: { weddingId } })
      .then((r) => {
        if (!cancelled) setMessages(r.messages as Message[]);
      })
      .catch(() => {
        /* noop */
      });

    const channel = supabase
      .channel(`guestbook:${weddingId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "guestbook_messages",
          filter: `wedding_id=eq.${weddingId}`,
        },
        (payload) => {
          const m = payload.new as Message;
          setMessages((prev) =>
            prev.some((x) => x.id === m.id) ? prev : [m, ...prev],
          );
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [weddingId, listFn]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const authorName = name.trim();
    const message = text.trim();
    if (!authorName || !message) {
      toast.error("Merci d'indiquer votre nom et un message.");
      return;
    }
    setLoading(true);
    try {
      await submitFn({ data: { weddingId, authorName, message } });
      setText("");
      toast.success("Merci pour votre message !");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Envoi impossible.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-2xl px-5 py-16" id="livre-dor">
      <div className="text-center">
        <BookHeart
          className="mx-auto size-6"
          style={{ color: "var(--wedding-accent)" }}
          strokeWidth={1.5}
        />
        <h2 className="mt-3 font-serif text-3xl italic">
          {title || "Livre d'or"}
        </h2>
        {subtitle ? (
          <p className="mt-2 text-sm opacity-70">{subtitle}</p>
        ) : (
          <p className="mt-2 text-sm opacity-70">
            Laissez un mot doux, une bénédiction, un souvenir…
          </p>
        )}
      </div>

      <form
        onSubmit={submit}
        className="mt-8 rounded-2xl border border-current/10 bg-current/[0.03] p-4"
      >
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Votre nom"
          maxLength={80}
          className="w-full rounded-lg border border-current/20 bg-transparent px-3 py-2.5 text-[14px] outline-none focus:border-current/40"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Votre message pour les mariés…"
          maxLength={600}
          rows={4}
          className="mt-2 w-full resize-none rounded-lg border border-current/20 bg-transparent px-3 py-2.5 text-[14px] outline-none focus:border-current/40"
        />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[11px] opacity-60">{text.length}/600</span>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium transition disabled:opacity-60"
            style={{
              background: "var(--wedding-accent)",
              color: "var(--wedding-accent-fg, #fff)",
            }}
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" strokeWidth={1.75} />
            )}
            Envoyer
          </button>
        </div>
      </form>

      <ul className="mt-8 space-y-4">
        {messages.length === 0 ? (
          <li className="rounded-xl border border-dashed border-current/20 py-8 text-center text-sm opacity-60">
            Soyez le premier à laisser un message.
          </li>
        ) : (
          messages.map((m) => (
            <li
              key={m.id}
              className="rounded-xl border border-current/10 bg-current/[0.02] p-4"
            >
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-serif text-[15px] italic">{m.author_name}</p>
                <span className="text-[10px] uppercase tracking-wider opacity-50">
                  {formatDate(m.created_at)}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed opacity-90">
                {m.message}
              </p>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
