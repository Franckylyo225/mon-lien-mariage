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
 * Kente Royal — royal cérémoniel.
 * Bandes tissées horizontales (jaune / vert / rouge / noir) rythment la
 * page comme une étoffe kente. Typographie Playfair, palette bordeaux + or.
 * Aucune icône ivoirienne exposée, uniquement des rectangles et symboles
 * géométriques stylisés.
 */
export function KenteRoyalTemplate({ couple, ceremonies, rsvpSlot }: TemplateProps) {
  const published = ceremonies.filter((c) => c.status === "publiée");
  const accent = couple.accent ?? "#993556";

  return (
    <main
      className="min-h-screen"
      style={{
        background: "#1a0e12",
        color: "#f7ecd6",
        fontFamily: '"Inter", sans-serif',
      }}
    >
      <article className="mx-auto max-w-lg px-5 pb-24 pt-6 sm:px-8 animate-fade-in">
        <KenteStrip />

        <div className="mt-8 text-center">
          <p
            className="text-[10px] uppercase tracking-[0.5em]"
            style={{ color: "#d4a24d" }}
          >
            {couple.caption || "Cérémonie royale"}
          </p>

          <h1
            className="mt-6 leading-[0.95]"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            <span className="block text-[3rem] italic">{couple.brideName}</span>
            <span
              className="my-2 block text-2xl"
              style={{ color: "#d4a24d" }}
            >
              ◆
            </span>
            <span className="block text-[3rem] italic">{couple.groomName}</span>
          </h1>

          <div className="mx-auto mt-6 flex items-center justify-center gap-3">
            <span
              className="h-px w-14"
              style={{ background: "#d4a24d" }}
            />
            <span
              className="rotate-45 text-xs"
              style={{ color: "#d4a24d" }}
            >
              ◆
            </span>
            <span
              className="h-px w-14"
              style={{ background: "#d4a24d" }}
            />
          </div>

          <p
            className="mt-5 italic"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            {formatFrenchDate(couple.weddingDate)}
          </p>
          <p
            className="mt-1 text-[10px] uppercase tracking-[0.4em]"
            style={{ color: "#d4a24d" }}
          >
            {couple.city}
          </p>
        </div>

        {couple.heroImageUrl ? (
          <figure
            className="mt-10 overflow-hidden rounded-2xl"
            style={{ border: `2px solid #d4a24d66` }}
          >
            <img
              src={couple.heroImageUrl}
              alt=""
              className="aspect-[4/5] w-full object-cover"
              style={{ filter: "saturate(1.1)" }}
            />
          </figure>
        ) : null}

        <KenteStrip className="mt-10" />

        <ScrollIndicator accent="#d4a24d" />

        {(couple.countdownEnabled ?? true) && (
          <div className="mt-8">
            <Countdown
              targetDate={couple.weddingDate}
              style={couple.countdownStyle}
              units={couple.countdownUnits}
              tone={{
                cellBg: "bg-white/5",
                cellBorder: "border border-[#d4a24d]/40",
                numberClass:
                  'text-3xl italic',
                labelClass:
                  "text-[9px] uppercase tracking-[0.3em] text-[#d4a24d]/80",
              }}
            />
          </div>
        )}

        <OurStorySection couple={couple} accent={accent} />

        {couple.introMessage ? (
          <p
            className="mt-12 text-center text-lg italic leading-relaxed"
            style={{ fontFamily: '"Playfair Display", serif', color: "#f7ecd6cc" }}
          >
            {couple.introMessage}
          </p>
        ) : null}

        <section className="mt-14">
          <div className="mb-6 text-center">
            <p
              className="text-[10px] uppercase tracking-[0.5em]"
              style={{ color: "#d4a24d" }}
            >
              — {eventTypeMeta[couple.eventType ?? "mariage"].programTitle} —
            </p>
          </div>
          <CeremonyProgramTabs ceremonies={published} variant="deco" />
        </section>

        {rsvpSlot}

        <GallerySection couple={couple} accent={accent} layout="frames" />

        <TemplateBottomSections
          couple={couple}
          ceremonies={published}
          accent={accent}
        />

        <KenteStrip className="mt-14" />
        <footer className="pt-6 text-center">
          <p
            className="text-[10px] uppercase tracking-[0.5em]"
            style={{ color: "#d4a24d" }}
          >
            {couple.hashtag ??
              `${couple.brideName} & ${couple.groomName}`}
          </p>
        </footer>
      </article>
    </main>
  );
}

function KenteStrip({ className }: { className?: string }) {
  // Bandes horizontales colorées avec micro-motifs
  const rows = [
    { c: "#d4a24d", h: 8 }, // or
    { c: "#0f0a0d", h: 4 }, // noir
    { c: "#4a7c3a", h: 6 }, // vert
    { c: "#0f0a0d", h: 3 },
    { c: "#993556", h: 7 }, // rouge/bordeaux
    { c: "#0f0a0d", h: 3 },
    { c: "#d4a24d", h: 8 },
  ];
  let y = 0;
  return (
    <svg
      viewBox="0 0 360 44"
      className={"w-full " + (className ?? "")}
      aria-hidden
    >
      {rows.map((r, i) => {
        const yy = y;
        y += r.h;
        return (
          <g key={i}>
            <rect x="0" y={yy} width="360" height={r.h} fill={r.c} />
            {r.h >= 6 &&
              Array.from({ length: 18 }).map((_, k) => (
                <rect
                  key={k}
                  x={20 * k + 6}
                  y={yy + 1}
                  width="8"
                  height={r.h - 2}
                  fill={r.c === "#d4a24d" ? "#0f0a0d" : "#d4a24d"}
                  opacity="0.35"
                />
              ))}
          </g>
        );
      })}
    </svg>
  );
}
