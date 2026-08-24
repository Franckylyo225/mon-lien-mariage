import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
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
  Loader2,
  Tag,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { redirectToCheckout } from "@/lib/checkout-redirect";
import { useWedding, slugify } from "@/lib/wedding-store";
import { validatePromoCode, publishWithPromo } from "@/lib/promo.functions";
import { initializePaystackPayment } from "@/lib/paystack.functions";
import { checkSlugAvailability } from "@/lib/public-wedding.functions";
import { useNavigate } from "@tanstack/react-router";


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
  const { couple, weddingId, loading, updateCouple } = useWedding();
  const validatePromo = useServerFn(validatePromoCode);
  const publishFn = useServerFn(publishWithPromo);
  const checkSlug = useServerFn(checkSlugAvailability);
  const payFn = useServerFn(initializePaystackPayment);
  const navigate = useNavigate();
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [includeGuestbook, setIncludeGuestbook] = useState(false);

  const baseSlug = useMemo(
    () =>
      couple.slug || slugify(`${couple.brideName}-et-${couple.groomName}`) || "",
    [couple.slug, couple.brideName, couple.groomName],
  );

  // Slug availability state
  type SlugStatus = "idle" | "checking" | "available" | "taken" | "invalid";
  const [slug, setSlug] = useState(baseSlug);
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
  const [suggestion, setSuggestion] = useState<string>("");
  const [customOpen, setCustomOpen] = useState(false);
  const [customSlug, setCustomSlug] = useState("");
  const [hasPicked, setHasPicked] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync slug when store slug changes (e.g. after initial load)
  useEffect(() => {
    setSlug(baseSlug);
  }, [baseSlug]);

  const runCheck = async (candidate: string): Promise<SlugStatus> => {
    const s = candidate.trim().toLowerCase();
    if (!/^[a-z0-9][a-z0-9-]{1,59}$/.test(s)) return "invalid";
    try {
      const res = await checkSlug({ data: { slug: s, excludeId: weddingId ?? undefined } });
      return res.available ? "available" : "taken";
    } catch {
      return "available"; // fail-open
    }
  };

  const genSuggestion = (base: string) => {
    const clean = base.replace(/-\d+$/, "").slice(0, 40);
    const suffix = Math.floor(1000 + Math.random() * 9000);
    return `${clean}-${suffix}`;
  };

  // On first load, propose an available slug (base or auto-generated suggestion)
  useEffect(() => {
    if (!baseSlug || !weddingId || hasPicked) return;
    let cancelled = false;
    const pick = async () => {
      setSlugStatus("checking");
      const baseStatus = await runCheck(baseSlug);
      if (cancelled) return;
      if (baseStatus === "available") {
        setSlug(baseSlug);
        setSlugStatus("available");
        setSuggestion("");
      } else {
        let found: string | null = null;
        for (let i = 0; i < 10; i++) {
          const s = genSuggestion(baseSlug);
          const st = await runCheck(s);
          if (cancelled) return;
          if (st === "available") {
            found = s;
            break;
          }
        }
        if (found) {
          setSlug(found);
          setSlugStatus("available");
          setSuggestion(found);
        } else {
          setSlug(baseSlug);
          setSlugStatus(baseStatus);
          setSuggestion("");
        }
      }
      setHasPicked(true);
    };
    pick();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseSlug, weddingId, hasPicked]);

  // Validate current slug whenever user changes it
  useEffect(() => {
    if (!slug || !weddingId || !hasPicked) return;
    setSlugStatus("checking");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const status = await runCheck(slug);
      setSlugStatus(status);
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, weddingId, hasPicked]);

  const applySlug = async (newSlug: string) => {
    const s = newSlug.trim().toLowerCase();
    const status = await runCheck(s);
    if (status !== "available") {
      setSlugStatus(status);
      toast.error(
        status === "invalid"
          ? "Format invalide (lettres, chiffres, tirets, 2-60 caractères)."
          : "Ce lien est déjà pris.",
      );
      return;
    }
    await updateCouple({ slug: s });
    setSlug(s);
    setSlugStatus("available");
    setCustomOpen(false);
    setCustomSlug("");
    toast.success("Lien mis à jour.");
  };

  const dateLabel = formatFrenchDate(couple.weddingDate);
  const subLine = [dateLabel, couple.city].filter(Boolean).join(" · ");
  const total = BASE_PRICE_XOF + (includeGuestbook ? GUESTBOOK_ADDON_XOF : 0);
  const alreadyPublished = couple.isPublished === true;
  const slugOk = slugStatus === "available";
  const canPublish = slugOk;


  const handlePromo = async () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) {
      toast.error("Veuillez saisir un code promo.");
      return;
    }
    setPromoLoading(true);
    try {
      const res = await validatePromo({ data: { code } });
      setAppliedPromo({ code: res.code, discount: res.discount });
      if (res.discount >= 100) {
        toast.success("Code appliqué — vous pouvez publier gratuitement.");
      } else {
        toast.success(`Remise de ${res.discount}% appliquée.`);
      }
    } catch (e) {
      setAppliedPromo(null);
      toast.error(e instanceof Error ? e.message : "Code promo invalide.");
    } finally {
      setPromoLoading(false);
    }
  };

  const handlePublish = async () => {
    setPayError(null);
    if (!weddingId) {
      setPayError("Aucun événement actif. Rechargez la page.");
      toast.error("Aucun événement actif. Rechargez la page.");
      return;
    }
    if (!slugOk) {
      setPayError("Le lien public n'est pas disponible. Choisissez-en un autre.");
      toast.error("Le lien public n'est pas disponible. Choisissez-en un autre.");
      return;
    }

    setPublishing(true);

    // Code promo 100 % : publication directe, sans paiement
    if (appliedPromo && appliedPromo.discount >= 100) {
      try {
        await publishFn({
          data: { weddingId, slug, code: appliedPromo.code, includeGuestbook },
        });
        await updateCouple({
          slug,
          isPublished: true,
          isLocked: true,
          publishedAt: new Date().toISOString(),
          hasEnvelopeAnimation: false,
          ...(includeGuestbook ? { hasGuestbook: true } : {}),
        });
        toast.success("Votre invitation est publiée !");
        navigate({ to: "/dashboard/share" });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Publication impossible.";
        setPayError(msg);
        toast.error(msg);
        setPublishing(false);
      }
      return;
    }

    // Paiement Paystack
    try {
      const res = await payFn({
        data: {
          weddingId,
          paymentType: "publication",
          amountFcfa: total,
          slug,
          includeGuestbook,
          callbackUrl: `${window.location.origin}/payment/callback`,
        },
      });
      if (!res?.authorization_url) {
        throw new Error("Passerelle de paiement indisponible. Réessayez.");
      }
      redirectToCheckout(res.authorization_url);
    } catch (e) {
      console.error("[paywall] payment init failed", e);
      const msg =
        e instanceof Error
          ? e.message
          : "Impossible de lancer le paiement. Réessayez.";
      setPayError(msg);
      toast.error(msg);
      setPublishing(false);
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

        {/* 3. Carte URL : lien suggéré + choix personnalisé */}
        <div className="mb-4">
          <div
            className={`flex items-center gap-3 rounded-[10px] px-[14px] py-2.5 ${
              slugStatus === "taken" || slugStatus === "invalid"
                ? "bg-[#fef2f2]"
                : "bg-muted"
            }`}
          >
            <div
              className="grid size-7 shrink-0 place-items-center rounded-md"
              style={{ background: "#FBEAF0" }}
            >
              <Link2 className="size-3.5" style={{ color: "#993556" }} strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[9px] uppercase tracking-[0.06em] text-muted-foreground/70">
                Votre lien
              </p>
              <p className="truncate text-[12px] font-medium">
                <span className="text-foreground">moninvit.com/e/</span>
                <span style={{ color: "#993556" }}>{slug}</span>
              </p>
            </div>
            {slugStatus === "checking" ? (
              <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" strokeWidth={2} />
            ) : slugStatus === "available" ? (
              <Check className="size-3.5 shrink-0" style={{ color: "#059669" }} strokeWidth={2} />
            ) : (
              <AlertTriangle className="size-3.5 shrink-0" style={{ color: "#b91c1c" }} strokeWidth={2} />
            )}
          </div>

          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="text-[11px] leading-[1.5] text-muted-foreground">
              {suggestion && suggestion === slug && suggestion !== baseSlug
                ? "Lien suggéré automatiquement car l'adresse idéale était déjà prise."
                : slugStatus === "available"
                  ? "Ce lien est disponible."
                  : "Vérification du lien…"}
            </p>
            <button
              type="button"
              onClick={() => {
                setCustomOpen((v) => !v);
                setCustomSlug(slug);
              }}
              className="shrink-0 text-[11px] font-medium underline underline-offset-2"
              style={{ color: "#993556" }}
            >
              {customOpen ? "Fermer" : "Choisir un autre lien"}
            </button>
          </div>

          {(slugStatus === "taken" || slugStatus === "invalid") && (
            <p className="mt-2 text-[12px] leading-[1.5] text-[#7f1d1d]">
              {slugStatus === "taken"
                ? "Ce lien public est déjà utilisé par un autre événement."
                : "Le format de ce lien n'est pas valide."}
            </p>
          )}

          {customOpen && (
            <div className="mt-3 rounded-[12px] border border-border/60 bg-card p-3">
              <p className="mb-2 text-[11px] leading-[1.4] text-muted-foreground">
                Saisissez le lien souhaité. Nous vérifions sa disponibilité en temps réel.
              </p>
              <div className="flex gap-2">
                <div className="flex flex-1 items-center gap-1 rounded-[10px] border border-border/60 bg-background px-2">
                  <span className="text-[11px] text-muted-foreground">moninvit.com/e/</span>
                  <input
                    type="text"
                    value={customSlug}
                    onChange={(e) =>
                      setCustomSlug(
                        e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") applySlug(customSlug);
                    }}
                    placeholder="mon-lien"
                    className="min-w-0 flex-1 bg-transparent py-2 text-[12px] outline-none"
                    maxLength={60}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => applySlug(customSlug)}
                  disabled={!customSlug.trim()}
                  className="shrink-0 rounded-[10px] px-3 text-[12px] font-medium disabled:opacity-60"
                  style={{ background: "#4B1528", color: "#FBEAF0" }}
                >
                  Vérifier
                </button>
              </div>
            </div>
          )}
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

          <div className="mt-3 border-t border-border/60 pt-3">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={includeGuestbook}
                onChange={(e) => setIncludeGuestbook(e.target.checked)}
                className="mt-0.5 size-4 shrink-0 accent-[#993556]"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-[12px] font-medium leading-tight">
                    Livre d'or numérique
                    <span
                      className="ml-2 rounded-full px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider"
                      style={{ background: "#FBEAF0", color: "#993556" }}
                    >
                      Option
                    </span>
                  </p>
                  <span className="whitespace-nowrap font-serif text-[13px] italic">
                    + {GUESTBOOK_ADDON_XOF.toLocaleString("fr-FR")}
                    <span className="ml-0.5 font-sans text-[9px] not-italic text-muted-foreground">
                      XOF
                    </span>
                  </span>
                </div>
                <p className="mt-0.5 text-[10px] leading-[1.4] text-muted-foreground">
                  Vos invités laissent un mot doux. PDF souvenir téléchargeable.
                </p>
              </div>
            </label>
          </div>


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

        {/* 5. Bouton — Publier (activé après code promo) */}
        <div className="mb-2.5">
          <button
            type="button"
            onClick={handlePublish}
            disabled={!canPublish || publishing || !weddingId}
            aria-disabled={!canPublish || publishing || !weddingId}
            title="Publier votre invitation"
            className="inline-flex w-full items-center justify-center gap-2 rounded-[14px] px-4 py-4 text-[15px] font-medium transition disabled:opacity-60"
            style={{ background: "#4B1528", color: "#FBEAF0" }}
          >
            {publishing ? (
              <Loader2 className="size-4 animate-spin" strokeWidth={2} />
            ) : (
              <Check className="size-4" strokeWidth={2} />
            )}
            {publishing
              ? appliedPromo && appliedPromo.discount >= 100
                ? "Publication en cours…"
                : "Redirection vers le paiement…"
              : appliedPromo && appliedPromo.discount >= 100
                ? "Publier mon invitation"
                : `Payer ${total.toLocaleString("fr-FR")} XOF et publier`}
          </button>

          {payError ? (
            <p
              role="alert"
              className="mt-2 rounded-[10px] border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-[11px] leading-[1.5] text-destructive"
            >
              {payError}
            </p>
          ) : null}


          {appliedPromo && appliedPromo.discount >= 100 ? (
            <p className="mt-2 text-center text-[11px] leading-[1.5] text-muted-foreground">
              Code <span className="font-mono">{appliedPromo.code}</span> appliqué —
              publication gratuite.
            </p>
          ) : (
            <p className="mt-2 text-center text-[11px] leading-[1.5] text-muted-foreground">
              Paiement sécurisé par Paystack.
              <br />
              Carte bancaire, Mobile Money ou USSD.
            </p>
          )}
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
