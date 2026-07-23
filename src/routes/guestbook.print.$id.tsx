import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Printer } from "lucide-react";
import { useWedding } from "@/lib/wedding-store";
import { listOwnGuestbook } from "@/lib/guestbook.functions";

export const Route = createFileRoute("/guestbook/print/$id")({
  head: () => ({
    meta: [
      { title: "Livre d'or — PDF souvenir" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PrintPage,
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
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

function PrintPage() {
  const { id } = Route.useParams();
  const listFn = useServerFn(listOwnGuestbook);
  const { couple } = useWedding();
  const [messages, setMessages] = useState<Message[] | null>(null);

  useEffect(() => {
    listFn({ data: { weddingId: id } })
      .then((r) => setMessages(r.messages as Message[]))
      .catch(() => setMessages([]));
  }, [id, listFn]);

  useEffect(() => {
    if (messages && messages.length >= 0) {
      const t = setTimeout(() => window.print(), 400);
      return () => clearTimeout(t);
    }
  }, [messages]);

  if (!messages) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="size-5 animate-spin opacity-50" />
      </div>
    );
  }

  const names =
    couple.brideName && couple.groomName
      ? `${couple.brideName} & ${couple.groomName}`
      : "Livre d'or";

  return (
    <div className="mx-auto max-w-2xl bg-white px-8 py-12 text-black print:max-w-none print:px-0">
      <style>{`
        @media print {
          @page { size: A4; margin: 18mm; }
          .no-print { display: none !important; }
          body { background: white; }
        }
      `}</style>

      <div className="no-print mb-6 flex justify-end">
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-[12px] font-medium text-white"
        >
          <Printer className="size-3.5" />
          Imprimer / PDF
        </button>
      </div>

      <header className="text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-60">
          Livre d'or
        </p>
        <h1 className="mt-3 font-serif text-3xl italic">{names}</h1>
        <div className="mx-auto mt-4 h-px w-16 bg-black/40" />
        <p className="mt-4 text-[11px] opacity-60">
          {messages.length} message{messages.length > 1 ? "s" : ""} reçu
          {messages.length > 1 ? "s" : ""}
        </p>
      </header>

      <ul className="mt-10 space-y-6">
        {messages.map((m) => (
          <li
            key={m.id}
            className="break-inside-avoid border-b border-black/10 pb-5"
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-serif text-[16px] italic">{m.author_name}</p>
              <span className="text-[10px] uppercase tracking-wider opacity-50">
                {formatDate(m.created_at)}
              </span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-[13px] leading-relaxed">
              {m.message}
            </p>
          </li>
        ))}
        {messages.length === 0 ? (
          <li className="text-center text-sm opacity-60">
            Aucun message pour le moment.
          </li>
        ) : null}
      </ul>

      <footer className="mt-16 text-center text-[10px] uppercase tracking-widest opacity-40">
        MonInvit.com
      </footer>
    </div>
  );
}
