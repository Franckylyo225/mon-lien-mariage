import { useEffect, useRef, type ReactNode } from "react";

/**
 * Wraps children and progressively reveals descendant <section> elements
 * with an elegant scale + fade animation as they enter the viewport.
 */
export function RevealOnScroll({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const targets = Array.from(
      root.querySelectorAll<HTMLElement>("section, [data-reveal]"),
    );

    if (prefersReduced) {
      targets.forEach((el) => el.classList.add("reveal-in"));
      return;
    }

    targets.forEach((el, i) => {
      el.classList.add("reveal-init");
      el.style.setProperty("--reveal-delay", `${Math.min(i * 60, 240)}ms`);
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [children]);

  return (
    <div ref={rootRef} className="contents">
      {children}
    </div>
  );
}
