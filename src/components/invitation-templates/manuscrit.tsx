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
 * Manuscrit — magazine mode.
 * Codes édito : folios numérotés en marge, gros titres Cormorant italique
 * cadrés à gauche, colonne de lead paragraph, hero paysage plein-largeur,
 * accent noir. Sensations d'une double page de mode.
 */
export function ManuscritTemplate({ couple, ceremonies, rsvpSlot }: TemplateProps) {
  const published = ceremonies.filter((c) => c.status === "publiée");
  const accent = couple.accent ?? "#1A1A1A";

  return (
    <main
      className="min-h-screen"
      style={{
        background: "#ffffff",
        color: "#111",
        fontFamily: '"Inter", sans-serif',
      }}
    >
      <article className="mx-auto max-w-2xl px-5 pb-24 pt-12 sm:px-10 animate-fade-in">
        <Folio n="01" label={couple.caption || "Éditorial"} accent={accent} />

        <h1
          className="mt-6 leading-[0.85] tracking-tight"
          style={{ fontFamily: '"Cormorant Garamond", serif' }}
        >
          <span className="block text-[4rem] italic sm:text-[6rem]">
            {couple.brideName}
          </span>
          <span
            className="block text-[4rem] italic sm:text-[6rem]"
            style={{ color: accent + "80" }}
          >
            &amp;&nbsp;{couple.groomName}
          </span>
        </h1>

        <div className="mt-8 grid grid-cols-[auto_1fr] items-start gap-4">
          <span
            className="mt-2 h-8 w-px"
            style={{ background: accent }}
          />
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] opacity-60">
              {formatFrenchDate(couple.weddingDate)} — {couple.city}
            </p>
            {couple.introMessage ? (
              <p
                className="mt-3 text-lg leading-relaxed"
                style={{ fontFamily: '"Cormorant Garamond", serif' }}
              >
                {couple.introMessage}
              </p>
            ) : null}
          </div>
        </div>

        {couple.heroImageUrl ? (
          <img
            src={couple.heroImageUrl}
            alt=""
            className="mt-12 aspect-[16/10] w-full object-cover"
          />
        ) : null}

        <ScrollIndicator accent={accent} />

        {(couple.countdownEnabled ?? true) && (
          <>
            <Folio n="02" label="Compte à rebours" accent={accent} className="mt-14" />
            <div className="mt-6">
              <Countdown
                targetDate={couple.weddingDate}
                style={couple.countdownStyle}
                units={couple.countdownUnits}
                tone={{
                  cellBg: "bg-transparent",
                  cellBorder: "border border-black/15",
                  numberClass:
                    "text-4xl italic",
                  labelClass:
                    "text-[9px] uppercase tracking-[0.35em] opacity-50",
                }}
              />
            </div>
          </>
        )}

        <OurStorySection couple={couple} accent={accent} />

        <Folio
          n="03"
          label={eventTypeMeta[couple.eventType ?? "mariage"].programTitle}
          accent={accent}
          className="mt-16"
        />
        <div className="mt-6 border-t border-black/10 pt-6">
          <CeremonyProgramTabs ceremonies={published} variant="noir" />
        </div>

        {rsvpSlot}

        <GallerySection couple={couple} accent={accent} layout="mosaic" />

        <TemplateBottomSections
          couple={couple}
          ceremonies={published}
          accent={accent}
        />

        <footer className="mt-20 flex items-baseline justify-between border-t border-black/10 pt-6 text-[10px] uppercase tracking-[0.4em] opacity-50">
          <span>{couple.hashtag ?? `${couple.brideName} & ${couple.groomName}`}</span>
          <span>— fin —</span>
        </footer>
      </article>
    </main>
  );
}

function Folio({
  n,
  label,
  accent,
  className,
}: {
  n: string;
  label: string;
  accent: string;
  className?: string;
}) {
  return (
    <div className={"flex items-baseline gap-3 " + (className ?? "")}>
      <span
        className="text-xs font-semibold tabular-nums"
        style={{ color: accent }}
      >
        № {n}
      </span>
      <span
        className="h-px flex-1"
        style={{ background: accent + "40" }}
      />
      <span
        className="text-[10px] uppercase tracking-[0.4em]"
        style={{ color: accent }}
      >
        {label}
      </span>
    </div>
  );
}
