import { formatFrenchDate } from "@/lib/wedding-store";
import { eventTypeMeta } from "@/lib/ceremony-meta";
import type { TemplateProps } from "./types";
import { CeremonyProgramTabs } from "./program-tabs";
import { Countdown, GallerySection, OurStorySection, TemplateBottomSections } from "./sections";
import { ScrollIndicator } from "./scroll-indicator";

export function TerracottaTemplate({ couple, ceremonies, rsvpSlot }: TemplateProps) {
  const published = ceremonies.filter((c) => c.status === "publiée");
  const accent = couple.accent ?? "#d97757";

  return (
    <main className="min-h-screen bg-[#faf6f1] text-[#4a2a20]">
      <article className="mx-auto max-w-lg px-5 pb-24 pt-6 sm:px-8">
        <header className="relative overflow-hidden rounded-[2rem] shadow-xl ring-1 ring-black/5">
          {couple.heroImageUrl ? (
            <img
              src={couple.heroImageUrl}
              alt=""
              className="aspect-[3/4] w-full object-cover"
            />
          ) : (
            <div
              className="aspect-[3/4] w-full"
              style={{
                background: `linear-gradient(135deg, #f4e2d4, ${accent}55, #e8c5b6)`,
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#faf6f1] via-[#faf6f1]/10 to-transparent" />
          <div className="absolute bottom-8 left-0 right-0 px-6 text-center">
            <p
              className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em]"
              style={{ color: accent }}
            >
              {couple.caption || "Ils se disent oui"}
            </p>
            <h1 className="text-balance font-serif text-[2.5rem] italic leading-none">
              <span className="block">{couple.brideName}</span>
              <span className="my-1 block text-base not-italic opacity-60">&</span>
              <span className="block">{couple.groomName}</span>
            </h1>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.25em] opacity-70">
              {formatFrenchDate(couple.weddingDate)} · {couple.city}
            </p>
          </div>
        </header>

        <ScrollIndicator accent={accent} />

        {(couple.countdownEnabled ?? true) && (
          <div className="mt-10">
            <Countdown
              targetDate={couple.weddingDate}
            style={couple.countdownStyle}
              units={couple.countdownUnits}
              tone={{
                cellBg: "bg-white",
                cellBorder: "ring-1 ring-[#4a2a20]/10",
                numberClass: `text-3xl font-serif italic`,
              }}
            />
          </div>
        )}

        <OurStorySection couple={couple} accent={accent} />

        <p className="mt-12 text-pretty text-center text-sm italic leading-relaxed opacity-80">
          {couple.introMessage}
        </p>

        <section className="mt-14">
          <div className="mb-8 text-center">
            <span
              className="mx-auto mb-3 block h-px w-10"
              style={{ backgroundColor: accent + "80" }}
            />
            <h2 className="font-serif text-2xl italic">{eventTypeMeta[couple.eventType ?? "mariage"].programTitle}</h2>
          </div>
          <CeremonyProgramTabs ceremonies={published} variant="terracotta" accent={accent} />
        </section>

        {rsvpSlot}

        <GallerySection couple={couple} accent={accent} layout="masonry" />

        <TemplateBottomSections couple={couple} ceremonies={published} accent={accent} />

        <footer className="pt-16 text-center font-mono text-[9px] uppercase tracking-[0.3em] opacity-40">
          {couple.hashtag ?? `MonMariage — ${couple.brideName[0]}&${couple.groomName[0]}`}
        </footer>
      </article>
    </main>
  );
}
