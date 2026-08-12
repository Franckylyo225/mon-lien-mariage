import { createElement, type CSSProperties, type ReactNode } from "react";
import { useReveal } from "@/hooks/useReveal";

interface RevealProps {
  children: ReactNode;
  /** délai en ms (0, 100, 200…) */
  delay?: number;
  /** durée en ms, défaut 700 */
  duration?: number;
  /** distance en px, défaut 28 */
  distance?: number;
  /** seuil de visibilité, défaut 0.15 */
  threshold?: number;
  className?: string;
  style?: CSSProperties;
  as?: keyof React.JSX.IntrinsicElements;
}

/**
 * Fondu montant à l'entrée dans le viewport.
 */
export function Reveal({
  children,
  delay = 0,
  duration = 700,
  distance = 28,
  threshold = 0.15,
  className = "",
  style = {},
  as: Tag = "div",
}: RevealProps) {
  const { ref, visible } = useReveal({ threshold });

  return createElement(
    Tag,
    {
      ref,
      "data-reveal": "",
      className,
      style: {
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : `translateY(${distance}px)`,
        transition: `opacity ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        ...style,
      } as CSSProperties,
    },
    children,
  );
}

export default Reveal;
