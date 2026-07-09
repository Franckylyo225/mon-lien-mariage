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
 * Papier Kraft — carte postale vintage.
 * Fond kraft texturé, cachets postaux SVG, typographie machine à écrire
 * (Special Elite) mêlée à Cormorant, filets bordés et timbres décoratifs.
 */
function PostalStamp({
  accent,
  className,
}: {
  accent: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 60"
      className={className}
      aria-hidden
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Circular postmark */}
      <g fill="none" stroke={accent} strokeWidth="1.2" opacity="0.7">
        <circle cx="50" cy="30" r="22" />
        <circle cx="50" cy="30" r="17" strokeDasharray="1.5 1.5" />
      </g>
      <text
        x="50"
        y="27"
        textAnchor="middle"
        fontSize="6"
        fill={accent}
        opacity="0.75"
        style={{ fontFamily: '"Special Elite", monospace' }}
      >
        PAR AVION
      </text>
      <line x1="30" y1="32" x2="70" y2="32" stroke={accent} opacity="0.5" strokeWidth="0.6" />
      <text
        x="50"
        y="40"
        textAnchor="middle"
        fontSize="4.5"
        fill={accent}
        opacity="0.7"
        style={{ fontFamily: '"Special Elite", monospace' }}
      >
        SAVE THE DATE
      </text>
    </svg>
  );
}

export function PapierKraftTemplate({ couple, ceremonies, rsvpSlot }: TemplateProps) {
  const published = ceremonies.filter((c) => c.status === "publiée");
  const accent = couple.accent ?? "#8b3a1f";

  const kraftBg =
    "radial-gradient(circle at 20% 15%, rgba(255,255,255,0.15), transparent 45%)," +
    "radial-gradient(circle at 80% 85%, rgba(0,0,0,0.08), transparent 45%)," +
    "linear-gradient(180deg, #d6b48a 0%, #c69c6d 100%)";

  return (
    <main
      className="relative min-h-screen"
      style={{
        background: kraftBg,
        color: "#3b2617",
        fontFamily: '"Special Elite", "Courier New", monospace',
      }}
    >
      <article className="relative mx-auto max-w-lg px-5 pb-24 pt-10 sm:px-8 animate-fade-in">
        {/* Postcard card */}
        <div
          className="rounded-md p-5 sm:p-7 shadow-xl"
          style={{
            background: "#f4e4c8",
            border: "1px solid #7a5a3a55",
            boxShadow:
              "0 1px 0 #fff8 inset, 0 20px 40px -20px rgba(60,35,15,0.5)",
          }}
        >
          {/* Header: par avion stripes + stamp */}
          <div className="flex items-start justify-between gap-3">
            <div
              className="h-3 flex-1 rounded-sm"
              style={{
                background:
                  "repeating-linear-gradient(45deg, #b23a2e 0 8px, transparent 8px 16px, #1e3a6e 16px 24px, transparent 24px 32px)",
                opacity: 0.7,
              }}
            />
            <PostalStamp accent={accent} className="h-14 w-24 shrink-0" />
          </div>

          <p
            className="mt-5 text-center text-[11px] uppercase tracking-[0.4em]"
            style={{ color: accent }}
          >
            {couple.caption || "carte postale"}
          </p>

          <h1
            className="mt-4 text-center leading-tight"
            style={{ fontFamily: '"Cormorant Garamond", serif', color: "#3b2617" }}
          >
            <span className="block text-5xl italic">{couple.brideName}</span>
            <span
              className="my-2 block text-2xl"
              style={{ color: accent, fontFamily: '"Special Elite", monospace' }}
            >
              + 
            </span>
            <span className="block text-5xl italic">{couple.groomName}</span>
          </h1>

          {couple.heroImageUrl ? (
            <figure
              className="mx-auto mt-6 w-full overflow-hidden"
              style={{
                border: "6px solid #f4e4c8",
                outline: `1px solid ${accent}55`,
                filter: "sepia(0.15) saturate(0.9)",
              }}
            >
              <img
                src={couple.heroImageUrl}
                alt=""
                className="aspect-[4/3] w-full object-cover"
              />
            </figure>
          ) : (
            <div
              className="mx-auto mt-6 aspect-[4/3] w-full"
              style={{
                border: "6px solid #f4e4c8",
                outline: `1px solid ${accent}55`,
                background:
                  "linear-gradient(135deg, #b98a5a 0%, #8b6540 100%)",
              }}
            />
          )}

          <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <span className="h-px" style={{ background: `${accent}66` }} />
            <p
              className="text-center text-sm uppercase tracking-[0.3em]"
              style={{ color: accent }}
            >
              {formatFrenchDate(couple.weddingDate)}
            </p>
            <span className="h-px" style={{ background: `${accent}66` }} />
          </div>
          <p
            className="mt-1 text-center text-[11px] uppercase tracking-[0.4em]"
            style={{ color: "#5a3d24" }}
          >
            ✈ {couple.city} ✈
          </p>
        </div>

        <ScrollIndicator accent={accent} />

        {(couple.countdownEnabled ?? true) && (
          <div className="mt-10">
            <Countdown
              targetDate={couple.weddingDate}
              style={couple.countdownStyle}
              units={couple.countdownUnits}
              tone={{
                cellBg: "bg-[#f4e4c8]",
                cellBorder: "border border-[#8b3a1f]/40",
                numberClass:
                  'text-3xl text-[#3b2617]',
                labelClass:
                  "text-[9px] uppercase tracking-[0.3em] text-[#5a3d24]",
              }}
            />
          </div>
        )}

        <OurStorySection couple={couple} accent={accent} />

        {couple.introMessage ? (
          <p
            className="mt-12 text-center text-base leading-relaxed"
            style={{
              fontFamily: '"Special Elite", "Courier New", monospace',
              color: "#3b2617",
            }}
          >
            {couple.introMessage}
          </p>
        ) : null}

        <section className="mt-16">
          <div className="mb-6 text-center">
            <p
              className="text-[11px] uppercase tracking-[0.45em]"
              style={{ color: accent }}
            >
              ✉ {eventTypeMeta[couple.eventType ?? "mariage"].programTitle} ✉
            </p>
          </div>
          <CeremonyProgramTabs ceremonies={published} variant="terracotta" />
        </section>

        {rsvpSlot}

        <GallerySection couple={couple} accent={accent} layout="polaroid" />

        <TemplateBottomSections
          couple={couple}
          ceremonies={published}
          accent={accent}
        />

        <footer className="mt-16 pt-6 text-center">
          <p
            className="inline-block px-4 py-1 text-[11px] uppercase tracking-[0.5em]"
            style={{
              border: `1px dashed ${accent}88`,
              color: accent,
            }}
          >
            {couple.hashtag ?? `${couple.brideName} & ${couple.groomName}`}
          </p>
        </footer>
      </article>
    </main>
  );
}
