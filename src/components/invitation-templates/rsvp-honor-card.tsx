import type { ReactNode } from "react";
import type { RsvpDesign } from "@/lib/rsvp-design";
import { RsvpOrnament } from "./rsvp-ornament";

interface Props {
  design: RsvpDesign;
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}

/** Shared ceremonial frame for both RSVP experiences. */
export function RsvpHonorCard({ design, eyebrow, title, description, children }: Props) {
  return (
    <section
      className={
        "relative mt-12 w-full max-w-full overflow-hidden p-1 text-center shadow-[0_22px_60px_-36px_currentColor] " +
        design.wrapperRadius + " " + design.border1
      }
      style={{
        background: design.bg,
        color: design.ink,
        borderColor: design.border,
        fontFamily: design.bodyFont,
      }}
    >
      <div
        className={"relative overflow-hidden border px-5 py-9 sm:px-8 sm:py-12 " + design.wrapperRadius}
        style={{ borderColor: design.border }}
      >
        <CornerMarks color={design.accent} />
        <div className="relative z-10">
          <div
            className="mx-auto grid size-12 place-items-center rounded-full border"
            style={{
              borderColor: design.border,
              background: design.surface,
              boxShadow: `0 0 0 4px ${design.bg}`,
            }}
          >
            <svg viewBox="0 0 32 32" className="size-6" fill="none" stroke={design.accent} strokeWidth="1.2" aria-hidden>
              <path d="M16 26.5S5.5 20.4 5.5 12.4A5.4 5.4 0 0 1 16 10.6a5.4 5.4 0 0 1 10.5 1.8C26.5 20.4 16 26.5 16 26.5Z" />
              <path d="M10 4.5h12M16 2v5" opacity=".65" />
            </svg>
          </div>
          <RsvpOrnament kind={design.ornament} color={design.accent} className="mt-4 h-5 w-28" />
          <p className="mt-3 text-[10px] uppercase tracking-[0.35em]" style={{ color: design.accent, fontFamily: design.eyebrowFont }}>
            {eyebrow}
          </p>
          <h3
            className={"mx-auto mt-3 max-w-md break-words text-3xl leading-tight sm:text-4xl " + (design.headingItalic ? "italic" : "")}
            style={{ fontFamily: design.headingFont, color: design.ink }}
          >
            {title}
          </h3>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed" style={{ color: design.mutedInk }}>
            {description}
          </p>
          {children}
        </div>
      </div>
    </section>
  );
}

function CornerMarks({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-2 h-[calc(100%-1rem)] w-[calc(100%-1rem)] opacity-55"
      fill="none"
      stroke={color}
      strokeWidth="0.45"
      aria-hidden
    >
      <path d="M0 12V0h12M88 0h12v12M100 88v12H88M12 100H0V88" />
      <path d="M3 9V3h6M91 3h6v6M97 91v6h-6M9 97H3v-6" opacity=".65" />
    </svg>
  );
}