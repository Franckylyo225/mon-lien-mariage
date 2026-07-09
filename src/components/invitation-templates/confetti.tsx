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
 * Confetti — festif illustré.
 * Pluie de confettis SVG multicolores en fond, palette crème + touches
 * corail/menthe/moutarde, typo ludique Fraunces italic pour les noms.
 */
const CONFETTI_COLORS = ["#ef6f6c", "#f2c14e", "#7ec4a0", "#7aa9d6", "#c58fd6"];

function ConfettiField({ seed = 0, count = 42 }: { seed?: number; count?: number }) {
  // Deterministic pseudo-random from seed
  const rnd = (i: number) => {
    const x = Math.sin(seed * 9999 + i * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };
  const items = Array.from({ length: count }, (_, i) => {
    const cx = rnd(i) * 100;
    const cy = rnd(i + 100) * 100;
    const rot = rnd(i + 200) * 360;
    const color = CONFETTI_COLORS[Math.floor(rnd(i + 300) * CONFETTI_COLORS.length)];
    const shape = Math.floor(rnd(i + 400) * 3);
    return { cx, cy, rot, color, shape, i };
  });
  return (
    <svg
      viewBox="0 0 100 100"
      className="pointer-events-none absolute inset-0 h-full w-full"
      preserveAspectRatio="none"
      aria-hidden
    >
      {items.map(({ cx, cy, rot, color, shape, i }) => (
        <g key={i} transform={`translate(${cx} ${cy}) rotate(${rot})`}>
          {shape === 0 ? (
            <rect x="-0.6" y="-0.2" width="1.2" height="0.4" fill={color} opacity="0.85" />
          ) : shape === 1 ? (
            <circle r="0.35" fill={color} opacity="0.85" />
          ) : (
            <path d="M0,-0.6 L0.5,0.4 L-0.5,0.4 Z" fill={color} opacity="0.85" />
          )}
        </g>
      ))}
    </svg>
  );
}

export function ConfettiTemplate({ couple, ceremonies, rsvpSlot }: TemplateProps) {
  const published = ceremonies.filter((c) => c.status === "publiée");
  const accent = couple.accent ?? "#ef6f6c";

  return (
    <main
      className="relative min-h-screen overflow-hidden"
      style={{
        background: "#fffcf5",
        color: "#2f2a2e",
        fontFamily: '"Inter", sans-serif',
      }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[55vh] opacity-90">
        <ConfettiField seed={1} count={60} />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[45vh] opacity-70">
        <ConfettiField seed={7} count={40} />
      </div>

      <article className="relative mx-auto max-w-lg px-5 pb-24 pt-16 sm:px-8 animate-fade-in">
        <p
          className="text-center text-[11px] uppercase tracking-[0.45em]"
          style={{ color: accent }}
        >
          {couple.caption || "Let's celebrate"}
        </p>

        <h1
          className="mt-6 text-center leading-[0.9]"
          style={{ fontFamily: '"Fraunces", serif' }}
        >
          <span className="block text-[3.5rem] italic">{couple.brideName}</span>
          <span
            className="my-2 inline-block rounded-full px-4 py-1 text-lg italic"
            style={{ background: "#fff0d6", color: accent }}
          >
            &amp;
          </span>
          <span className="block text-[3.5rem] italic">{couple.groomName}</span>
        </h1>

        {couple.heroImageUrl ? (
          <figure
            className="mx-auto mt-8 w-[85%] overflow-hidden rounded-[36px] shadow-xl"
            style={{ border: `4px solid ${accent}` }}
          >
            <img
              src={couple.heroImageUrl}
              alt=""
              className="aspect-[4/5] w-full object-cover"
            />
          </figure>
        ) : (
          <div
            className="mx-auto mt-8 aspect-[4/5] w-[85%] rounded-[36px] shadow-xl"
            style={{
              border: `4px solid ${accent}`,
              background:
                "linear-gradient(135deg, #7ec4a0 0%, #f2c14e 45%, #ef6f6c 100%)",
            }}
          />
        )}

        <div
          className="mx-auto mt-8 inline-flex items-center gap-3 rounded-full bg-white px-5 py-2 shadow-md"
          style={{ border: `1.5px dashed ${accent}66` }}
        >
          <span className="text-xl">🎉</span>
          <p
            className="text-base italic"
            style={{ fontFamily: '"Fraunces", serif', color: "#2f2a2e" }}
          >
            {formatFrenchDate(couple.weddingDate)}
          </p>
          <span className="text-xl">🎉</span>
        </div>
        <p
          className="mt-2 text-center text-[11px] uppercase tracking-[0.4em]"
          style={{ color: accent }}
        >
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
                cellBg: "bg-white",
                cellBorder: "border-2 border-dashed",
                numberClass: "text-3xl italic text-[#2f2a2e]",
                labelClass:
                  "text-[9px] uppercase tracking-[0.3em] text-[#2f2a2e]/60",
              }}
            />
          </div>
        )}

        <OurStorySection couple={couple} accent={accent} />

        {couple.introMessage ? (
          <p
            className="mt-12 text-center text-lg italic leading-relaxed"
            style={{ fontFamily: '"Fraunces", serif' }}
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
              🎊 {eventTypeMeta[couple.eventType ?? "mariage"].programTitle} 🎊
            </p>
          </div>
          <CeremonyProgramTabs ceremonies={published} variant="tropical" />
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
            className="inline-block rounded-full px-5 py-2 text-sm uppercase tracking-[0.35em] text-white"
            style={{ background: accent }}
          >
            {couple.hashtag ?? `${couple.brideName} & ${couple.groomName}`}
          </p>
        </footer>
      </article>
    </main>
  );
}
