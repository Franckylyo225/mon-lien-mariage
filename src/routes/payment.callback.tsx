import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Check, AlertTriangle, XCircle, Copy } from "lucide-react";
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

type Status = "checking" | "success" | "failed" | "abandoned" | "unknown";

const LABELS: Record<Exclude<Status, "checking">, string> = {
  success: "Payé",
  failed: "Échoué",
  abandoned: "Annulé",
  unknown: "En attente de confirmation",
};

function PaymentCallbackPage() {
  const navigate = useNavigate();
  const statusFn = useServerFn(getPaymentStatus);
  const [status, setStatus] = useState<Status>("checking");
  const [reference, setReference] = useState<string | null>(null);
  const [target, setTarget] = useState<"guestbook" | "share" | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const params = new URLSearchParams(window.location.search);
    const ref = params.get("reference") || params.get("trxref");
    setReference(ref);
    if (!ref) {
      setStatus("failed");
      return;
    }

    let attempts = 0;
    const maxAttempts = 12;
    // Sondage rapide au début (le webhook arrive en général en <2 s),
    // puis on espace progressivement.
    const delayFor = (n: number) => (n <= 3 ? 600 : n <= 6 ? 1200 : 2500);
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      attempts++;
      try {
        const res = await statusFn({ data: { reference: ref } });
        if (res.found && res.status === "success") {
          setStatus("success");
          setTarget(
            res.paymentType === "addon_guestbook" ? "guestbook" : "share",
          );
          return;
        }
        if (res.found && res.status === "failed") {
          setStatus("failed");
          return;
        }
        if (res.found && res.status === "abandoned") {
          setStatus("abandoned");
          return;
        }
      } catch {
        // on réessaie
      }
      if (attempts < maxAttempts) {
        timer = setTimeout(poll, delayFor(attempts));
      } else {
        setStatus("unknown");
      }
    };


    poll();
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyRef = async () => {
    if (!reference) return;
    try {
      await navigator.clipboard.writeText(reference);
      toast.success("Référence copiée.");
    } catch {
      toast.error("Copie impossible.");
    }
  };

  const badge =
    status === "checking"
      ? null
      : {
          success: { bg: "#ecfdf5", fg: "#047857" },
          failed: { bg: "#fef2f2", fg: "#b91c1c" },
          abandoned: { bg: "#fffbeb", fg: "#b45309" },
          unknown: { bg: "#f5f5f5", fg: "#525252" },
        }[status];

  return (
    <div className="grid min-h-screen place-items-center bg-background px-6 text-center text-foreground">
      <div className="w-full max-w-sm">
        {status === "checking" ? (
          <>
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-muted">
              <Loader2 className="size-6 animate-spin" strokeWidth={1.75} />
            </span>
            <h1 className="mt-5 font-serif text-[22px] italic">
              Vérification du paiement…
            </h1>
            <p className="mt-2 text-[12px] leading-[1.6] text-muted-foreground">
              Merci de patienter quelques secondes.
            </p>
          </>
        ) : (
          <>
            <span
              className="mx-auto grid size-14 place-items-center rounded-full"
              style={{ background: badge?.bg, color: badge?.fg }}
            >
              {status === "success" ? (
                <Check className="size-6" strokeWidth={2} />
              ) : status === "abandoned" ? (
                <XCircle className="size-6" strokeWidth={1.75} />
              ) : (
                <AlertTriangle className="size-6" strokeWidth={1.75} />
              )}
            </span>

            <h1 className="mt-5 font-serif text-[22px] italic">
              {status === "success"
                ? "Paiement confirmé !"
                : status === "abandoned"
                  ? "Paiement annulé"
                  : status === "unknown"
                    ? "Paiement en cours de traitement"
                    : "Paiement non abouti"}
            </h1>

            <span
              className="mt-3 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium"
              style={{ background: badge?.bg, color: badge?.fg }}
            >
              Statut : {LABELS[status]}
            </span>

            <p className="mt-3 text-[12px] leading-[1.6] text-muted-foreground">
              {status === "success"
                ? "Votre service a été activé sur votre compte."
                : status === "abandoned"
                  ? "Vous avez quitté la page de paiement avant la fin."
                  : status === "unknown"
                    ? "La confirmation peut prendre quelques minutes. Cette référence vous permet de nous contacter."
                    : "Le paiement n'a pas pu être traité par la banque."}
            </p>

            {reference ? (
              <div className="mt-5 rounded-[12px] border border-border/60 bg-card px-4 py-3 text-left">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Référence Paystack
                </p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="font-mono text-[12px] break-all">
                    {reference}
                  </span>
                  <button
                    type="button"
                    onClick={copyRef}
                    aria-label="Copier la référence"
                    className="shrink-0 text-muted-foreground hover:text-foreground"
                  >
                    <Copy className="size-3.5" />
                  </button>
                </div>
              </div>
            ) : null}

            <div className="mt-6 flex flex-col gap-2">
              {status === "success" ? (
                <button
                  type="button"
                  onClick={() =>
                    navigate({
                      to:
                        target === "guestbook"
                          ? "/app/guestbook"
                          : "/dashboard/share",
                    })
                  }
                  className="rounded-[10px] px-6 py-3 text-[13px] font-medium"
                  style={{ background: "#4B1528", color: "#FBEAF0" }}
                >
                  {target === "guestbook"
                    ? "Voir mon livre d'or"
                    : "Partager mon invitation"}
                </button>
              ) : status === "unknown" ? (
                <>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="rounded-[10px] px-6 py-3 text-[13px] font-medium"
                    style={{ background: "#4B1528", color: "#FBEAF0" }}
                  >
                    Actualiser le statut
                  </button>
                  <Link
                    to="/app/support"
                    className="text-[12px] text-muted-foreground underline"
                  >
                    Contacter le support
                  </Link>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => navigate({ to: "/publish" })}
                    className="rounded-[10px] px-6 py-3 text-[13px] font-medium"
                    style={{ background: "#4B1528", color: "#FBEAF0" }}
                  >
                    Réessayer le paiement
                  </button>
                  <Link
                    to="/dashboard"
                    className="text-[12px] text-muted-foreground underline"
                  >
                    Retour au tableau de bord
                  </Link>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
