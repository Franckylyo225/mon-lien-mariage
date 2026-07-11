import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useWedding, slugify } from "@/lib/wedding-store";
import { EnvelopeAnimation } from "@/components/envelope-animation";
import { initMonerooPayment } from "@/lib/moneroo.functions";

export const Route = createFileRoute("/publish")({
  head: () => ({
    meta: [
      { title: "Publier mon invitation — MonInvit.com" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PublishPage,
});

const BASE_PRICE_XOF = 15000;
const ADDON_PRICE_XOF = 3000;

function PublishPage() {
  const { couple, weddingId } = useWedding();
  const navigate = useNavigate();
  const initPayment = useServerFn(initMonerooPayment);
  const [envelope, setEnvelope] = useState<boolean>(couple.hasEnvelopeAnimation ?? false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [slug, setSlug] = useState(
    couple.slug || slugify(`${couple.brideName}-et-${couple.groomName}`),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = BASE_PRICE_XOF + (envelope ? ADDON_PRICE_XOF : 0);

  const handlePay = async () => {
    if (!weddingId) {
      setError("Aucun événement actif. Rechargez la page.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { checkoutUrl } = await initPayment({
        data: {
          weddingId,
          slug,
          envelopeAnimation: envelope,
          amount: total,
          brideName: couple.brideName,
          groomName: couple.groomName,
        },
      });
      // Persist selection so the return page can finalize even if metadata is lost.
      try {
        sessionStorage.setItem(
          "moninvit:pending-publish",
          JSON.stringify({ weddingId, slug, envelope }),
        );
      } catch {
        /* noop */
      }
      window.location.href = checkoutUrl;
    } catch (e) {
      console.error(e);
      setError(
        e instanceof Error
          ? e.message
          : "Impossible d'initialiser le paiement. Réessayez.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-8">
          <Link to="/dashboard" className="font-serif text-sm italic">
            ← Retour au tableau
          </Link>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-50">
            Publication
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
          Dernière étape
        </p>
        <h1 className="mt-2 font-serif text-4xl italic">Publier votre invitation</h1>
        <p className="mt-3 max-w-xl text-sm opacity-70">
          Une fois publiée, votre page devient accessible via son lien public
          et les prénoms du couple sont verrouillés. Vous pourrez toujours
          modifier les étapes et gérer vos invités.
        </p>

        <section className="mt-8 overflow-hidden rounded-3xl border border-border bg-card">
          <div className="border-b border-border bg-primary/5 p-6">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest opacity-60">
                  Formule
                </p>
                <p className="mt-1 font-serif text-2xl italic">Publication complète</p>
              </div>
              <p className="font-serif text-3xl italic">
                {BASE_PRICE_XOF.toLocaleString("fr-FR")}
                <span className="ml-1 font-mono text-xs opacity-60">XOF</span>
              </p>
            </div>
            <ul className="mt-4 space-y-1.5 text-sm">
              <li className="flex gap-2"><span className="text-primary">✓</span> Page d'invitation publique et partageable</li>
              <li className="flex gap-2"><span className="text-primary">✓</span> Lien personnalisé + QR code</li>
              <li className="flex gap-2"><span className="text-primary">✓</span> RSVP illimités et gestion des invités</li>
              <li className="flex gap-2"><span className="text-primary">✓</span> Toutes vos étapes (dot, civil, religieux, dîner…)</li>
            </ul>
          </div>

          <div className="p-6">
            <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-border p-4 transition hover:border-primary/50">
              <input
                type="checkbox"
                checked={envelope}
                onChange={(e) => setEnvelope(e.target.checked)}
                className="mt-1 size-5 accent-[color:var(--color-primary)]"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-serif text-lg italic">Animation d'enveloppe</p>
                  <p className="font-mono text-sm">
                    +{ADDON_PRICE_XOF.toLocaleString("fr-FR")}
                    <span className="ml-1 text-[10px] opacity-60">XOF</span>
                  </p>
                </div>
                <p className="mt-1 text-xs opacity-70">
                  Une enveloppe s'ouvre en 3 secondes à l'arrivée de chaque
                  invité, avec vos prénoms au centre. Effet garanti.
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setPreviewOpen(true);
                  }}
                  className="mt-2 font-mono text-[10px] uppercase tracking-widest text-primary hover:underline"
                >
                  ▶ Voir un aperçu
                </button>
              </div>
            </label>
          </div>

          <div className="border-t border-border p-6">
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest opacity-60">
              Adresse de votre page
            </label>
            <div className="flex items-center rounded-full border border-input bg-background px-4 py-2 text-sm">
              <span className="opacity-50">moninvit.com/e/</span>
              <input
                value={slug}
                onChange={(e) =>
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                }
                className="min-w-0 flex-1 bg-transparent px-1 focus:outline-none"
              />
            </div>
          </div>

          <div className="border-t border-border bg-secondary/30 p-6">
            <div className="flex items-baseline justify-between">
              <p className="text-sm">Total</p>
              <p className="font-serif text-3xl italic">
                {total.toLocaleString("fr-FR")}
                <span className="ml-1 font-mono text-xs opacity-60">XOF</span>
              </p>
            </div>
            {error ? (
              <p className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive">
                {error}
              </p>
            ) : null}
            <button
              onClick={handlePay}
              disabled={loading || !slug || !weddingId}
              className="mt-5 w-full rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Redirection vers Moneroo…" : "Payer et publier"}
            </button>
            <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-widest opacity-50">
              Paiement sécurisé — Moneroo (Orange Money, MTN, Moov, Wave, Carte)
            </p>
          </div>
        </section>

        {/* fallback nav to keep type check happy */}
        <button
          type="button"
          onClick={() => navigate({ to: "/dashboard" })}
          className="sr-only"
        >
          retour
        </button>
      </main>

      {previewOpen ? (
        <EnvelopeAnimation
          brideName={couple.brideName}
          groomName={couple.groomName}
          onDone={() => setPreviewOpen(false)}
        />
      ) : null}
    </div>
  );
}
