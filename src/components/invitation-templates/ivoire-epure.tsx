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
 * Ivoire Épuré — minimaliste éditorial.
 * Blanc cassé, hero pleine largeur en paysage, typographie Cormorant Garamond
 * démesurée, filets ultra-fins, aucun ornement. Aligne le rythme sur une
 * grille verticale généreuse.
 */
export function IvoireEpureTemplate({ couple, ceremonies, rsvpSlot }: TemplateProps) {
  const published = ceremonies.filter((c) => c.status === "publiée");
  const accent = couple.accent ?? "#1A1A1A";

  return (
    <main
      className="min-h-screen"
      style={{
        background: "#FAF8F3",
        color: "#1A1A1A",
        fontFamily: '"Inter", sans-serif',
      }}
    >
      <article className="mx-auto max-w-2xl px-5 pb-24 pt-16 sm:px-10 animate-fade-in">
        <p className="text-[10px] uppercase tracking-[0.5em] opacity-50">
          {couple.caption || "Save the date"}
        </p>

        {couple.heroImageUrl ? (
          <img
            src={couple.heroImageUrl}
            alt=""
            className="mt-8 aspect-[16/10] w-full object-cover"
          />
        ) : (
          <div
            className="mt-8 aspect-[16/10] w-full"
            style={{ background: "#EFEAE0" }}
          />
        )}

        <div className="mt-14">
          <h1
            className="text-left leading-[0.88] tracking-tight"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            <span className="block text-[3.75rem] italic sm:text-[6rem]">
              {couple.brideName}
            </span>
            <span
              className="my-2 block text-2xl italic opacity-50 sm:text-3xl"
            >
              et
            </span>
            <span className="block text-[3.75rem] italic sm:text-[6rem]">
              {couple.groomName}
            </span>
          </h1>
        </div>

        <div className="mt-10 flex items-center gap-4 border-t border-black/10 pt-6">
          <p className="text-[10px] uppercase tracking-[0.4em] opacity-70">
            {formatFrenchDate(couple.weddingDate)}
          </p>
          <span className="h-px flex-1" style={{ background: accent + "30" }} />
          <p className="text-[10px] uppercase tracking-[0.4em] opacity-70">
            {couple.city}
          </p>
        </div>

        <ScrollIndicator accent={accent} />

        {(couple.countdownEnabled ?? true) && (
          <div className="mt-14">
            <Countdown
              targetDate={couple.weddingDate}
              style={couple.countdownStyle}
              units={couple.countdownUnits}
              tone={{
                cellBg: "bg-transparent",
                cellBorder: "border border-black/10",
                numberClass:
                  "text-4xl italic",
                labelClass:
                  "text-[9px] uppercase tracking-[0.35em] opacity-50",
              }}
            />
          </div>
        )}

        <OurStorySection couple={couple} accent={accent} />

        {couple.introMessage ? (
          <p
            className="mt-16 max-w-xl text-lg italic leading-relaxed"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            {couple.introMessage}
          </p>
        ) : null}

        <section className="mt-20">
          <p className="text-[10px] uppercase tracking-[0.5em] opacity-50">
            {eventTypeMeta[couple.eventType ?? "mariage"].programTitle}
          </p>
          <div className="mt-6 border-t border-black/10 pt-6">
            <CeremonyProgramTabs ceremonies={published} variant="noir" />
          </div>
        </section>

        {rsvpSlot}

        <GallerySection couple={couple} accent={accent} />

        <TemplateBottomSections
          couple={couple}
          ceremonies={published}
          accent={accent}
        />

        <footer className="mt-20 border-t border-black/10 pt-8 text-[10px] uppercase tracking-[0.5em] opacity-40">
          {couple.hashtag ?? formatFrenchDate(couple.weddingDate)}
        </footer>
      </article>
    </main>
  );
}
