import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  Link2,
  Check,
  Globe,
  QrCode,
  Users,
  CalendarHeart,
  BookHeart,
  Lock,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useWedding, slugify } from "@/lib/wedding-store";
import { initPaystackPayment, applyPromoCode } from "@/lib/paystack.functions";
import { useNavigate } from "@tanstack/react-router";
import { Tag } from "lucide-react";

export const Route = createFileRoute("/publish")({
  head: () => ({
    meta: [
      { title: "Publier mon invitation — MonInvit.com" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PublishPage,
});

const BASE_PRICE_XOF = 24900;
const GUESTBOOK_ADDON_XOF = 1990;

function formatFrenchDate(iso: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

function PublishPage() {
  const { couple, weddingId, loading } = useWedding();
  const initPayment = useServerFn(initPaystackPayment);
  const submitPromo = useServerFn(applyPromoCode);
  const navigate = useNavigate();
  const [payLoading, setPayLoading] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [includeGuestbook, setIncludeGuestbook] = useState(false);

  const slug = useMemo(
    () =>
      couple.slug || slugify(`${couple.brideName}-et-${couple.groomName}`) || "",
    [couple.slug, couple.brideName, couple.groomName],
  );

  const dateLabel = formatFrenchDate(couple.weddingDate);
  const subLine = [dateLabel, couple.city].filter(Boolean).join(" · ");
  const total = BASE_PRICE_XOF + (includeGuestbook ? GUESTBOOK_ADDON_XOF : 0);
  const alreadyPublished = couple.isPublished === true;

  const handlePay = async () => {
    if (!weddingId) {
      toast.error("Aucun événement actif. Rechargez la page.");
      return;
    }
    setPayLoading(true);
    try {
      const { checkoutUrl } = await initPayment({
        data: {
          weddingId,
          slug,
          envelopeAnimation: false,
          includeGuestbook,
          amount: total,
          brideName: couple.brideName,
          groomName: couple.groomName,
        },
      });
      try {
        sessionStorage.setItem(
          "moninvit:pending-publish",
          JSON.stringify({ weddingId, slug, envelope: false, guestbook: includeGuestbook }),
        );
      } catch {
        /* noop */
      }
      window.location.href = checkoutUrl;
    } catch (e) {
      console.error(e);
      toast.error(
        e instanceof Error
          ? e.message
          : "Le paiement n'a pas abouti. Réessayez.",
      );
      setPayLoading(false);
    }
  };

  const handlePromo = async () => {
    if (!weddingId) {
      toast.error("Aucun événement actif. Rechargez la page.");
      return;
    }
    const code = promoCode.trim().toUpperCase();
    if (!code) {
      toast.error("Veuillez saisir un code promo.");
      return;
    }
    setPromoLoading(true);
    try {
      const res = await submitPromo({
        data: { weddingId, slug, code, includeGuestbook },
      });
      if (res.published) {
        toast.success("Code appliqué — votre invitation est publiée !");
        navigate({ to: "/publish/success", search: { wid: weddingId } });
      } else {
        toast.success(`Remise de ${res.discount}% appliquée.`);
      }
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Code promo invalide.",
      );
    } finally {
      setPromoLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-40">
          Chargement…
        </p>
      </div>
    );
  }

  if (alreadyPublished) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="border-b border-border/60">
          <div className="mx-auto flex max-w-xl items-center justify-between px-[14px] py-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground transition hover:text-foreground"
            >
              <ArrowLeft className="size-3" strokeWidth={1.75} />
              Retour au tableau
            </Link>
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground/70">
              Publié
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-xl px-[14px] pt-14 pb-16 text-center">
          <span
            className="mx-auto grid size-14 place-items-center rounded-full"
            style={{ background: "#ecfdf5", color: "#047857" }}
          >
            <Check className="size-6" strokeWidth={2} />
          </span>
          <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.1em] text-primary">
            Événement en ligne
          </p>
          <h1 className="mt-2 font-serif text-[24px] italic leading-tight">
            Cet événement est déjà publié
          </h1>
          <p className="mt-3 text-[12px] leading-[1.6] text-muted-foreground">
            Le paiement pour <span className="italic">{couple.brideName || "…"} &amp; {couple.groomName || "…"}</span> a
            été effectué. Votre page est accessible via :
          </p>
          {slug ? (
            <div className="mx-auto mt-4 inline-flex max-w-full items-center gap-2 rounded-[10px] bg-muted px-3 py-2">
              <Link2 className="size-3.5 shrink-0" style={{ color: "#993556" }} strokeWidth={1.75} />
              <span className="truncate text-[12px] font-medium">
                <span className="text-foreground">moninvit.com/e/</span>
                <span style={{ color: "#993556" }}>{slug}</span>
              </span>
            </div>
          ) : null}
          <div className="mt-8 flex flex-col gap-2">
            <Link
              to="/dashboard/share"
              className="inline-flex w-full items-center justify-center gap-2 rounded-[14px] px-4 py-3.5 text-[14px] font-medium transition"
              style={{ background: "#4B1528", color: "#FBEAF0" }}
            >
              Partager mon invitation
            </Link>
            <Link
              to="/dashboard/billing"
              className="inline-flex w-full items-center justify-center gap-2 rounded-[14px] border border-border/60 bg-card px-4 py-3.5 text-[14px] font-medium transition"
            >
              Voir ma facture
            </Link>
          </div>
          <p className="mt-6 text-[10px] leading-[1.5] text-muted-foreground/70">
            Pour publier un autre événement, créez-le depuis « Mes événements ».
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* 1. Nav */}
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-xl items-center justify-between px-[14px] py-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="size-3" strokeWidth={1.75} />
            Retour au tableau
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground/70">
            Publication
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-[14px] pb-16 pt-10">
        {/* 2. Hero */}
        <section className="mb-6 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-primary">
            Dernière étape
          </p>
          <div className="mt-4 flex flex-col items-center leading-tight">
            <span className="font-serif text-[28px] italic">
              {couple.brideName || "—"}
            </span>
            <span className="my-0.5 font-serif text-[16px] italic text-primary">
              &amp;
            </span>
            <span className="font-serif text-[28px] italic">
              {couple.groomName || "—"}
            </span>
          </div>
          {subLine ? (
            <p className="mt-3 text-[12px] capitalize text-muted-foreground">
              {subLine}
            </p>
          ) : null}
          <div
            className="mx-auto my-3 h-px w-8 bg-primary"
            style={{ opacity: 0.4 }}
          />
          <p className="text-[12px] leading-[1.5] text-muted-foreground">
            Votre page est prête.
            <br />
            Publiez-la pour la partager avec vos invités.
          </p>
        </section>

        {/* 3. Carte URL */}
        <div className="mb-4 flex items-center gap-3 rounded-[10px] bg-muted px-[14px] py-2.5">
          <div
            className="grid size-7 shrink-0 place-items-center rounded-md"
            style={{ background: "#FBEAF0" }}
          >
            <Link2 className="size-3.5" style={{ color: "#993556" }} strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[9px] uppercase tracking-[0.06em] text-muted-foreground/70">
              Votre adresse
            </p>
            <p className="truncate text-[12px] font-medium">
              <span className="text-foreground">moninvit.com/e/</span>
              <span style={{ color: "#993556" }}>{slug}</span>
            </p>
          </div>
          <Check className="size-3.5 shrink-0" style={{ color: "#059669" }} strokeWidth={2} />
        </div>

        {/* 4. Carte formule */}
        <section className="mb-3 rounded-[14px] border border-border/60 bg-card p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground/70">
                Formule
              </p>
              <p className="mt-1 font-serif text-[18px] italic">
                Publication complète
              </p>
            </div>
            <div className="text-right">
              <p className="font-serif text-[26px] italic leading-none">
                {BASE_PRICE_XOF.toLocaleString("fr-FR")}
                <span className="ml-1 font-sans text-[11px] font-normal not-italic text-muted-foreground">
                  XOF
                </span>
              </p>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.06em] text-muted-foreground/70">
                Paiement unique
              </p>
            </div>
          </div>

          <div className="my-3.5 border-t border-border/60" />

          <ul className="space-y-0">
            {INCLUDED.map((it) => (
              <li key={it.name} className="flex items-start gap-2.5 py-1.5">
                <span
                  className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full"
                  style={{ background: "#FBEAF0" }}
                >
                  <it.Icon
                    className="size-[11px]"
                    style={{ color: "#993556" }}
                    strokeWidth={1.75}
                  />
                </span>
                <div className="min-w-0">
                  <p className="text-[12px] font-medium leading-tight">
                    {it.name}
                  </p>
                  <p className="text-[10px] leading-[1.4] text-muted-foreground">
                    {it.desc}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-1 flex items-baseline justify-between border-t border-border/60 pt-3">
            <span className="text-[13px] font-medium">Total</span>
            <span className="font-serif text-[22px] italic leading-none">
              {total.toLocaleString("fr-FR")}
              <span className="ml-1 font-sans text-[11px] font-normal not-italic text-muted-foreground">
                XOF
              </span>
            </span>
          </div>
        </section>

        {/* 5. Bouton — Paiement temporairement indisponible */}
        <div className="mb-2.5">
          <button
            type="button"
            disabled
            aria-disabled="true"
            title="Le paiement en ligne est temporairement indisponible"
            className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-[14px] border border-border/60 bg-muted px-4 py-4 text-[15px] font-medium text-muted-foreground"
          >
            <Lock className="size-4" strokeWidth={1.75} />
            Paiement bientôt disponible
          </button>

          <p className="mt-2 text-center text-[11px] leading-[1.5] text-muted-foreground">
            Le paiement en ligne est en cours de configuration.
            <br />
            En attendant, utilisez un code promo pour publier votre invitation.
          </p>
        </div>

        {/* 5b. Code promo */}
        <div className="mb-2">
          {!promoOpen ? (
            <button
              type="button"
              onClick={() => setPromoOpen(true)}
              className="mx-auto flex items-center gap-1.5 text-[12px] text-muted-foreground underline underline-offset-2 transition hover:text-foreground"
            >
              <Tag className="size-3.5" strokeWidth={1.75} />
              J'ai un code promo
            </button>
          ) : (
            <div className="rounded-[12px] border border-border/60 bg-card p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground/70">
                  Code promo
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setPromoOpen(false);
                    setPromoCode("");
                  }}
                  className="text-[10px] text-muted-foreground underline underline-offset-2"
                >
                  Fermer
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !promoLoading) handlePromo();
                  }}
                  placeholder="Ex : TIANA100"
                  className="flex-1 rounded-[10px] border border-border/60 bg-background px-3 py-2.5 font-mono text-[12px] uppercase tracking-wider outline-none focus:ring-2 focus:ring-primary/40"
                  spellCheck={false}
                  autoCapitalize="characters"
                  autoCorrect="off"
                  maxLength={24}
                />
                <button
                  type="button"
                  onClick={handlePromo}
                  disabled={promoLoading || !promoCode.trim() || !weddingId}
                  className="inline-flex items-center justify-center gap-1.5 rounded-[10px] px-4 text-[12px] font-medium transition disabled:opacity-60"
                  style={{ background: "#4B1528", color: "#FBEAF0" }}
                >
                  {promoLoading ? (
                    <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
                  ) : (
                    "Appliquer"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="mt-3.5 text-center text-[10px] leading-[1.5] text-muted-foreground/70">
          Après publication, vous pouvez toujours modifier
          <br />
          vos étapes et gérer vos invités.
        </p>
      </main>
    </div>
  );
}

const INCLUDED = [
  {
    Icon: Globe,
    name: "Page publique et partageable",
    desc: "Lien personnalisé à envoyer par WhatsApp",
  },
  {
    Icon: QrCode,
    name: "QR code à imprimer",
    desc: "Pour les cartons d'invitation et l'entrée le jour J",
  },
  {
    Icon: Users,
    name: "RSVP illimités",
    desc: "Confirmations, gestion des invités, relances",
  },
  {
    Icon: CalendarHeart,
    name: "Toutes vos étapes",
    desc: "Dot, civil, religieux, réception…",
  },
  {
    Icon: BookHeart,
    name: "Livre d'or après le mariage",
    desc: "Photos et messages de vos invités en souvenir",
  },
];
