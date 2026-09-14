import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { trackPageView } from "@/lib/consent";

/**
 * Envoie une vue de page Google Analytics à chaque navigation côté client,
 * sur toutes les routes (site public, espace mariés, admin).
 */
export function useGaPageView() {
  const path = useRouterState({
    select: (s) => s.location.pathname + s.location.searchStr,
  });

  useEffect(() => {
    // Laisse le titre de la page se mettre à jour avant l'envoi.
    const t = window.setTimeout(() => trackPageView(path), 50);
    return () => window.clearTimeout(t);
  }, [path]);
}
