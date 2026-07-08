import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";

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
  const current = Math.max(0, stepPaths.findIndex((p) => pathname.startsWith(p)));
  const stepNum = current + 1;
  const prev = current > 0 ? stepPaths[current - 1] : null;

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
