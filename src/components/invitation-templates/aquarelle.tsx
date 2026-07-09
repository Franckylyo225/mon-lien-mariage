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
 * Aquarelle — lavis romantiques.
 * Taches d'aquarelle SVG en fond, palette rose poudré / pêche / lilas,
 * typographie manuscrite Caveat pour les prénoms, corps Cormorant.
 */
function WatercolorBlob({
  color,
  className,
  style,
}: {
  color: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      style={style}
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id={`wg-${color.replace("#", "")}`} cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor={color} stopOpacity="0.55" />
          <stop offset="60%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <path
        fill={`url(#wg-${color.replace("#", "")})`}
        d="M50,90 Q30,55 65,40 Q100,25 130,45 Q170,60 165,105 Q160,150 120,160 Q75,170 55,140 Q35,115 50,90 Z"
      />
    </svg>
  );
}

export function AquarelleTemplate({ couple, ceremonies, rsvpSlot }: TemplateProps) {
  const published = ceremonies.filter((c) => c.status === "publiée");
  const accent = couple.accent ?? "#c48b9f";

  return (
    <main
      className="relative min-h-screen overflow-hidden"
      style={{
        background: "#fdf8f4",
        color: "#4b3a44",
        fontFamily: '"Cormorant Garamond", serif',
      }}
    >
      {/* Watercolor washes */}
      <WatercolorBlob
        color="#f2c6d1"
        className="pointer-events-none absolute -left-16 -top-10 h-72 w-72"
      />
      <WatercolorBlob
        color="#f6d5b8"
        className="pointer-events-none absolute -right-20 top-40 h-80 w-80"
      />
      <WatercolorBlob
        color="#d8c7e6"
        className="pointer-events-none absolute -left-10 top-[70%] h-72 w-72"
      />
      <WatercolorBlob
        color="#f2c6d1"
        className="pointer-events-none absolute -right-16 bottom-20 h-72 w-72"
      />

      <article className="relative mx-auto max-w-lg px-5 pb-24 pt-12 sm:px-8 animate-fade-in">
        <p
          className="text-center text-[11px] uppercase tracking-[0.45em]"
          style={{ color: accent, fontFamily: '"Inter", sans-serif' }}
        >
          {couple.caption || "peint à la main"}
        </p>

        <h1 className="mt-4 text-center leading-[0.9]">
          <span
            className="block text-6xl"
            style={{ fontFamily: '"Caveat", cursive', color: "#3b2c34" }}
          >
            {couple.brideName}
          </span>
          <span
            className="my-1 block text-3xl italic"
            style={{ color: accent, fontFamily: '"Cormorant Garamond", serif' }}
          >
            &amp;
          </span>
          <span
            className="block text-6xl"
            style={{ fontFamily: '"Caveat", cursive', color: "#3b2c34" }}
          >
            {couple.groomName}
          </span>
        </h1>

        {couple.heroImageUrl ? (
          <figure className="mx-auto mt-8 w-[85%] overflow-hidden rounded-full ring-4 ring-white/70 shadow-lg">
            <img
              src={couple.heroImageUrl}
              alt=""
              className="aspect-square w-full object-cover"
            />
          </figure>
        ) : (
          <div
            className="mx-auto mt-8 aspect-square w-[85%] rounded-full ring-4 ring-white/70 shadow-lg"
            style={{
              background:
                "radial-gradient(circle at 35% 30%, #f6d5b8, #f2c6d1 55%, #d8c7e6 100%)",
            }}
          />
        )}

        <p
          className="mt-8 text-center text-2xl italic"
          style={{ color: "#5c4653" }}
        >
          {formatFrenchDate(couple.weddingDate)}
        </p>
        <p
          className="mt-1 text-center text-[11px] uppercase tracking-[0.4em]"
          style={{ color: accent, fontFamily: '"Inter", sans-serif' }}
        >
          ~ {couple.city} ~
        </p>

        <ScrollIndicator accent={accent} />

        {(couple.countdownEnabled ?? true) && (
          <div className="mt-10">
            <Countdown
              targetDate={couple.weddingDate}
              style={couple.countdownStyle}
              units={couple.countdownUnits}
              tone={{
                cellBg: "bg-white/70 backdrop-blur",
                cellBorder: "border border-white",
                numberClass: "text-3xl italic text-[#3b2c34]",
                labelClass:
                  "text-[9px] uppercase tracking-[0.3em] text-[#5c4653]/70",
              }}
            />
          </div>
        )}

        <OurStorySection couple={couple} accent={accent} />

        {couple.introMessage ? (
          <p className="mt-12 text-center text-lg italic leading-relaxed">
            {couple.introMessage}
          </p>
        ) : null}

        <section className="mt-16">
          <div className="mb-6 text-center">
            <p
              className="text-[11px] uppercase tracking-[0.45em]"
              style={{ color: accent, fontFamily: '"Inter", sans-serif' }}
            >
              ~ {eventTypeMeta[couple.eventType ?? "mariage"].programTitle} ~
            </p>
          </div>
          <CeremonyProgramTabs ceremonies={published} variant="warm" />
        </section>

        {rsvpSlot}

        <GallerySection couple={couple} accent={accent} />

        <TemplateBottomSections
          couple={couple}
          ceremonies={published}
          accent={accent}
        />

        <footer className="mt-16 pt-6 text-center">
          <p
            className="text-3xl"
            style={{ fontFamily: '"Caveat", cursive', color: accent }}
          >
            {couple.hashtag ?? `${couple.brideName} & ${couple.groomName}`}
          </p>
        </footer>
      </article>
    </main>
  );
}
