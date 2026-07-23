import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ArrowLeft, Trash2, Printer, Loader2, BookHeart } from "lucide-react";
import { useWedding } from "@/lib/wedding-store";
import {
  listOwnGuestbook,
  deleteGuestbookMessage,
} from "@/lib/guestbook.functions";

export const Route = createFileRoute("/app/guestbook")({
  head: () => ({
    meta: [
      { title: "Livre d'or — MonInvit.com" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OwnerGuestbookPage,
});

interface Message {
  id: string;
  author_name: string;
  message: string;
  created_at: string;
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

function OwnerGuestbookPage() {
  const { weddingId, couple, loading } = useWedding();
  const listFn = useServerFn(listOwnGuestbook);
  const delFn = useServerFn(deleteGuestbookMessage);
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!weddingId) return;
    setBusy(true);
    listFn({ data: { weddingId } })
      .then((r) => setMessages(r.messages as Message[]))
      .catch((e) => toast.error(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setBusy(false));
  }, [weddingId, listFn]);

  const onDelete = async (id: string) => {
    if (!confirm("Supprimer ce message ?")) return;
    try {
      await delFn({ data: { id } });
      setMessages((prev) => prev.filter((m) => m.id !== id));
      toast.success("Message supprimé.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Suppression impossible.");
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="size-5 animate-spin opacity-50" />
      </div>
    );
  }

  const hasGuestbook = couple.hasGuestbook === true;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Tableau de bord
          </Link>
          {hasGuestbook && weddingId ? (
            <Link
              to="/guestbook/print/$id"
              params={{ id: weddingId }}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-[11px] font-medium text-primary-foreground"
            >
              <Printer className="size-3.5" />
              PDF souvenir
            </Link>
          ) : null}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-secondary text-primary">
            <BookHeart className="size-5" strokeWidth={1.5} />
          </span>
          <div>
            <h1 className="font-serif text-2xl italic">Livre d'or</h1>
            <p className="text-[12px] text-muted-foreground">
              {messages.length} message{messages.length > 1 ? "s" : ""} reçu
              {messages.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {!hasGuestbook ? (
          <div className="rounded-2xl border border-dashed border-border/70 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Le livre d'or n'est pas activé pour cet événement.
            </p>
            <Link
              to="/publish"
              className="mt-4 inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-[12px] font-medium text-primary-foreground"
            >
              Activer le livre d'or
            </Link>
          </div>
        ) : busy ? (
          <div className="grid place-items-center py-16">
            <Loader2 className="size-5 animate-spin opacity-50" />
          </div>
        ) : messages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 py-16 text-center text-sm text-muted-foreground">
            Aucun message pour le moment.
          </div>
        ) : (
          <ul className="space-y-3">
            {messages.map((m) => (
              <li
                key={m.id}
                className="rounded-xl border border-border/60 bg-card p-4"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-serif text-[15px] italic">
                    {m.author_name}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {formatDate(m.created_at)}
                    </span>
                    <button
                      onClick={() => onDelete(m.id)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Supprimer"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed">
                  {m.message}
                </p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
