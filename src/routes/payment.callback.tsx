import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Check, AlertTriangle } from "lucide-react";
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

type Status = "checking" | "success" | "failed";

function PaymentCallbackPage() {
  const navigate = useNavigate();
  const statusFn = useServerFn(getPaymentStatus);
  const [status, setStatus] = useState<Status>("checking");
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const params = new URLSearchParams(window.location.search);
    const ref = params.get("reference") || params.get("trxref");
    if (!ref) {
      setStatus("failed");
      return;
    }

    let attempts = 0;
    const maxAttempts = 15;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      attempts++;
      try {
        const res = await statusFn({ data: { reference: ref } });
        if (res.found && res.status === "success") {
          setStatus("success");
          setTimeout(() => {
            if (res.paymentType === "addon_guestbook") {
              navigate({ to: "/app/guestbook" });
            } else {
              navigate({ to: "/dashboard/share" });
            }
          }, 1800);
          return;
        }
        if (res.found && (res.status === "failed" || res.status === "abandoned")) {
          setStatus("failed");
          return;
        }
      } catch {
        // ignore, on réessaie
      }
      if (attempts < maxAttempts) {
        timer = setTimeout(poll, 2000);
      } else {
        setStatus("success");
        setTimeout(() => navigate({ to: "/dashboard" }), 3000);
      }
    };

    poll();
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid min-h-screen place-items-center bg-background px-6 text-center text-foreground">
      <div className="max-w-sm">
        {status === "checking" && (
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
        )}

        {status === "success" && (
          <>
            <span
              className="mx-auto grid size-14 place-items-center rounded-full"
              style={{ background: "#ecfdf5", color: "#047857" }}
            >
              <Check className="size-6" strokeWidth={2} />
            </span>
            <h1 className="mt-5 font-serif text-[22px] italic">
              Paiement confirmé !
            </h1>
            <p className="mt-2 text-[12px] leading-[1.6] text-muted-foreground">
              Redirection en cours…
            </p>
          </>
        )}

        {status === "failed" && (
          <>
            <span
              className="mx-auto grid size-14 place-items-center rounded-full"
              style={{ background: "#fef2f2", color: "#b91c1c" }}
            >
              <AlertTriangle className="size-6" strokeWidth={1.75} />
            </span>
            <h1 className="mt-5 font-serif text-[22px] italic">
              Paiement non abouti
            </h1>
            <p className="mt-2 text-[12px] leading-[1.6] text-muted-foreground">
              Le paiement n'a pas pu être traité.
            </p>
            <button
              type="button"
              onClick={() => navigate({ to: "/publish" })}
              className="mt-6 rounded-[10px] px-6 py-3 text-[13px] font-medium"
              style={{ background: "#4B1528", color: "#FBEAF0" }}
            >
              Réessayer
            </button>
          </>
        )}
      </div>
    </div>
  );
}
