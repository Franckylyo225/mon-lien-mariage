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
 * Jardin Sauvage — bohème champêtre.
 * Fond crème, fleurs sauvages en aquarelle légère aux angles, hero pleine
 * largeur, typographie Playfair, palette vert profond + touches botaniques.
 */
export function JardinSauvageTemplate({ couple, ceremonies, rsvpSlot }: TemplateProps) {
  const published = ceremonies.filter((c) => c.status === "publiée");
  const accent = couple.accent ?? "#2D5F3F";

  return (
    <main
      className="min-h-screen relative overflow-hidden"
      style={{
        background: "#FAF8F3",
        color: "#1f2a1c",
        fontFamily: '"Inter", sans-serif',
      }}
    >
      {/* Fleurs d'ambiance en fond */}
      <WildflowerCluster
        accent={accent}
        className="pointer-events-none absolute -left-8 -top-4 opacity-40"
      />
      <WildflowerCluster
        accent={accent}
        flip
        className="pointer-events-none absolute -right-8 top-40 opacity-30"
      />

      <article className="relative mx-auto max-w-lg px-5 pb-24 pt-14 sm:px-8 animate-fade-in">
        {couple.heroImageUrl ? (
          <figure className="overflow-hidden rounded-[2rem] shadow-lg ring-1 ring-black/5">
            <img
              src={couple.heroImageUrl}
              alt=""
              className="aspect-[3/4] w-full object-cover"
            />
          </figure>
        ) : (
          <div
            className="aspect-[3/4] w-full rounded-[2rem]"
            style={{
              background: `linear-gradient(135deg, ${accent}22, #ded9c8)`,
            }}
          />
        )}

        <p
          className="mt-10 text-center text-[10px] uppercase tracking-[0.5em]"
          style={{ color: accent }}
        >
          {couple.caption || "Un mariage en pleine nature"}
        </p>

        <h1
          className="mt-6 text-center leading-[0.95]"
          style={{ fontFamily: '"Playfair Display", serif' }}
        >
          <span className="block text-5xl italic">{couple.brideName}</span>
          <span
            className="my-2 block text-3xl italic"
            style={{ color: accent }}
          >
            &amp;
          </span>
          <span className="block text-5xl italic">{couple.groomName}</span>
        </h1>

        <div className="mx-auto mt-6 flex items-center justify-center gap-3">
          <Sprig accent={accent} />
          <span
            className="text-xs italic"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            {formatFrenchDate(couple.weddingDate)} · {couple.city}
          </span>
          <Sprig accent={accent} flip />
        </div>

        <ScrollIndicator accent={accent} />

        {(couple.countdownEnabled ?? true) && (
          <div className="mt-10">
            <Countdown
              targetDate={couple.weddingDate}
              style={couple.countdownStyle}
              units={couple.countdownUnits}
              tone={{
                cellBg: "bg-white/60",
                cellBorder: "border border-black/10",
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
            className="mt-12 text-pretty text-center text-lg italic leading-relaxed"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            {couple.introMessage}
          </p>
        ) : null}

        <section className="mt-14">
          <div className="mb-6 text-center">
            <Sprig accent={accent} />
            <h2
              className="mt-2 text-2xl italic"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              {eventTypeMeta[couple.eventType ?? "mariage"].programTitle}
            </h2>
          </div>
          <CeremonyProgramTabs
            ceremonies={published}
            variant="gold"
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
          <div className="flex items-center justify-center gap-2">
            <Sprig accent={accent} small />
            <Sprig accent={accent} small flip />
          </div>
          <p className="mt-2 text-[10px] uppercase tracking-[0.4em] opacity-60">
            {couple.hashtag ??
              `${couple.brideName} & ${couple.groomName}`}
          </p>
        </footer>
      </article>
    </main>
  );
}

function Sprig({
  accent,
  flip = false,
  small = false,
}: {
  accent: string;
  flip?: boolean;
  small?: boolean;
}) {
  const w = small ? 30 : 46;
  return (
    <svg
      viewBox="0 0 60 24"
      width={w}
      className="shrink-0"
      style={{ color: accent, transform: flip ? "scaleX(-1)" : undefined }}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
    >
      <path d="M2 12 C 15 12 30 8 58 12" />
      {[
        [12, 6],
        [22, 4],
        [32, 5],
        [42, 3],
      ].map(([x, y], i) => (
        <path key={i} d={`M${x} 12 C ${x + 1} ${y} ${x + 4} ${y - 2} ${x + 6} ${y - 3}`} />
      ))}
      {[
        [17, 18],
        [27, 20],
        [37, 19],
        [47, 21],
      ].map(([x, y], i) => (
        <path
          key={"b" + i}
          d={`M${x} 12 C ${x + 1} ${y} ${x + 4} ${y + 2} ${x + 6} ${y + 3}`}
        />
      ))}
    </svg>
  );
}

function WildflowerCluster({
  accent,
  flip = false,
  className,
}: {
  accent: string;
  flip?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 260"
      width={200}
      className={className}
      style={{ color: accent, transform: flip ? "scaleX(-1)" : undefined }}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
    >
      <path d="M40 260 C 60 200 50 150 80 90" />
      <path d="M60 260 C 80 210 70 160 110 110" />
      {[
        [80, 90, 6],
        [110, 110, 5],
        [55, 180, 4],
        [95, 200, 4],
        [70, 130, 3],
      ].map(([cx, cy, r], i) => (
        <g key={i}>
          {Array.from({ length: 5 }).map((_, k) => {
            const a = (k / 5) * Math.PI * 2;
            return (
              <ellipse
                key={k}
                cx={cx + Math.cos(a) * r}
                cy={cy + Math.sin(a) * r}
                rx="3"
                ry="1.5"
                transform={`rotate(${(a * 180) / Math.PI} ${cx + Math.cos(a) * r} ${cy + Math.sin(a) * r})`}
              />
            );
          })}
          <circle cx={cx} cy={cy} r="1.5" fill="currentColor" />
        </g>
      ))}
    </svg>
  );
}
