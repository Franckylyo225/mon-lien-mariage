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
 * Wax Doré — héritage ivoirien.
 * Bandeaux de motifs wax stylisés (losanges, éventails, cauris) encadrant
 * le hero, palette terre-cuite + or, Playfair pour les noms.
 */
export function WaxDoreTemplate({ couple, ceremonies, rsvpSlot }: TemplateProps) {
  const published = ceremonies.filter((c) => c.status === "publiée");
  const accent = couple.accent ?? "#B45309";

  return (
    <main
      className="min-h-screen"
      style={{
        background: "#F5EFE7",
        color: "#3a1f0f",
        fontFamily: '"Inter", sans-serif',
      }}
    >
      <article className="mx-auto max-w-lg px-5 pb-24 pt-6 sm:px-8 animate-fade-in">
        <WaxBand accent={accent} />

        <p
          className="mt-8 text-center text-[10px] uppercase tracking-[0.5em]"
          style={{ color: accent }}
        >
          {couple.caption || "Un mariage aux couleurs de nos racines"}
        </p>

        <h1
          className="mt-6 text-center leading-[0.95]"
          style={{ fontFamily: '"Playfair Display", serif' }}
        >
          <span className="block text-[3rem] italic">{couple.brideName}</span>
          <span className="my-2 block text-2xl" style={{ color: accent }}>
            ✦
          </span>
          <span className="block text-[3rem] italic">{couple.groomName}</span>
        </h1>

        <p
          className="mt-6 text-center italic"
          style={{
            fontFamily: '"Playfair Display", serif',
            color: accent,
          }}
        >
          {formatFrenchDate(couple.weddingDate)}
        </p>
        <p className="mt-1 text-center text-[10px] uppercase tracking-[0.35em] opacity-70">
          {couple.city}
        </p>

        {couple.heroImageUrl ? (
          <figure
            className="mt-8 overflow-hidden rounded-3xl"
            style={{ border: `2px solid ${accent}66` }}
          >
            <img
              src={couple.heroImageUrl}
              alt=""
              className="aspect-[4/5] w-full object-cover"
              style={{ filter: "saturate(1.08)" }}
            />
          </figure>
        ) : null}

        <WaxBand accent={accent} className="mt-8" />

        <ScrollIndicator accent={accent} />

        {(couple.countdownEnabled ?? true) && (
          <div className="mt-8">
            <Countdown
              targetDate={couple.weddingDate}
              style={couple.countdownStyle}
              units={couple.countdownUnits}
              tone={{
                cellBg: "bg-white/70",
                cellBorder: "border",
                numberClass: "text-3xl italic",
                labelClass:
                  "text-[9px] uppercase tracking-[0.3em] opacity-70",
              }}
            />
          </div>
        )}

        <OurStorySection couple={couple} accent={accent} />

        {couple.introMessage ? (
          <p
            className="mt-12 text-center text-lg italic leading-relaxed"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            {couple.introMessage}
          </p>
        ) : null}

        <section className="mt-14">
          <div className="mb-6 text-center">
            <span style={{ color: accent }}>✦ ✦ ✦</span>
            <h2
              className="mt-2 text-2xl italic"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              {eventTypeMeta[couple.eventType ?? "mariage"].programTitle}
            </h2>
          </div>
          <CeremonyProgramTabs
            ceremonies={published}
            variant="terracotta"
            accent={accent}
          />
        </section>

        {rsvpSlot}

        <GallerySection couple={couple} accent={accent} />

        <TemplateBottomSections
          couple={couple}
          ceremonies={published}
          accent={accent}
        />

        <WaxBand accent={accent} className="mt-14" />
        <footer className="pt-6 text-center">
          <p className="text-[10px] uppercase tracking-[0.4em] opacity-60">
            {couple.hashtag ??
              `${couple.brideName} & ${couple.groomName}`}
          </p>
        </footer>
      </article>
    </main>
  );
}

function WaxBand({ accent, className }: { accent: string; className?: string }) {
  const patternId = `wax-${accent.replace("#", "")}`;
  return (
    <svg
      viewBox="0 0 360 40"
      className={"w-full " + (className ?? "")}
      style={{ color: accent }}
      fill="currentColor"
      aria-hidden
    >
      <defs>
        <pattern id={patternId} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          {/* Losange central */}
          <path d="M20 6 L34 20 L20 34 L6 20 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <path d="M20 12 L28 20 L20 28 L12 20 Z" fill="currentColor" opacity="0.35" />
          <circle cx="20" cy="20" r="1.6" />
          {/* Éventail / rayons */}
          <path d="M0 20 L6 18 M0 20 L6 22" stroke="currentColor" strokeWidth="0.9" fill="none" />
          <path d="M40 20 L34 18 M40 20 L34 22" stroke="currentColor" strokeWidth="0.9" fill="none" />
          {/* Cauris */}
          <ellipse cx="20" cy="2" rx="3" ry="1.2" opacity="0.6" />
          <ellipse cx="20" cy="38" rx="3" ry="1.2" opacity="0.6" />
        </pattern>
      </defs>
      <rect width="360" height="40" fill={`url(#${patternId})`} />
    </svg>
  );
}
