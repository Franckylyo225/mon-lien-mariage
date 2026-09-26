import { Link, useRouterState } from "@tanstack/react-router";
import { Plus } from "lucide-react";

/**
 * Floating action button — shown only on tabs where an "add" action makes sense.
 * Currently: /dashboard/guests → new guest.
 */
export function Fab() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (pathname === "/dashboard/guests") {
    return (
      <Link
        to="/dashboard/guests"
        search={{ add: true }}
        aria-label="Ajouter un invité"
        className="fixed bottom-20 right-4 z-20 grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition active:scale-95"
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
      >
        <Plus size={24} strokeWidth={2} />
      </Link>
    );
  }

  return null;
}
