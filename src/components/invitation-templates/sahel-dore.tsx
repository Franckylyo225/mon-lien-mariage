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
 * Sahel Doré — afro-contemporain épuré.
 * Palette sable + or, architecture soudano-sahélienne évoquée par des
 * arches simples et des filets fins. Cormorant italique généreux, aucun
 * motif surchargé — élégance minérale.
 */
export function SahelDoreTemplate({ couple, ceremonies, rsvpSlot }: TemplateProps) {
  const published = ceremonies.filter((c) => c.status === "publiée");
  const accent = couple.accent ?? "#A08234";

  return (
    <main
      className="min-h-screen"
      style={{
        background: "#FAF3E4",
        color: "#3a2a10",
        fontFamily: '"Inter", sans-serif',
      }}
    >
      <article className="mx-auto max-w-lg px-5 pb-24 pt-14 sm:px-8 animate-fade-in">
        <p
          className="text-center text-[10px] uppercase tracking-[0.5em]"
          style={{ color: accent }}
        >
          {couple.caption || "Nous vous invitons"}
        </p>

        {/* Hero cintré par une arche */}
        {couple.heroImageUrl ? (
          <figure
            className="mx-auto mt-8 overflow-hidden"
            style={{
              width: "min(100%, 22rem)",
              aspectRatio: "3 / 4",
              borderRadius: "9999px 9999px 1.5rem 1.5rem",
              border: `1.5px solid ${accent}88`,
              boxShadow: `0 0 0 6px #FAF3E4, 0 0 0 7px ${accent}33`,
            }}
          >
            <img
              src={couple.heroImageUrl}
              alt=""
              className="h-full w-full object-cover"
              style={{ filter: "sepia(0.12) saturate(1.05)" }}
            />
          </figure>
        ) : (
          <div
            className="mx-auto mt-8"
            style={{
              width: "min(100%, 22rem)",
              aspectRatio: "3 / 4",
              borderRadius: "9999px 9999px 1.5rem 1.5rem",
              background: `linear-gradient(180deg, ${accent}22, #e6d5a8)`,
            }}
          />
        )}

        <h1
          className="mt-10 text-center leading-[0.95]"
          style={{ fontFamily: '"Cormorant Garamond", serif' }}
        >
          <span className="block text-[3.5rem] italic">{couple.brideName}</span>
          <span
            className="my-1 block text-2xl italic"
            style={{ color: accent }}
          >
            &amp;
          </span>
          <span className="block text-[3.5rem] italic">{couple.groomName}</span>
        </h1>

        <div className="mx-auto mt-6 flex items-center justify-center gap-3">
          <span className="h-px w-16" style={{ background: accent }} />
          <span style={{ color: accent }} className="text-xs">✦</span>
          <span className="h-px w-16" style={{ background: accent }} />
        </div>

        <p
          className="mt-4 text-center italic"
          style={{ fontFamily: '"Cormorant Garamond", serif' }}
        >
          <span style={{ color: "var(--wedding-accent)" }}>{formatFrenchDate(couple.weddingDate)}</span>
        </p>
        <p className="mt-1 text-center text-[10px] uppercase tracking-[0.35em] opacity-70">
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
                cellBg: "bg-white/60",
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
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            {couple.introMessage}
          </p>
        ) : null}

        <section className="mt-14">
          <div className="mb-6 text-center">
            <p
              className="text-[10px] uppercase tracking-[0.4em]"
              style={{ color: accent }}
            >
              — {eventTypeMeta[couple.eventType ?? "mariage"].programTitle} —
            </p>
          </div>
          <CeremonyProgramTabs
            ceremonies={published}
            variant="gold"
            accent={accent}
          />
        </section>

        {rsvpSlot}

        <GallerySection couple={couple} accent={accent} layout="frames" />

        <TemplateBottomSections
          couple={couple}
          ceremonies={published}
          accent={accent}
        />

        <footer className="pt-14 text-center">
          <div className="mx-auto flex items-center justify-center gap-3">
            <span className="h-px w-20" style={{ background: accent }} />
            <span style={{ color: accent }} className="text-xs">✦</span>
            <span className="h-px w-20" style={{ background: accent }} />
          </div>
          <p className="mt-3 text-[10px] uppercase tracking-[0.4em] opacity-60">
            {couple.hashtag ??
              `${couple.brideName} & ${couple.groomName}`}
          </p>
        </footer>
      </article>
    </main>
  );
}
