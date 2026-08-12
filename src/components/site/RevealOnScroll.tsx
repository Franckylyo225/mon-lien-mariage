import { useEffect, useRef, type ReactNode } from "react";

/**
 * Wraps children and progressively reveals descendant <section> elements
 * (and their direct children, in cascade) with an elegant fade-up animation
 * as they enter the viewport. Respects prefers-reduced-motion.
 *
 * Opt out of an element with `data-no-reveal`.
 */
export function RevealOnScroll({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const sections = Array.from(
      root.querySelectorAll<HTMLElement>("section, [data-reveal]"),
    ).filter((el) => !el.closest("[data-no-reveal]"));

    if (prefersReduced) {
      sections.forEach((el) => el.classList.add("reveal-in"));
      return;
    }

    const isMobile = window.innerWidth < 768;
    const step = isMobile ? 90 : 120;

    const targets: HTMLElement[] = [];

    sections.forEach((section, i) => {
      section.classList.add("reveal-init");
      section.style.setProperty("--reveal-delay", `${Math.min(i * 60, 240)}ms`);
      targets.push(section);

      // Cascade on the section's direct children (max 8 animated at once).
      const kids = Array.from(section.children).filter(
        (c): c is HTMLElement =>
          c instanceof HTMLElement &&
          !c.hasAttribute("data-no-reveal") &&
          !c.matches("script, style, canvas, audio, video"),
      );
      if (kids.length < 2 || kids.length > 8) return;
      kids.forEach((kid, k) => {
        kid.classList.add("reveal-child-init");
        kid.style.setProperty("--reveal-delay", `${k * step}ms`);
        targets.push(kid);
      });
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
      { threshold: isMobile ? 0.08 : 0.12, rootMargin: "0px 0px -8% 0px" },
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
