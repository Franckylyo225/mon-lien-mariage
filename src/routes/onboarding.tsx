import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { useWedding } from "@/lib/wedding-store";
import {
  FIRST_ONBOARDING_STEP,
  ONBOARDING_STEPS,
  ONBOARDING_STEP_COUNT,
} from "@/lib/onboarding-steps";

export const Route = createFileRoute("/onboarding")({
  beforeLoad: ({ location }) => {
    // `/onboarding` nu n'a pas d'écran : sans cela il rend l'en-tête du wizard
    // au-dessus d'un Outlet vide.
    if (location.pathname.replace(/\/$/, "") === "/onboarding") {
      throw redirect({ to: FIRST_ONBOARDING_STEP, replace: true });
    }
  },
  component: OnboardingLayout,
});

function OnboardingLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { account, loading } = useWedding();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !account.isAuthenticated) {
      navigate({ to: "/login", replace: true });
    }
  }, [loading, account.isAuthenticated, navigate]);

  const current = Math.max(
    0,
    ONBOARDING_STEPS.findIndex((p) => pathname.startsWith(p)),
  );
  const stepNum = current + 1;
  const prev = current > 0 ? ONBOARDING_STEPS[current - 1] : null;

  if (loading || !account.isAuthenticated) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-40">
          Chargement…
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-5 py-6 sm:py-10">
        <header className="mb-8 flex items-center justify-between">
          {prev ? (
            <Link
              to={prev}
              className="text-sm text-muted-foreground hover:text-foreground"
              aria-label="Retour"
            >
              ← Retour
            </Link>
          ) : (
            <span className="text-sm text-muted-foreground/40" aria-hidden>
              ← Retour
            </span>
          )}
          <p className="page-kicker">
            Étape {stepNum} / {ONBOARDING_STEP_COUNT}
          </p>
        </header>

        <div className="mb-10 flex items-center gap-2">
          {ONBOARDING_STEPS.map((path, i) => (
            <span
              key={path}
              className={
                "h-1.5 w-1.5 rounded-full " +
                (i <= current ? "bg-primary" : "bg-border")
              }
            />
          ))}
        </div>

        <Outlet />
      </div>
    </main>
  );
}
