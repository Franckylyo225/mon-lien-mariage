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
 * Vert Sauge — botanique méditerranéen.
 * Crème, brins d'olivier fins qui encadrent le nom, hero paysage rond aux
 * angles, palette sauge/vert doux, Cormorant italique.
 */
export function VertSaugeTemplate({ couple, ceremonies, rsvpSlot }: TemplateProps) {
  const published = ceremonies.filter((c) => c.status === "publiée");
  const accent = couple.accent ?? "#7A8471";

  return (
    <main
      className="min-h-screen"
      style={{
        background: "#FAF8F3",
        color: "#2f3a2c",
        fontFamily: '"Inter", sans-serif',
      }}
    >
      <article className="mx-auto max-w-lg px-5 pb-24 pt-12 sm:px-8 animate-fade-in">
        <p
          className="text-center text-[10px] uppercase tracking-[0.5em]"
          style={{ color: accent }}
        >
          {couple.caption || "Nous nous marions"}
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <OliveBranch accent={accent} />
          <h1
            className="text-center leading-[0.95]"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            <span className="block text-4xl italic">{couple.brideName}</span>
            <span className="my-1 block text-xl italic" style={{ color: accent }}>
              &amp;
            </span>
            <span className="block text-4xl italic">{couple.groomName}</span>
          </h1>
          <OliveBranch accent={accent} flip />
        </div>

        <p
          className="mt-6 text-center italic"
          style={{ fontFamily: '"Cormorant Garamond", serif' }}
        >
          {formatFrenchDate(couple.weddingDate)}
        </p>
        <p className="mt-1 text-center text-[10px] uppercase tracking-[0.3em] opacity-70">
          {couple.city}
        </p>

        {couple.heroImageUrl ? (
          <figure className="mt-10 overflow-hidden rounded-3xl ring-1 ring-black/5">
            <img
              src={couple.heroImageUrl}
              alt=""
              className="aspect-[4/3] w-full object-cover"
            />
          </figure>
        ) : null}

        <ScrollIndicator accent={accent} />

        {(couple.countdownEnabled ?? true) && (
          <div className="mt-10">
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
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            {couple.introMessage}
          </p>
        ) : null}

        <section className="mt-14">
          <div className="mb-6 flex items-center justify-center gap-3">
            <OliveBranch accent={accent} small />
            <h2
              className="text-2xl italic"
              style={{ fontFamily: '"Cormorant Garamond", serif' }}
            >
              {eventTypeMeta[couple.eventType ?? "mariage"].programTitle}
            </h2>
            <OliveBranch accent={accent} small flip />
          </div>
          <CeremonyProgramTabs ceremonies={published} variant="gold" />
        </section>

        {rsvpSlot}

        <GallerySection couple={couple} accent={accent} layout="masonry" />

        <TemplateBottomSections
          couple={couple}
          ceremonies={published}
          accent={accent}
        />

        <footer className="pt-14 text-center">
          <OliveBranch accent={accent} />
          <p className="mt-3 text-[10px] uppercase tracking-[0.4em] opacity-60">
            {couple.hashtag ??
              `${couple.brideName} & ${couple.groomName}`}
          </p>
        </footer>
      </article>
    </main>
  );
}

function OliveBranch({
  accent,
  flip = false,
  small = false,
}: {
  accent: string;
  flip?: boolean;
  small?: boolean;
}) {
  const w = small ? 36 : 56;
  return (
    <svg
      aria-hidden
      viewBox="0 0 60 90"
      width={w}
      className="shrink-0"
      style={{ color: accent, transform: flip ? "scaleX(-1)" : undefined }}
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="0.6"
    >
      <path d="M30 5 C 28 30 26 55 24 85" fill="none" strokeLinecap="round" />
      {[15, 25, 35, 45, 60, 72].map((y, i) => (
        <ellipse
          key={i}
          cx={i % 2 === 0 ? 20 - i : 34 + i}
          cy={y}
          rx="6"
          ry="2.5"
          transform={`rotate(${i % 2 === 0 ? -35 : 35} ${i % 2 === 0 ? 20 - i : 34 + i} ${y})`}
          opacity="0.85"
        />
      ))}
    </svg>
  );
}
