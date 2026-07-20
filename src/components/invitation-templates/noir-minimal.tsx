import { formatFrenchDate } from "@/lib/wedding-store";
import { eventTypeMeta } from "@/lib/ceremony-meta";
import type { TemplateProps } from "./types";
import { CeremonyProgramTabs } from "./program-tabs";
import { Countdown, GallerySection, OurStorySection, TemplateBottomSections } from "./sections";
import { ScrollIndicator } from "./scroll-indicator";

export function NoirMinimalTemplate({ couple, ceremonies, rsvpSlot }: TemplateProps) {
  const published = ceremonies.filter((c) => c.status === "publiée");

  return (
    <main className="min-h-screen bg-[#0d0d0d] text-[#f5f3ee]">
      <article className="mx-auto max-w-2xl px-6 pb-24 pt-16 sm:px-10">
        {couple.heroImageUrl ? (
          <img
            src={couple.heroImageUrl}
            alt=""
            className="mb-12 aspect-[16/10] w-full object-cover grayscale"
          />
        ) : null}

        <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-[#f5f3ee]/50">
          {couple.caption || "Save — the — date"}
        </p>
        <div className="mt-12 border-y border-[#f5f3ee]/15 py-16">
          <h1 className="text-center text-6xl font-medium leading-[0.9] tracking-tight sm:text-8xl">
            <span className="block">{couple.brideName}</span>
            <span className="my-2 block font-serif text-4xl italic text-[#f5f3ee]/50 sm:text-5xl">
              &
            </span>
            <span className="block">{couple.groomName}</span>
          </h1>
          <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.4em] text-[#f5f3ee]/60">
            <span style={{ color: "var(--wedding-accent)" }}>{formatFrenchDate(couple.weddingDate)}</span> · {couple.city}
          </p>
        </div>

        <ScrollIndicator accent="#f5f3ee" />

        {(couple.countdownEnabled ?? true) && (
          <div className="mt-10">
            <Countdown
              targetDate={couple.weddingDate}
            style={couple.countdownStyle}
              units={couple.countdownUnits}
              tone={{
                cellBg: "bg-[#f5f3ee]/5",
                cellBorder: "border border-[#f5f3ee]/15",
                numberClass: "text-3xl font-medium tracking-tight text-[#f5f3ee]",
                labelClass:
                  "font-mono text-[9px] uppercase tracking-[0.3em] text-[#f5f3ee]/50",
              }}
            />
          </div>
        )}

        <OurStorySection couple={couple} accent="#f5f3ee" />

        <p className="mt-12 text-center text-sm leading-relaxed text-[#f5f3ee]/70">
          {couple.introMessage}
        </p>

        <section className="mt-16">
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#f5f3ee]/50">
            {eventTypeMeta[couple.eventType ?? "mariage"].programTitle}
          </p>
          <div className="mt-6">
            <CeremonyProgramTabs ceremonies={published} variant="noir" />
          </div>
        </section>

        {rsvpSlot}

        <GallerySection couple={couple} accent="#f5f3ee" layout="mosaic" />

        <TemplateBottomSections couple={couple} ceremonies={published} accent="#f5f3ee" />

        <footer className="mt-16 border-t border-[#f5f3ee]/15 pt-8 text-center font-mono text-[10px] uppercase tracking-[0.4em] text-[#f5f3ee]/40">
          {couple.hashtag ?? formatFrenchDate(couple.weddingDate)}
        </footer>
      </article>
    </main>
  );
}

