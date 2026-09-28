import { useId } from "react";
import { eventTypeMeta } from "@/lib/ceremony-meta";
import type { TemplateProps } from "./types";
import { CeremonyProgramTabs } from "./program-tabs";
import {
  Countdown,
  GallerySection,
  OurStorySection,
  ThemeBlockSection,
  TemplateBottomSections,
} from "./sections";
import { ScrollIndicator } from "./scroll-indicator";
import { ThemeIcon } from "./theme-icon";
import cityHallIcon from "@/assets/icons/city-hall.png.asset.json";

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
        fontFamily: 'var(--wedding-font-body, "Inter", sans-serif)',
      }}
    >
      <article className="mx-auto max-w-lg px-5 pb-24 pt-14 sm:px-8 animate-fade-in">
        {/* Hero cintré par une arche, texte "billet de bienvenue" surimposé */}
        <SahelHero couple={couple} accent={accent} />

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
                labelClass: "text-[9px] uppercase tracking-[0.3em] opacity-70",
              }}
            />
          </div>
        )}

        <OurStorySection couple={couple} accent={accent} />
        <ThemeBlockSection couple={couple} accent={accent} />

        {couple.introMessage ? (
          <p
            className="mt-12 text-center text-lg italic leading-relaxed"
            style={{ fontFamily: 'var(--wedding-font-heading, "Cormorant Garamond", serif)' }}
          >
            {couple.introMessage}
          </p>
        ) : null}

        <section className="mt-14">
          <div className="text-center">
            <ThemeIcon
              src={cityHallIcon.url}
              color={couple.accent ?? "#c9a84c"}
              className="mx-auto mb-3 size-8"
            />
          </div>
          <div className="mb-6 text-center">
            <p className="text-[10px] uppercase tracking-[0.4em]" style={{ color: accent }}>
              — {eventTypeMeta[couple.eventType ?? "mariage"].programTitle} —
            </p>
          </div>
          <CeremonyProgramTabs ceremonies={published} variant="gold" accent={accent} />
        </section>

        {rsvpSlot}

        <GallerySection couple={couple} accent={accent} layout="frames" />

        <TemplateBottomSections couple={couple} ceremonies={published} accent={accent} />

        <footer className="pt-14 text-center">
          <div className="mx-auto flex items-center justify-center gap-3">
            <span className="h-px w-20" style={{ background: accent }} />
            <span style={{ color: accent }} className="text-xs">
              ✦
            </span>
            <span className="h-px w-20" style={{ background: accent }} />
          </div>
          <p className="mt-3 text-[10px] uppercase tracking-[0.4em] opacity-60">
            {couple.hashtag ?? `${couple.brideName} & ${couple.groomName}`}
          </p>
        </footer>
      </article>
    </main>
  );
}

/**
 * Hero "panneau de bienvenue" : arche photo, texte de bienvenue courbé en
 * haut, monogramme cerclé (initiales + couronne de laurier + année), le
 * type d'événement en italique, les prénoms en gras et la date au format
 * compact — tout surimposé sur la photo, comme un panneau signalétique.
 */
function SahelHero({ couple, accent }: { couple: TemplateProps["couple"]; accent: string }) {
  const arcId = useId();
  const initials = [couple.brideName, couple.groomName]
    .map((n) => (n || "").trim().charAt(0).toUpperCase())
    .join("");
  const year = couple.weddingDate ? new Date(couple.weddingDate + "T00:00:00").getFullYear() : null;
  const eventLabel = eventTypeMeta[couple.eventType ?? "mariage"].label.toLowerCase();
  const welcome = (couple.caption || "Welcome to our").toUpperCase();

  return (
    <figure
      className="relative mx-auto overflow-hidden"
      style={{
        width: "min(100%, 22rem)",
        aspectRatio: "3 / 4",
        borderRadius: "9999px 9999px 1.5rem 1.5rem",
        border: `1.5px solid ${accent}88`,
        boxShadow: `0 0 0 6px #FAF3E4, 0 0 0 7px ${accent}33`,
      }}
    >
      {couple.heroImageUrl ? (
        <img
          src={couple.heroImageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: "sepia(0.12) saturate(1.05)" }}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(180deg, ${accent}22, #e6d5a8)` }}
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.05) 26%, rgba(0,0,0,0.08) 46%, rgba(0,0,0,0.72) 100%)",
        }}
      />

      <div className="relative flex h-full flex-col items-center px-6 pb-8 pt-5 text-white">
        <svg viewBox="0 0 300 100" className="h-[70px] w-full max-w-[280px]" aria-hidden>
          <path id={arcId} d="M 15 88 A 135 135 0 0 1 285 88" fill="none" />
          <text
            fontSize="15"
            letterSpacing="6"
            fill="currentColor"
            style={{ fontFamily: "var(--wedding-font-heading)" }}
          >
            <textPath href={`#${arcId}`} startOffset="50%" textAnchor="middle">
              {welcome}
            </textPath>
          </text>
        </svg>

        <div
          className="relative mt-4 grid size-24 shrink-0 place-items-center rounded-full"
          style={{ background: "rgba(10,8,4,0.4)" }}
        >
          <LaurelWreath color={accent} />
          <div className="relative z-10 text-center">
            <p className="text-[15px] font-semibold tracking-[0.22em]">
              {initials[0]}
              <span style={{ color: accent }}> | </span>
              {initials[1]}
            </p>
            {year ? (
              <p className="mt-1 text-[7px] uppercase tracking-[0.3em] text-white/70">
                Est. {year}
              </p>
            ) : null}
          </div>
        </div>

        <p
          className="mt-4 text-2xl italic"
          style={{ fontFamily: 'var(--wedding-font-heading, "Cormorant Garamond", serif)' }}
        >
          {eventLabel}
        </p>

        <h1
          className="mt-2 text-center font-semibold uppercase leading-[0.95] tracking-tight"
          style={{ fontFamily: 'var(--wedding-font-heading, "Cormorant Garamond", serif)' }}
        >
          <span className="block text-[2.6rem]">{couple.brideName}</span>
          <span className="block text-[2.6rem]">
            <span style={{ color: accent }}>&amp;</span>
            {couple.groomName}
          </span>
        </h1>

        {couple.weddingDate ? (
          <p className="mt-3 text-sm tracking-[0.3em]" style={{ color: accent }}>
            {formatDotDate(couple.weddingDate)}
          </p>
        ) : null}
      </div>
    </figure>
  );
}

function formatDotDate(dateISO: string): string {
  const d = new Date(dateISO + "T00:00:00");
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}.${mm}.${yy}`;
}

/** Stylised laurel-wreath arc, drawn with trigonometry (no image assets). */
function LaurelWreath({ color }: { color: string }) {
  const cx = 48;
  const cy = 48;
  const radius = 40;
  const perSide = 7;
  const startDeg = 12;
  const endDeg = 108;

  const leaves = ([-1, 1] as const).flatMap((side) =>
    Array.from({ length: perSide }, (_, i) => {
      const t = i / (perSide - 1);
      const deg = startDeg + t * (endDeg - startDeg);
      const rad = (deg * Math.PI) / 180;
      const x = cx + side * radius * Math.sin(rad);
      const y = cy + radius * Math.cos(rad);
      const length = 5 + t * 3.5;
      return (
        <ellipse
          key={`${side}-${i}`}
          cx={x}
          cy={y}
          rx={length * 0.4}
          ry={length}
          fill="none"
          stroke={color}
          strokeWidth="1.1"
          transform={`rotate(${side * deg}, ${x}, ${y})`}
        />
      );
    }),
  );

  return (
    <svg viewBox="0 0 96 96" className="absolute inset-0 h-full w-full" aria-hidden>
      {leaves}
    </svg>
  );
}
