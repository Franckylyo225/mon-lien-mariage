import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, Copy, Heart, Share2 } from "lucide-react";
import { toast } from "sonner";
import { getPaymentStatus } from "@/lib/paystack.functions";

export const Route = createFileRoute("/payment/callback")({
  head: () => ({
    meta: [
      { title: "Confirmation du paiement — MonInvit.com" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PaymentCallbackPage,
});

/* ---------------- Charte ---------------- */
const FRAMBOISE = "#E82050";
const CHAMPAGNE = "#C6A15B";
const ENCRE = "#201A1C";
const UI_FONT = "'Quicksand', ui-sans-serif, system-ui, sans-serif";
const TITLE_FONT = "'Cormorant Garamond', ui-serif, Georgia, serif";

type Phase = "loading" | "success" | "failed";

interface WeddingInfo {
  brideName: string;
  groomName: string;
  slug: string | null;
  hasGuestbook: boolean;
  weddingDate: string | null;
  theme: string | null;
}

interface Step {
  id: number;
  icon: string;
  label: string;
  sublabel: (ctx: { wedding: WeddingInfo | null; amount: number | null }) => string;
  duration: number;
  condition?: (wedding: WeddingInfo | null) => boolean;
}

function daysUntil(date?: string | null): number {
  if (!date) return 0;
  const d = new Date(date).getTime();
  if (Number.isNaN(d)) return 0;
  return Math.max(0, Math.ceil((d - Date.now()) / 86_400_000));
}

const PUBLICATION_STEPS: Step[] = [
  {
    id: 1,
    icon: "✓",
    label: "Paiement confirmé",
    sublabel: ({ amount }) =>
      amount ? `Paystack · ${amount.toLocaleString("fr-FR")} XOF` : "Paystack",
    duration: 800,
  },
  {
    id: 2,
    icon: "🔗",
    label: "Création de ton lien",
    sublabel: ({ wedding }) => `moninvit.com/e/${wedding?.slug || "…"}`,
    duration: 1200,
  },
  {
    id: 3,
    icon: "🎨",
    label: "Application du thème",
    sublabel: ({ wedding }) => `${wedding?.theme || "Thème"} · mise en forme`,
    duration: 1000,
  },
  {
    id: 4,
    icon: "📖",
    label: "Activation du livre d'or",
    sublabel: () => "Tes invités peuvent laisser un message",
    duration: 900,
    condition: (wedding) => !!wedding?.hasGuestbook,
  },
  {
    id: 5,
    icon: "⏱",
    label: "Démarrage du compte à rebours",
    sublabel: ({ wedding }) =>
      `${daysUntil(wedding?.weddingDate)} jours avant le grand jour`,
    duration: 800,
  },
  {
    id: 6,
    icon: "🌐",
    label: "Mise en ligne",
    sublabel: () => "Ton invitation est maintenant visible",
    duration: 600,
  },
];

const GUESTBOOK_STEPS: Step[] = [
  {
    id: 1,
    icon: "✓",
    label: "Paiement confirmé",
    sublabel: ({ amount }) =>
      `${(amount ?? 1990).toLocaleString("fr-FR")} XOF`,
    duration: 800,
  },
  {
    id: 2,
    icon: "📖",
    label: "Activation du livre d'or",
    sublabel: () => "Option ajoutée à ton invitation",
    duration: 1000,
  },
  {
    id: 3,
    icon: "🔘",
    label: "Bouton flottant activé",
    sublabel: () => "Visible sur ta page publique",
    duration: 800,
  },
  {
    id: 4,
    icon: "✨",
    label: "Tout est prêt",
    sublabel: () => "Tes invités peuvent laisser un message",
    duration: 600,
  },
];

/* ---------------- Page ---------------- */
function PaymentCallbackPage() {
  const navigate = useNavigate();
  const statusFn = useServerFn(getPaymentStatus);
  const [phase, setPhase] = useState<Phase>("loading");
  const [reference, setReference] = useState<string | null>(null);
  const [wedding, setWedding] = useState<WeddingInfo | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [paymentType, setPaymentType] = useState<string>("publication");
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const started = useRef(false);

  const steps = useMemo(
    () =>
      paymentType === "addon_guestbook"
        ? GUESTBOOK_STEPS
        : PUBLICATION_STEPS.filter((s) => !s.condition || s.condition(wedding)),
    [paymentType, wedding],
  );
  const totalDuration = useMemo(
    () => steps.reduce((sum, s) => sum + s.duration, 0),
    [steps],
  );

  /* Polling (logique inchangée) */
  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const params = new URLSearchParams(window.location.search);
    const ref = params.get("reference") || params.get("trxref");
    setReference(ref);
    if (!ref) {
      setPhase("failed");
      return;
    }

    let attempts = 0;
    const maxAttempts = 12;
    const delayFor = (n: number) => (n <= 3 ? 600 : n <= 6 ? 1200 : 2500);
    let timer: ReturnType<typeof setTimeout>;
    let finish: ReturnType<typeof setTimeout>;

    const poll = async () => {
      attempts++;
      try {
        const res = await statusFn({ data: { reference: ref } });
        if (res.found) {
          if (res.wedding) setWedding(res.wedding);
          if (res.amountFcfa) setAmount(res.amountFcfa);
          if (res.paymentType) setPaymentType(res.paymentType);

          if (res.status === "success") {
            finish = setTimeout(() => setPhase("success"), 600);
            return;
          }
          if (res.status === "failed" || res.status === "abandoned") {
            setPhase("failed");
            return;
          }
        }
      } catch {
        /* on réessaie */
      }
      if (attempts < maxAttempts) {
        timer = setTimeout(poll, delayFor(attempts));
      } else {
        // Timeout optimiste — le webhook finira d'activer.
        finish = setTimeout(() => setPhase("success"), 400);
      }
    };

    poll();
    return () => {
      clearTimeout(timer);
      clearTimeout(finish);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Animation des étapes */
  useEffect(() => {
    if (phase !== "loading") return;
    let raf = 0;
    let startTime: number | null = null;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const animateProgress = (ts: number) => {
      if (startTime === null) startTime = ts;
      const spent = ts - startTime;
      setProgress(Math.min(spent / totalDuration, 1));
      if (spent < totalDuration) raf = requestAnimationFrame(animateProgress);
    };
    raf = requestAnimationFrame(animateProgress);

    let acc = 300;
    steps.forEach((s, i) => {
      timers.push(setTimeout(() => setCurrentStep(i), acc));
      acc += s.duration;
      timers.push(
        setTimeout(
          () => setCompletedSteps((prev) => (prev.includes(i) ? prev : [...prev, i])),
          acc,
        ),
      );
      acc += 120;
    });

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, steps.length, totalDuration]);

  const copyRef = useCallback(async () => {
    if (!reference) return;
    try {
      await navigator.clipboard.writeText(reference);
      toast.success("Référence copiée.");
    } catch {
      toast.error("Copie impossible.");
    }
  }, [reference]);

  if (phase === "failed") {
    return (
      <Shell>
        <PaymentFailed reference={reference} onCopy={copyRef} />
      </Shell>
    );
  }

  return (
    <Shell>
      {phase === "loading" ? (
        <LoadingScreen
          steps={steps}
          currentStep={currentStep}
          completedSteps={completedSteps}
          progress={progress}
          wedding={wedding}
          amount={amount}
        />
      ) : (
        <SuccessScreen
          wedding={wedding}
          isAddon={paymentType === "addon_guestbook"}
          onNavigate={(to) => navigate({ to })}
        />
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="grid min-h-screen place-items-center px-5 py-10"
      style={{
        background: "linear-gradient(170deg, #FFFDFB 0%, #FCF3F5 100%)",
        color: ENCRE,
        fontFamily: UI_FONT,
      }}
    >
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}

/* ---------------- Loading ---------------- */
function LoadingScreen({
  steps,
  currentStep,
  completedSteps,
  progress,
  wedding,
  amount,
}: {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
  progress: number;
  wedding: WeddingInfo | null;
  amount: number | null;
}) {
  return (
    <div>
      <div className="text-center">
        <span
          className="mx-auto grid size-16 place-items-center rounded-full"
          style={{
            background: "rgba(232,32,80,0.08)",
            animation: "payHeartPulse 1.6s ease-in-out infinite",
          }}
        >
          <Heart size={26} color={FRAMBOISE} strokeWidth={1.6} />
        </span>
        <h1
          className="mt-5 text-[26px] italic leading-tight"
          style={{ fontFamily: TITLE_FONT }}
        >
          Ton invitation se prépare…
        </h1>
        <p className="mt-1.5 text-[12px]" style={{ opacity: 0.6 }}>
          Quelques secondes, et c'est prêt ✨
        </p>
      </div>

      <div className="mt-7">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.14em]">
          <span style={{ opacity: 0.5 }}>Progression</span>
          <span style={{ color: FRAMBOISE, fontWeight: 700 }}>
            {Math.round(progress * 100)}%
          </span>
        </div>
        <div
          className="mt-2 h-[5px] w-full overflow-hidden rounded-full"
          style={{ background: "rgba(32,26,28,0.08)" }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress * 100}%`,
              background: `linear-gradient(90deg, ${FRAMBOISE}, ${CHAMPAGNE})`,
              transition: "width 120ms linear",
            }}
          />
        </div>
      </div>

      <ul className="mt-6 space-y-2">
        {steps.map((step, i) => {
          const isCompleted = completedSteps.includes(i);
          const isActive = currentStep === i && !isCompleted;
          return (
            <li
              key={step.id}
              className="flex items-center gap-3 rounded-[14px] px-3.5 py-3"
              style={{
                background: isActive
                  ? "rgba(232,32,80,0.05)"
                  : isCompleted
                    ? "#FFFFFF"
                    : "transparent",
                border: `0.5px solid ${
                  isActive ? "rgba(232,32,80,0.25)" : "rgba(32,26,28,0.08)"
                }`,
                opacity: !isActive && !isCompleted ? 0.45 : 1,
                transition: "background 300ms ease, opacity 300ms ease",
              }}
            >
              <span
                className="grid size-8 shrink-0 place-items-center rounded-full text-[13px]"
                style={{
                  background: isCompleted
                    ? "rgba(46,158,107,0.12)"
                    : isActive
                      ? "rgba(232,32,80,0.12)"
                      : "rgba(32,26,28,0.05)",
                }}
              >
                {isCompleted ? (
                  <Check size={15} color="#2E9E6B" strokeWidth={2.4} />
                ) : isActive ? (
                  <span
                    className="block size-[14px] rounded-full"
                    style={{
                      border: `2px solid rgba(232,32,80,0.25)`,
                      borderTopColor: FRAMBOISE,
                      animation: "paySpin 0.8s linear infinite",
                    }}
                  />
                ) : (
                  <span aria-hidden>{step.icon}</span>
                )}
              </span>

              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-[13px]"
                  style={{ fontWeight: isActive ? 700 : 600 }}
                >
                  {step.label}
                </p>
                {(isActive || isCompleted) && (
                  <p
                    className="truncate text-[11px]"
                    style={{
                      opacity: 0.55,
                      animation: "payFadeUp 400ms ease both",
                    }}
                  >
                    {step.sublabel({ wedding, amount })}
                  </p>
                )}
              </div>

              {isCompleted ? (
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{ background: "rgba(46,158,107,0.12)", color: "#2E9E6B" }}
                >
                  OK
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>

      <p className="mt-6 text-center text-[11px]" style={{ opacity: 0.45 }}>
        🔒 Paiement sécurisé · Ne ferme pas cette page
      </p>
    </div>
  );
}

/* ---------------- Success ---------------- */
function SuccessScreen({
  wedding,
  isAddon,
  onNavigate,
}: {
  wedding: WeddingInfo | null;
  isAddon: boolean;
  onNavigate: (to: string) => void;
}) {
  const publicUrl = wedding?.slug ? `https://moninvit.com/e/${wedding.slug}` : null;

  const copyUrl = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success("Lien copié.");
    } catch {
      toast.error("Copie impossible.");
    }
  };

  return (
    <div className="relative text-center">
      <Confetti />

      <span
        className="mx-auto grid size-[72px] place-items-center rounded-full"
        style={{
          background: "rgba(46,158,107,0.12)",
          animation: "paySuccessBounce 700ms cubic-bezier(0.34,1.56,0.64,1) both",
        }}
      >
        <Check size={32} color="#2E9E6B" strokeWidth={2.2} />
      </span>

      <h1
        className="mt-5 text-[28px] italic leading-tight"
        style={{ fontFamily: TITLE_FONT, animation: "payFadeUp 600ms 120ms ease both" }}
      >
        {isAddon ? "Livre d'or activé !" : "Ton invitation est en ligne !"}
      </h1>

      <p
        className="mt-2 text-[13px] whitespace-pre-line"
        style={{ opacity: 0.6, animation: "payFadeUp 600ms 220ms ease both" }}
      >
        {isAddon
          ? "Le bouton livre d'or est maintenant visible\nsur ta page d'invitation."
          : wedding
            ? `${wedding.brideName} & ${wedding.groomName}`
            : "Votre page est publiée."}
      </p>

      {!isAddon && publicUrl ? (
        <div
          className="mt-5 flex items-center gap-2 rounded-[12px] px-3.5 py-3 text-left"
          style={{
            background: "#fff",
            border: `0.5px solid ${CHAMPAGNE}55`,
            animation: "payFadeUp 600ms 320ms ease both",
          }}
        >
          <div className="min-w-0 flex-1">
            <p className="text-[9px] uppercase tracking-[0.16em]" style={{ opacity: 0.45 }}>
              Ton lien public
            </p>
            <p className="truncate text-[12px] font-semibold">
              moninvit.com/e/{wedding?.slug}
            </p>
          </div>
          <button
            type="button"
            onClick={copyUrl}
            aria-label="Copier le lien"
            className="shrink-0 rounded-[8px] p-2"
            style={{ background: "rgba(32,26,28,0.04)" }}
          >
            <Copy size={14} />
          </button>
        </div>
      ) : null}

      <div
        className="mt-6 space-y-2"
        style={{ animation: "payFadeUp 600ms 420ms ease both" }}
      >
        {!isAddon && publicUrl ? (
          <button
            type="button"
            onClick={() => {
              const msg = encodeURIComponent(
                `Notre invitation de mariage est prête ! 💌\n${publicUrl}`,
              );
              window.open(`https://wa.me/?text=${msg}`, "_blank");
            }}
            className="flex w-full items-center justify-center gap-2 rounded-[12px] py-3.5 text-[14px] font-bold"
            style={{ background: "#25D366", color: "#fff" }}
          >
            <Share2 size={16} /> Partager sur WhatsApp
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onNavigate(isAddon ? "/app/guestbook" : "/dashboard/share")}
            className="w-full rounded-[12px] py-3.5 text-[14px] font-bold"
            style={{ background: FRAMBOISE, color: "#fff" }}
          >
            {isAddon ? "Voir mon livre d'or →" : "Partager mon invitation →"}
          </button>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onNavigate("/dashboard/preview")}
            className="rounded-[10px] px-2 py-2.5 text-[12px] font-semibold"
            style={{ background: "#fff", border: "0.5px solid rgba(32,26,28,0.15)" }}
          >
            👁 Voir ma page
          </button>
          <button
            type="button"
            onClick={() => onNavigate("/dashboard")}
            className="rounded-[10px] px-2 py-2.5 text-[12px] font-semibold"
            style={{ background: "#fff", border: "0.5px solid rgba(32,26,28,0.15)" }}
          >
            🏠 Tableau de bord
          </button>
        </div>
      </div>

      {!isAddon && wedding?.hasGuestbook ? (
        <div
          className="mt-5 flex items-start gap-2 rounded-[12px] px-3.5 py-3 text-left"
          style={{
            background: "rgba(198,161,91,0.08)",
            animation: "payFadeUp 600ms 520ms ease both",
          }}
        >
          <span aria-hidden>📖</span>
          <p className="text-[11px] leading-[1.5]" style={{ opacity: 0.7 }}>
            Ton livre d'or est actif. Tes invités peuvent déjà laisser un message
            depuis ta page.
          </p>
        </div>
      ) : null}
    </div>
  );
}

/* ---------------- Confetti ---------------- */
function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        color: [FRAMBOISE, CHAMPAGNE, "#FCE8EE", "#2E9E6B", "#F6D9A0"][i % 5],
        left: `${(i / 24) * 100}%`,
        delay: `${(i * 0.08).toFixed(2)}s`,
        size: [6, 8, 5, 7][i % 4],
        isCircle: i % 3 === 0,
      })),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-x-0 -top-10 h-[420px] overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 block"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.isCircle ? "50%" : 2,
            animation: `payConfettiFall 2.6s ${p.delay} ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}

/* ---------------- Failed ---------------- */
function PaymentFailed({
  reference,
  onCopy,
}: {
  reference: string | null;
  onCopy: () => void;
}) {
  const navigate = useNavigate();
  return (
    <div className="text-center">
      <span
        className="mx-auto grid size-[68px] place-items-center rounded-full text-[24px]"
        style={{ background: "rgba(232,32,80,0.1)", color: FRAMBOISE }}
      >
        ✕
      </span>
      <h1 className="mt-5 text-[26px] italic" style={{ fontFamily: TITLE_FONT }}>
        Paiement non abouti
      </h1>
      <p className="mt-2 text-[13px] whitespace-pre-line" style={{ opacity: 0.6 }}>
        {"Le paiement n'a pas pu être traité.\nAucun montant n'a été débité."}
      </p>

      {reference ? (
        <div
          className="mt-5 flex items-center gap-2 rounded-[12px] px-3.5 py-3 text-left"
          style={{ background: "#fff", border: "0.5px solid rgba(32,26,28,0.12)" }}
        >
          <div className="min-w-0 flex-1">
            <p className="text-[9px] uppercase tracking-[0.16em]" style={{ opacity: 0.45 }}>
              Référence
            </p>
            <p className="truncate font-mono text-[12px]">{reference}</p>
          </div>
          <button type="button" onClick={onCopy} aria-label="Copier la référence">
            <Copy size={14} />
          </button>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => navigate({ to: "/publish" })}
        className="mt-6 w-full rounded-[12px] py-3.5 text-[14px] font-bold"
        style={{ background: FRAMBOISE, color: "#fff" }}
      >
        Réessayer
      </button>
      <Link
        to="/app/support"
        className="mt-3 inline-block text-[12px] underline"
        style={{ opacity: 0.55 }}
      >
        Contacter le support
      </Link>
    </div>
  );
}
