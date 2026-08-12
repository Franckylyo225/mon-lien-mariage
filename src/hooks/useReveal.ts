import { useEffect, useRef, useState } from "react";

interface UseRevealOptions {
  /** 0 à 1, défaut 0.15 */
  threshold?: number;
  /** ne jouer qu'une fois, défaut true */
  once?: boolean;
}

/**
 * Révèle un élément (fondu montant) quand il entre dans le viewport.
 * Respecte prefers-reduced-motion.
 */
export function useReveal(options: UseRevealOptions = {}) {
  const { threshold = 0.15, once = true } = options;
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReduced || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  return { ref, visible };
}

export default useReveal;
