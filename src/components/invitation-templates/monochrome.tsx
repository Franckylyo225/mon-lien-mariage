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
 * Monochrome — brutaliste architectural.
 * Grille visible, angles nets, Inter uniquement, absence totale d'ornement.
 * Blocs contrastés noir sur blanc, labels majuscules, hero pleine largeur
 * en carré.
 */
export function MonochromeTemplate({ couple, ceremonies, rsvpSlot }: TemplateProps) {
  const published = ceremonies.filter((c) => c.status === "publiée");
  const accent = couple.accent ?? "#000000";

  return (
    <main
      className="min-h-screen"
      style={{
        background: "#ffffff",
        color: "#000",
        fontFamily: '"Inter", sans-serif',
      }}
    >
      <article className="mx-auto max-w-2xl px-5 pb-24 pt-10 sm:px-10 animate-fade-in">
        {/* Grid header */}
        <header className="grid grid-cols-4 gap-2 border-y-2 border-black py-3 text-[10px] uppercase tracking-[0.25em]">
          <span className="col-span-2 font-semibold">
            {couple.caption || "Wedding"}
          </span>
          <span className="text-right tabular-nums">
            {formatFrenchDate(couple.weddingDate)}
          </span>
          <span className="text-right">{couple.city}</span>
        </header>

        {couple.heroImageUrl ? (
          <img
            src={couple.heroImageUrl}
            alt=""
            className="mt-4 aspect-square w-full object-cover"
            style={{ filter: "grayscale(1) contrast(1.05)" }}
          />
        ) : (
          <div
            className="mt-4 aspect-square w-full"
            style={{ background: "#111" }}
          />
        )}

        <h1
          className="mt-10 leading-[0.85] tracking-tight"
          style={{ fontFamily: '"Inter", sans-serif', fontWeight: 800 }}
        >
          <span className="block text-[3.25rem] uppercase sm:text-[5rem]">
            {couple.brideName}
          </span>
          <span className="my-1 block text-2xl font-normal uppercase opacity-40 sm:text-3xl">
            × &nbsp;
          </span>
          <span className="block text-[3.25rem] uppercase sm:text-[5rem]">
            {couple.groomName}
          </span>
        </h1>

        <ScrollIndicator accent={accent} />

        {(couple.countdownEnabled ?? true) && (
          <>
            <div className="mt-14 border-t-2 border-black pt-3 text-[10px] uppercase tracking-[0.35em]">
              Countdown
            </div>
            <div className="mt-4">
              <Countdown
                targetDate={couple.weddingDate}
                style={couple.countdownStyle}
                units={couple.countdownUnits}
                tone={{
                  cellBg: "bg-white",
                  cellBorder: "border-2 border-black",
                  numberClass:
                    "text-4xl font-bold tabular-nums",
                  labelClass:
                    "text-[9px] uppercase tracking-[0.35em]",
                }}
              />
            </div>
          </>
        )}

        <OurStorySection couple={couple} accent={accent} />

        {couple.introMessage ? (
          <p className="mt-14 max-w-xl text-base leading-relaxed">
            {couple.introMessage}
          </p>
        ) : null}

        <div className="mt-16 border-t-2 border-black pt-3 text-[10px] uppercase tracking-[0.35em]">
          {eventTypeMeta[couple.eventType ?? "mariage"].programTitle}
        </div>
        <div className="mt-6">
          <CeremonyProgramTabs ceremonies={published} variant="noir" />
        </div>

        {rsvpSlot}

        <GallerySection couple={couple} accent={accent} />

        <TemplateBottomSections
          couple={couple}
          ceremonies={published}
          accent={accent}
        />

        <footer className="mt-16 flex items-baseline justify-between border-t-2 border-black pt-3 text-[10px] uppercase tracking-[0.35em]">
          <span>{couple.hashtag ?? `${couple.brideName} × ${couple.groomName}`}</span>
          <span className="tabular-nums">— 001</span>
        </footer>
      </article>
    </main>
  );
}
