import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useWedding } from "@/lib/wedding-store";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingLayout,
});

const stepPaths = [
  "/onboarding/couple",
  "/onboarding/ceremonies",
  "/onboarding/theme",
  "/onboarding/guests",
] as const;

function OnboardingLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { account, loading } = useWedding();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !account.isAuthenticated) {
      navigate({ to: "/login", replace: true });
    }
  }, [loading, account.isAuthenticated, navigate]);

  const current = Math.max(0, stepPaths.findIndex((p) => pathname.startsWith(p)));
  const stepNum = current + 1;
  const prev = current > 0 ? stepPaths[current - 1] : null;

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
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Étape {stepNum} / 4
          </p>
        </header>

        <div className="mb-10 flex items-center gap-2">
          {stepPaths.map((_, i) => (
            <span
              key={i}
              className={
                "h-1.5 flex-1 rounded-full " +
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
