import { formatFrenchDate } from "@/lib/wedding-store";
import { eventTypeMeta } from "@/lib/ceremony-meta";
import type { TemplateProps } from "./types";
import { CeremonyProgramTabs } from "./program-tabs";
import {
  Countdown,
  GallerySection,
  OurStorySection,
  TemplateBottomSections,
} from "./sections";
import { ScrollIndicator } from "./scroll-indicator";

/**
 * Bleu Nuit — éditorial soirée.
 * Fond bleu profond, hero pleine largeur en désaturation légère,
 * typographie Playfair, filets or crème, feel gala/soirée.
 */
export function BleuNuitTemplate({ couple, ceremonies, rsvpSlot }: TemplateProps) {
  const published = ceremonies.filter((c) => c.status === "publiée");
  const accent = couple.accent ?? "#c9b57b";

  return (
    <main
      className="min-h-screen"
      style={{
        background: "#0f1b2d",
        color: "#eae3d0",
        fontFamily: '"Inter", sans-serif',
      }}
    >
      <article className="mx-auto max-w-lg px-5 pb-24 pt-10 sm:px-8 animate-fade-in">
        {couple.heroImageUrl ? (
          <figure className="overflow-hidden rounded-2xl">
            <img
              src={couple.heroImageUrl}
              alt=""
              className="aspect-[3/4] w-full object-cover"
              style={{ filter: "saturate(0.9) brightness(0.92)" }}
            />
          </figure>
        ) : (
          <div
            className="aspect-[3/4] w-full rounded-2xl"
            style={{
              background: `linear-gradient(180deg, #1c2f4b, ${accent}22)`,
            }}
          />
        )}

        <p
          className="mt-10 text-center text-[10px] uppercase tracking-[0.5em]"
          style={{ color: accent }}
        >
          {couple.caption || "An evening to remember"}
        </p>

        <h1
          className="mt-6 text-center leading-[0.95]"
          style={{ fontFamily: '"Playfair Display", serif' }}
        >
          <span className="block text-[3.25rem] italic">{couple.brideName}</span>
          <span
            className="my-2 block text-2xl italic"
            style={{ color: accent }}
          >
            &amp;
          </span>
          <span className="block text-[3.25rem] italic">{couple.groomName}</span>
        </h1>

        <div className="mx-auto mt-6 flex items-center justify-center gap-3">
          <span
            className="h-px w-16"
            style={{ background: accent + "cc" }}
          />
          <span className="text-xs" style={{ color: accent }}>◆</span>
          <span
            className="h-px w-16"
            style={{ background: accent + "cc" }}
          />
        </div>

        <p
          className="mt-4 text-center italic"
          style={{ fontFamily: '"Playfair Display", serif', color: "#eae3d0" }}
        >
          <span style={{ color: "var(--wedding-accent)" }}>{formatFrenchDate(couple.weddingDate)}</span>
        </p>
        <p
          className="mt-1 text-center text-[10px] uppercase tracking-[0.4em]"
          style={{ color: accent + "cc" }}
        >
          {couple.city}
        </p>

        <ScrollIndicator accent={accent} />

        {(couple.countdownEnabled ?? true) && (
          <div className="mt-10">
            <Countdown
              targetDate={couple.weddingDate}
              style={couple.countdownStyle}
              units={couple.countdownUnits}
              tone={{
                cellBg: "bg-white/5",
                cellBorder: "border border-white/15",
                numberClass:
                  'text-3xl italic',
                labelClass:
                  "text-[9px] uppercase tracking-[0.3em] text-[#eae3d0]/60",
              }}
            />
          </div>
        )}

        <OurStorySection couple={couple} accent={accent} />

        {couple.introMessage ? (
          <p
            className="mt-12 text-center text-lg italic leading-relaxed"
            style={{
              fontFamily: '"Playfair Display", serif',
              color: "#eae3d0cc",
            }}
          >
            {couple.introMessage}
          </p>
        ) : null}

        <section className="mt-16">
          <div className="mb-6 flex items-center justify-center gap-3">
            <span className="h-px w-10" style={{ background: accent + "80" }} />
            <p
              className="text-[10px] uppercase tracking-[0.5em]"
              style={{ color: accent }}
            >
              {eventTypeMeta[couple.eventType ?? "mariage"].programTitle}
            </p>
            <span className="h-px w-10" style={{ background: accent + "80" }} />
          </div>
          <CeremonyProgramTabs ceremonies={published} variant="bleu-nuit" />
        </section>

        {rsvpSlot}

        <GallerySection couple={couple} accent={accent} layout="mosaic" />

        <TemplateBottomSections
          couple={couple}
          ceremonies={published}
          accent={accent}
        />

        <footer className="mt-16 border-t border-white/10 pt-6 text-center">
          <p
            className="text-[10px] uppercase tracking-[0.5em]"
            style={{ color: accent + "cc" }}
          >
            {couple.hashtag ??
              `${couple.brideName} & ${couple.groomName}`}
          </p>
        </footer>
      </article>
    </main>
  );
}
