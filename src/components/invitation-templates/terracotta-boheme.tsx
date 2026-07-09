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
 * Terracotta Bohème — bohème terreux.
 * Fond ivoire chaud, palette terracotta/argile, pampas et herbes séchées
 * en illustration, hero portrait aux coins arrondis irréguliers,
 * typographie Cormorant italique + labels manuscrits.
 */
export function TerracottaBohemeTemplate({
  couple,
  ceremonies,
  rsvpSlot,
}: TemplateProps) {
  const published = ceremonies.filter((c) => c.status === "publiée");
  const accent = couple.accent ?? "#B45309";

  return (
    <main
      className="min-h-screen relative overflow-hidden"
      style={{
        background: "#F5EFE7",
        color: "#4a2a1a",
        fontFamily: '"Inter", sans-serif',
      }}
    >
      {/* Pampas d'ambiance */}
      <Pampas
        accent={accent}
        className="pointer-events-none absolute -left-6 top-20 opacity-40"
      />
      <Pampas
        accent={accent}
        flip
        className="pointer-events-none absolute -right-6 top-96 opacity-30"
      />

      <article className="relative mx-auto max-w-lg px-5 pb-24 pt-12 sm:px-8 animate-fade-in">
        <p
          className="text-center text-[10px] uppercase tracking-[0.5em]"
          style={{ color: accent }}
        >
          {couple.caption || "Le jour J"}
        </p>

        <h1
          className="mt-6 text-center leading-[0.95]"
          style={{ fontFamily: '"Cormorant Garamond", serif' }}
        >
          <span className="block text-5xl italic">{couple.brideName}</span>
          <span
            className="my-1 block text-3xl italic"
            style={{ color: accent }}
          >
            &amp;
          </span>
          <span className="block text-5xl italic">{couple.groomName}</span>
        </h1>

        <div className="mx-auto mt-5 flex w-fit items-center gap-2 rounded-full px-4 py-1"
          style={{ background: accent + "18", color: accent }}
        >
          <span className="text-[10px] uppercase tracking-[0.3em]">
            {formatFrenchDate(couple.weddingDate)}
          </span>
          <span className="opacity-60">·</span>
          <span className="text-[10px] uppercase tracking-[0.3em]">
            {couple.city}
          </span>
        </div>

        {couple.heroImageUrl ? (
          <figure
            className="mt-10 overflow-hidden shadow-md ring-1 ring-black/5"
            style={{
              borderRadius: "48% 52% 40% 60% / 55% 45% 55% 45%",
            }}
          >
            <img
              src={couple.heroImageUrl}
              alt=""
              className="aspect-[4/5] w-full object-cover"
              style={{ filter: "sepia(0.1) saturate(1.05)" }}
            />
          </figure>
        ) : (
          <div
            className="mt-10 aspect-[4/5] w-full"
            style={{
              background: `linear-gradient(135deg, ${accent}33, #e8c5a6)`,
              borderRadius: "48% 52% 40% 60% / 55% 45% 55% 45%",
            }}
          />
        )}

        <ScrollIndicator accent={accent} />

        {(couple.countdownEnabled ?? true) && (
          <div className="mt-10">
            <Countdown
              targetDate={couple.weddingDate}
              style={couple.countdownStyle}
              units={couple.countdownUnits}
              tone={{
                cellBg: "bg-white/70",
                cellBorder: "ring-1 ring-black/10",
                numberClass: "text-3xl italic",
                labelClass:
                  "text-[9px] uppercase tracking-[0.3em] opacity-60",
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
            « {couple.introMessage} »
          </p>
        ) : null}

        <section className="mt-14">
          <div className="mb-6 text-center">
            <Pampas accent={accent} small />
            <h2
              className="mt-2 text-2xl italic"
              style={{ fontFamily: '"Cormorant Garamond", serif' }}
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

        <footer className="pt-14 text-center">
          <Pampas accent={accent} small />
          <p className="mt-3 text-[10px] uppercase tracking-[0.4em] opacity-60">
            {couple.hashtag ??
              `${couple.brideName} & ${couple.groomName}`}
          </p>
        </footer>
      </article>
    </main>
  );
}

function Pampas({
  accent,
  flip = false,
  small = false,
  className,
}: {
  accent: string;
  flip?: boolean;
  small?: boolean;
  className?: string;
}) {
  const w = small ? 60 : 140;
  return (
    <svg
      viewBox="0 0 120 220"
      width={w}
      className={"mx-auto " + (className ?? "")}
      style={{ color: accent, transform: flip ? "scaleX(-1)" : undefined }}
      fill="currentColor"
    >
      {[
        { x: 30, delay: 0 },
        { x: 60, delay: 4 },
        { x: 90, delay: -6 },
      ].map(({ x, delay }, i) => (
        <g key={i} opacity={0.85 - i * 0.15}>
          <rect x={x - 0.5} y="60" width="1" height="150" />
          {Array.from({ length: 18 }).map((_, k) => {
            const y = 60 + k * 3 + delay;
            const len = 10 - Math.abs(k - 9) * 0.5;
            return (
              <g key={k}>
                <ellipse cx={x - len / 2} cy={y} rx={len / 2} ry="1" transform={`rotate(-25 ${x - len / 2} ${y})`} />
                <ellipse cx={x + len / 2} cy={y} rx={len / 2} ry="1" transform={`rotate(25 ${x + len / 2} ${y})`} />
              </g>
            );
          })}
        </g>
      ))}
    </svg>
  );
}
