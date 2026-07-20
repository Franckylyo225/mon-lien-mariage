import { formatFrenchDate } from "@/lib/wedding-store";
import { eventTypeMeta } from "@/lib/ceremony-meta";
import type { TemplateProps } from "./types";
import { CeremonyProgramTabs } from "./program-tabs";
import { Countdown, GallerySection, OurStorySection, TemplateBottomSections } from "./sections";
import { ScrollIndicator } from "./scroll-indicator";

export function ArtDecoTemplate({ couple, ceremonies, rsvpSlot }: TemplateProps) {
  const published = ceremonies.filter((c) => c.status === "publiée");

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#1a0f1a] via-[#2a1520] to-[#1a0f1a] text-[#f0d78c]">
      <article className="mx-auto max-w-lg px-5 pb-24 pt-10 sm:px-8">
        <div className="relative rounded-[2rem] border border-[#c9a84c]/50 bg-[#1a0f1a]/60 p-8 text-center shadow-2xl backdrop-blur">
          {/* Deco frame */}
          <div className="pointer-events-none absolute inset-3 rounded-[1.5rem] border border-[#c9a84c]/30" />
          <svg
            aria-hidden
            viewBox="0 0 100 100"
            className="mx-auto size-16 text-[#c9a84c]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <path d="M50 5 L 95 50 L 50 95 L 5 50 Z" />
            <path d="M50 20 L 80 50 L 50 80 L 20 50 Z" />
            <circle cx="50" cy="50" r="4" fill="currentColor" />
          </svg>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.5em] text-[#c9a84c]">
            {couple.caption || "The wedding of"}
          </p>
          <h1 className="mt-6 font-serif text-5xl italic leading-none">
            <span className="block">{couple.brideName}</span>
            <span className="my-3 block text-3xl text-[#c9a84c]">&</span>
            <span className="block">{couple.groomName}</span>
          </h1>
          <div className="mx-auto my-6 flex items-center justify-center gap-2">
            <span className="h-px w-10 bg-[#c9a84c]" />
            <span className="rotate-45 text-[#c9a84c]">◆</span>
            <span className="h-px w-10 bg-[#c9a84c]" />
          </div>
          <p className="font-serif italic text-[#f0d78c]/90">
            <span style={{ color: "var(--wedding-accent)" }}>{formatFrenchDate(couple.weddingDate)}</span>
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.4em] text-[#c9a84c]/70">
            {couple.city}
          </p>
        </div>

        {couple.heroImageUrl ? (
          <div className="mt-8 overflow-hidden rounded-3xl border border-[#c9a84c]/40">
            <img
              src={couple.heroImageUrl}
              alt=""
              className="aspect-[4/5] w-full object-cover"
              style={{ filter: "sepia(0.2) contrast(1.05)" }}
            />
          </div>
        ) : null}

        <ScrollIndicator accent="#c9a84c" />

        {(couple.countdownEnabled ?? true) && (
          <div className="mt-8">
            <Countdown
              targetDate={couple.weddingDate}
            style={couple.countdownStyle}
              units={couple.countdownUnits}
              tone={{
                cellBg: "bg-[#1a0f1a]/60",
                cellBorder: "border border-[#c9a84c]/40",
                numberClass: "text-3xl font-serif italic text-[#f0d78c]",
                labelClass:
                  "font-mono text-[9px] uppercase tracking-[0.3em] text-[#c9a84c]",
              }}
            />
          </div>
        )}

        <OurStorySection couple={couple} accent="#c9a84c" />

        <p className="mt-10 text-center font-serif italic leading-relaxed text-[#f0d78c]/80">
          {couple.introMessage}
        </p>

        <section className="mt-14">
          <div className="text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#c9a84c]">
              — {eventTypeMeta[couple.eventType ?? "mariage"].programTitle} —
            </p>
          </div>
          <div className="mt-8">
            <CeremonyProgramTabs ceremonies={published} variant="deco" />
          </div>
        </section>

        {rsvpSlot}

        <GallerySection couple={couple} accent="#c9a84c" layout="mosaic" />

        <TemplateBottomSections couple={couple} ceremonies={published} accent="#c9a84c" />

        <footer className="pt-14 text-center">
          <span className="text-[#c9a84c]">◆ ◆ ◆</span>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.5em] text-[#c9a84c]/70">
            {couple.hashtag ?? `${couple.brideName[0]} & ${couple.groomName[0]}`}
          </p>
        </footer>

      </article>
    </main>
  );
}
