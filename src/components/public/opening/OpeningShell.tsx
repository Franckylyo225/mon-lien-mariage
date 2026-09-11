import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { OpeningEffect } from "./types";
import "./opening.css";

interface Props {
  effect: OpeningEffect;
  onOpenStart?: () => void;
  onDone: () => void;
  children: ReactNode;
}

const OPEN_DURATION = 900;

/**
 * Coque commune des modèles de page d'ouverture : gère le geste (toucher ou
 * glissement) et l'animation de sortie en CSS (transform/opacity uniquement).
 */
export function OpeningShell({ effect, onOpenStart, onDone, children }: Props) {
  const [open, setOpen] = useState(false);
  const startY = useRef<number | null>(null);
  const openedRef = useRef(false);

  const trigger = useCallback(() => {
    if (openedRef.current) return;
    openedRef.current = true;
    onOpenStart?.();
    setOpen(true);
    setTimeout(onDone, OPEN_DURATION);
  }, [onDone, onOpenStart]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        trigger();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [trigger]);

  const handlePointerDown = (e: React.PointerEvent) => {
    startY.current = e.clientY;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const from = startY.current;
    startY.current = null;
    if (effect === "tap") {
      trigger();
      return;
    }
    if (from == null) return;
    const delta = e.clientY - from;
    if (effect === "swipe_up" && delta < -50) trigger();
    if (effect === "swipe_down" && delta > 50) trigger();
    // Un simple toucher reste accepté comme repli d'accessibilité.
    if (Math.abs(delta) < 6) trigger();
  };

  return (
    <div
      className={`opening-shell effect-${effect}${open ? " is-open" : ""}`}
      role="button"
      tabIndex={0}
      aria-label="Ouvrir l'invitation"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <div className="opening-shell-inner">{children}</div>
    </div>
  );
}

export default OpeningShell;
