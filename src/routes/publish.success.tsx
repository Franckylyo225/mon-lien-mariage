import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useWedding } from "@/lib/wedding-store";
import { verifyPaystackPayment } from "@/lib/paystack.functions";

interface SearchParams {
  reference?: string;
  trxref?: string;
  wid?: string;
}

export const Route = createFileRoute("/publish/success")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    reference: typeof search.reference === "string" ? search.reference : undefined,
    trxref: typeof search.trxref === "string" ? search.trxref : undefined,
    wid: typeof search.wid === "string" ? search.wid : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Publication réussie — MonInvit.com" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SuccessPage,
});

type VerifyState =
  | { kind: "pending" }
  | { kind: "verifying" }
  | { kind: "success" }
  | { kind: "failed"; reason: string };

function SuccessPage() {
  const { couple } = useWedding();
  const search = Route.useSearch();
  const verify = useServerFn(verifyPaystackPayment);
  const [copied, setCopied] = useState(false);
  const reference = search.reference ?? search.trxref;
  const [state, setState] = useState<VerifyState>(
    reference ? { kind: "verifying" } : { kind: "pending" },
  );

  useEffect(() => {
    if (!reference) return;

    let cancelled = false;
    (async () => {
      try {
        let pending: { weddingId: string; slug: string; envelope: boolean } | null =
          null;
        try {
          const raw = sessionStorage.getItem("moninvit:pending-publish");
          if (raw) pending = JSON.parse(raw);
        } catch {
          /* noop */
        }
        const weddingId = pending?.weddingId ?? search.wid;
        if (!weddingId) {
          setState({ kind: "failed", reason: "Événement introuvable." });
          return;
        }
        const res = await verify({
          data: {
            reference,
            weddingId,
            slug: pending?.slug ?? couple.slug ?? "",
            envelopeAnimation: pending?.envelope ?? !!couple.hasEnvelopeAnimation,
          },
        });
        if (cancelled) return;
        if (res.success) {
          try {
            sessionStorage.removeItem("moninvit:pending-publish");
          } catch {
            /* noop */
          }
          setState({ kind: "success" });
        } else {
          setState({
            kind: "failed",
            reason: `Paiement ${res.status}. Aucun débit n'a été effectué en cas d'annulation.`,
          });
        }
      } catch (e) {
        if (cancelled) return;
        setState({
          kind: "failed",
          reason: e instanceof Error ? e.message : "Vérification impossible.",
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reference, search.wid, verify, couple.slug, couple.hasEnvelopeAnimation]);

  const publicUrl = useMemo(() => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "https://moninvit.com";
    return `${origin}/e/${couple.slug ?? ""}`;
  }, [couple.slug]);

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=8&data=${encodeURIComponent(publicUrl)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  };

  if (state.kind === "verifying") {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-60">
          Moneroo
        </p>
        <p className="mt-4 font-serif text-2xl italic">Vérification du paiement…</p>
        <p className="mt-3 text-sm opacity-70">Merci de patienter quelques instants.</p>
      </div>
    );
  }

  if (state.kind === "failed") {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <p className="font-serif text-2xl italic">Paiement non finalisé</p>
        <p className="mt-3 text-sm opacity-70">{state.reason}</p>
        <Link
          to="/publish"
          className="mt-6 inline-block rounded-full bg-primary px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-primary-foreground"
        >
          Réessayer la publication
        </Link>
      </div>
    );
  }

  if (state.kind === "pending" && !couple.isPublished) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <p className="font-serif text-2xl italic">Aucune publication en cours.</p>
        <Link
          to="/publish"
          className="mt-6 inline-block rounded-full bg-primary px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-primary-foreground"
        >
          Aller à la publication
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <main className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-8">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-primary/15 text-2xl">
          🎉
        </div>
        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
          C'est publié
        </p>
        <h1 className="mt-3 font-serif text-4xl italic">
          {couple.brideName} & {couple.groomName}
        </h1>
        <p className="mt-3 text-sm opacity-70">
          Votre page est en ligne. Partagez le lien ou le QR à vos invités.
        </p>

        <section className="mt-10 rounded-3xl border border-border bg-card p-6 text-left">
          <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest opacity-60">
            Lien public
          </label>
          <div className="flex gap-2">
            <input
              readOnly
              value={publicUrl}
              className="min-w-0 flex-1 rounded-full border border-input bg-background px-4 py-3 text-xs focus:outline-none"
            />
            <button
              onClick={copy}
              className="shrink-0 rounded-full bg-foreground px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-background transition hover:opacity-90"
            >
              {copied ? "Copié ✓" : "Copier"}
            </button>
          </div>

          <div className="mt-6 flex flex-col items-center gap-3">
            <img src={qrUrl} alt={`QR code pour ${publicUrl}`} className="size-44 rounded-lg ring-1 ring-border" />
            <a
              href={qrUrl}
              download={`qr-${couple.slug}.png`}
              className="font-mono text-[10px] uppercase tracking-widest text-primary hover:underline"
            >
              Télécharger le QR
            </a>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Vous êtes convié·e au mariage de ${couple.brideName} & ${couple.groomName} — voir l'invitation : ${publicUrl}`,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-primary px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest text-primary-foreground transition hover:opacity-90"
            >
              Partager sur WhatsApp
            </a>
            <Link
              to="/e/$slug"
              params={{ slug: couple.slug ?? "" }}
              className="rounded-full border border-border px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest transition hover:bg-accent/20"
            >
              Ouvrir la page publique
            </Link>
          </div>
        </section>

        <Link
          to="/dashboard"
          className="mt-8 inline-block font-mono text-[10px] uppercase tracking-widest opacity-60 hover:opacity-100"
        >
          ← Retour au tableau de bord
        </Link>
      </main>
    </div>
  );
}
