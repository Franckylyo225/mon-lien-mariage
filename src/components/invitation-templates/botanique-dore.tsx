import { formatFrenchDate } from "@/lib/wedding-store";
import { eventTypeMeta } from "@/lib/ceremony-meta";
import type { TemplateProps } from "./types";
import { CeremonyProgramTabs } from "./program-tabs";
import { Countdown, GallerySection, OurStorySection, TemplateBottomSections } from "./sections";
import { ScrollIndicator } from "./scroll-indicator";

export function BotaniqueDoreTemplate({ couple, ceremonies, rsvpSlot }: TemplateProps) {
  const published = ceremonies.filter((c) => c.status === "publiée");

  return (
    <main className="min-h-screen bg-[#f5f0e4] text-[#3d4a2d]">
      <article className="mx-auto max-w-lg px-5 pb-24 pt-10 sm:px-8">
        <div className="relative rounded-[2rem] border border-[#c9a84c]/40 bg-[#faf6ec] p-8 text-center shadow-sm">
          {/* Corners */}
          <Corner className="absolute left-3 top-3" />
          <Corner className="absolute right-3 top-3 rotate-90" />
          <Corner className="absolute bottom-3 left-3 -rotate-90" />
          <Corner className="absolute bottom-3 right-3 rotate-180" />

          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#c9a84c]">
            {couple.caption || "Faire — part"}
          </p>
          <p className="mt-8 font-serif text-lg italic opacity-70">
            Nous avons l'honneur de vous convier au mariage de
          </p>
          <h1 className="mt-6 font-serif text-5xl italic leading-tight">
            <span className="block">{couple.brideName}</span>
            <span className="my-1 block text-[#c9a84c]">&</span>
            <span className="block">{couple.groomName}</span>
          </h1>
          <div className="mx-auto my-6 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-[#c9a84c]" />
            <span className="text-[#c9a84c]">❦</span>
            <span className="h-px w-8 bg-[#c9a84c]" />
          </div>
          <p className="font-serif italic">{formatFrenchDate(couple.weddingDate)}</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest opacity-60">
            {couple.city}
          </p>
        </div>

        {couple.heroImageUrl ? (
          <img
            src={couple.heroImageUrl}
            alt=""
            className="mt-8 aspect-[4/5] w-full rounded-3xl object-cover ring-1 ring-[#c9a84c]/30"
          />
        ) : null}

        <ScrollIndicator accent="#c9a84c" />

        {(couple.countdownEnabled ?? true) && (
          <div className="mt-8">
            <Countdown
              targetDate={couple.weddingDate}
            style={couple.countdownStyle}
              units={couple.countdownUnits}
              tone={{
                cellBg: "bg-[#faf6ec]",
                cellBorder: "border border-[#c9a84c]/30",
                numberClass: "text-3xl font-serif italic text-[#3d4a2d]",
                labelClass:
                  "font-mono text-[9px] uppercase tracking-[0.25em] text-[#c9a84c]",
              }}
            />
          </div>
        )}

        <OurStorySection couple={couple} accent="#c9a84c" />

        <p className="mt-10 text-center font-serif italic leading-relaxed opacity-80">
          {couple.introMessage}
        </p>

        <section className="mt-12">
          <div className="text-center">
            <span className="text-2xl text-[#c9a84c]">❦</span>
            <h2 className="mt-1 font-serif text-2xl italic">{eventTypeMeta[couple.eventType ?? "mariage"].programTitle}</h2>
          </div>
          <div className="mt-8">
            <CeremonyProgramTabs ceremonies={published} variant="gold" />
          </div>
        </section>

        {rsvpSlot}

        <TemplateBottomSections couple={couple} ceremonies={published} accent="#c9a84c" />

        <footer className="pt-12 text-center font-serif italic text-[#c9a84c]">
          ❦ {couple.hashtag ?? `${couple.brideName} & ${couple.groomName}`} ❦
        </footer>
      </article>
    </main>
  );
}

function Corner({ className }: { className: string }) {
  return (
    <svg
      className={"size-8 text-[#c9a84c] " + className}
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <path d="M2 20 Q2 2 20 2" />
      <path d="M8 20 Q8 8 20 8" opacity="0.5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}
