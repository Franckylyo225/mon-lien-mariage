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
 * Or Antique — luxe vintage.
 * Fond ivoire chaud, cadre à filigrane doré, hero encadré en médaillon
 * ovale, typographie Cormorant italique, ornements aux angles.
 */
export function OrAntiqueTemplate({ couple, ceremonies, rsvpSlot }: TemplateProps) {
  const published = ceremonies.filter((c) => c.status === "publiée");
  const accent = couple.accent ?? "#A08234";

  return (
    <main
      className="min-h-screen"
      style={{
        background: "#F5EFE7",
        color: "#3A2A15",
        fontFamily: '"Inter", sans-serif',
      }}
    >
      <article className="mx-auto max-w-lg px-5 pb-24 pt-10 sm:px-8 animate-fade-in">
        {/* Encadré filigrane */}
        <section
          className="relative rounded-[1.5rem] p-8 text-center"
          style={{
            border: `1px solid ${accent}66`,
            boxShadow: `inset 0 0 0 6px #F5EFE7, inset 0 0 0 7px ${accent}33`,
          }}
        >
          <CornerFiligree accent={accent} position="tl" />
          <CornerFiligree accent={accent} position="tr" />
          <CornerFiligree accent={accent} position="bl" />
          <CornerFiligree accent={accent} position="br" />

          <p
            className="text-[10px] uppercase tracking-[0.5em]"
            style={{ color: accent }}
          >
            {couple.caption || "Anno Domini"}
          </p>

          <h1
            className="mt-6 leading-[0.95]"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            <span className="block text-5xl italic">{couple.brideName}</span>
            <span
              className="my-3 block text-3xl italic"
              style={{ color: accent }}
            >
              &amp;
            </span>
            <span className="block text-5xl italic">{couple.groomName}</span>
          </h1>

          <div className="mx-auto my-6 flex items-center justify-center gap-3">
            <span className="h-px w-14" style={{ background: accent }} />
            <span className="rotate-45 text-xs" style={{ color: accent }}>
              ◆
            </span>
            <span className="h-px w-14" style={{ background: accent }} />
          </div>

          <p
            className="italic"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            {formatFrenchDate(couple.weddingDate)}
          </p>
          <p
            className="mt-1 text-[10px] uppercase tracking-[0.4em]"
            style={{ color: accent + "cc" }}
          >
            {couple.city}
          </p>
        </section>

        {/* Médaillon ovale */}
        {couple.heroImageUrl ? (
          <figure
            className="mx-auto mt-10 overflow-hidden"
            style={{
              width: "min(100%, 22rem)",
              aspectRatio: "3 / 4",
              borderRadius: "9999px",
              border: `2px solid ${accent}88`,
              boxShadow: `0 0 0 8px #F5EFE7, 0 0 0 9px ${accent}33`,
            }}
          >
            <img
              src={couple.heroImageUrl}
              alt=""
              className="h-full w-full object-cover"
              style={{ filter: "sepia(0.15) contrast(1.02)" }}
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
                cellBg: "bg-white/60",
                cellBorder: `border`,
                numberClass:
                  "text-3xl italic",
                labelClass:
                  "text-[9px] uppercase tracking-[0.3em]",
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
          <div className="text-center">
            <p
              className="text-[10px] uppercase tracking-[0.4em]"
              style={{ color: accent }}
            >
              — {eventTypeMeta[couple.eventType ?? "mariage"].programTitle} —
            </p>
          </div>
          <div className="mt-8">
            <CeremonyProgramTabs ceremonies={published} variant="deco" />
          </div>
        </section>

        {rsvpSlot}

        <GallerySection couple={couple} accent={accent} layout="mosaic" />

        <TemplateBottomSections
          couple={couple}
          ceremonies={published}
          accent={accent}
        />

        <footer className="pt-14 text-center">
          <span style={{ color: accent }}>◆ ◆ ◆</span>
          <p
            className="mt-3 text-[10px] uppercase tracking-[0.5em]"
            style={{ color: accent + "cc" }}
          >
            {couple.hashtag ?? `${couple.brideName[0]} & ${couple.groomName[0]}`}
          </p>
        </footer>
      </article>
    </main>
  );
}

function CornerFiligree({
  accent,
  position,
}: {
  accent: string;
  position: "tl" | "tr" | "bl" | "br";
}) {
  const style: React.CSSProperties = { color: accent, position: "absolute" };
  if (position === "tl") Object.assign(style, { top: 8, left: 8 });
  if (position === "tr")
    Object.assign(style, { top: 8, right: 8, transform: "scaleX(-1)" });
  if (position === "bl")
    Object.assign(style, { bottom: 8, left: 8, transform: "scaleY(-1)" });
  if (position === "br")
    Object.assign(style, { bottom: 8, right: 8, transform: "scale(-1,-1)" });
  return (
    <svg
      aria-hidden
      viewBox="0 0 32 32"
      width={22}
      style={style}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
    >
      <path d="M4 4 H16" />
      <path d="M4 4 V16" />
      <path d="M4 10 c 6 0 10 -4 10 -6" />
      <circle cx="10" cy="10" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
