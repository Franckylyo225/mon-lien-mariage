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
 * Rose Élégance — classique formel.
 * Composition symétrique, ornements floraux fins, hero portrait encadré,
 * hiérarchie typographique Playfair / Inter, accent bordeaux par défaut.
 */
export function RoseEleganceTemplate({ couple, ceremonies, rsvpSlot }: TemplateProps) {
  const published = ceremonies.filter((c) => c.status === "publiée");
  const accent = couple.accent ?? "#993556";

  return (
    <main
      className="min-h-screen"
      style={{
        background: "#f7f1ea",
        color: "#3a1f2b",
        fontFamily: '"Inter", sans-serif',
      }}
    >
      <article className="mx-auto max-w-lg px-5 pb-24 pt-10 sm:px-8 animate-fade-in">
        {/* Ornement floral supérieur */}
        <FloralDivider accent={accent} />

        <p
          className="mt-6 text-center text-[10px] uppercase tracking-[0.4em]"
          style={{ color: accent }}
        >
          {couple.caption || "Nous vous invitons à célébrer"}
        </p>

        <h1
          className="mt-6 text-center leading-[0.95]"
          style={{ fontFamily: '"Playfair Display", serif' }}
        >
          <span className="block text-[3rem] italic sm:text-[3.5rem]">
            {couple.brideName}
          </span>
          <span
            className="my-2 block text-2xl italic"
            style={{ color: accent }}
          >
            &amp;
          </span>
          <span className="block text-[3rem] italic sm:text-[3.5rem]">
            {couple.groomName}
          </span>
        </h1>

        <div className="mx-auto mt-6 flex items-center justify-center gap-3">
          <span className="h-px w-12" style={{ background: accent + "80" }} />
          <span className="text-xs" style={{ color: accent }}>
            ✦
          </span>
          <span className="h-px w-12" style={{ background: accent + "80" }} />
        </div>

        <p
          className="mt-5 text-center italic"
          style={{ fontFamily: '"Playfair Display", serif' }}
        >
          <span style={{ color: "var(--wedding-accent)" }}>{formatFrenchDate(couple.weddingDate)}</span>
        </p>
        <p className="mt-1 text-center text-[10px] uppercase tracking-[0.3em] opacity-70">
          {couple.city}
        </p>

        {couple.heroImageUrl ? (
          <figure className="mt-10 overflow-hidden rounded-[9999px_9999px_1.5rem_1.5rem] ring-1 ring-black/5 shadow-md">
            <img
              src={couple.heroImageUrl}
              alt=""
              className="aspect-[3/4] w-full object-cover"
            />
          </figure>
        ) : (
          <div
            className="mt-10 aspect-[3/4] w-full rounded-[9999px_9999px_1.5rem_1.5rem]"
            style={{
              background: `linear-gradient(180deg, ${accent}22, #f7f1ea)`,
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
                cellBg: "bg-white",
                cellBorder: "ring-1 ring-[#3a1f2b]/10",
                numberClass:
                  'text-3xl italic',
                labelClass:
                  "text-[9px] uppercase tracking-[0.3em] opacity-60",
              }}
            />
          </div>
        )}

        <OurStorySection couple={couple} accent={accent} />

        {couple.introMessage ? (
          <p
            className="mt-12 text-pretty text-center italic leading-relaxed"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            « {couple.introMessage} »
          </p>
        ) : null}

        <section className="mt-14">
          <SectionTitle accent={accent}>
            {eventTypeMeta[couple.eventType ?? "mariage"].programTitle}
          </SectionTitle>
          <CeremonyProgramTabs
            ceremonies={published}
            variant="terracotta"
            accent={accent}
          />
        </section>

        {rsvpSlot}

        <GallerySection couple={couple} accent={accent} layout="masonry" />

        <TemplateBottomSections
          couple={couple}
          ceremonies={published}
          accent={accent}
        />

        <footer className="pt-16 text-center">
          <FloralDivider accent={accent} small />
          <p className="mt-4 text-[10px] uppercase tracking-[0.4em] opacity-50">
            {couple.hashtag ??
              `${couple.brideName[0]} & ${couple.groomName[0]} — $<span style={{ color: "var(--wedding-accent)" }}>{formatFrenchDate(couple.weddingDate)}</span>`}
          </p>
        </footer>
      </article>
    </main>
  );
}

function SectionTitle({
  children,
  accent,
}: {
  children: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="mb-8 text-center">
      <span
        className="mx-auto mb-3 block h-px w-10"
        style={{ backgroundColor: accent + "80" }}
      />
      <h2
        className="text-2xl italic"
        style={{ fontFamily: '"Playfair Display", serif' }}
      >
        {children}
      </h2>
    </div>
  );
}

function FloralDivider({ accent, small = false }: { accent: string; small?: boolean }) {
  const w = small ? 80 : 140;
  return (
    <svg
      aria-hidden
      viewBox="0 0 140 32"
      width={w}
      className="mx-auto"
      style={{ color: accent }}
      fill="none"
      stroke="currentColor"
      strokeWidth="0.9"
      strokeLinecap="round"
    >
      <path d="M2 16 H55" />
      <path d="M85 16 H138" />
      <circle cx="70" cy="16" r="3" fill="currentColor" stroke="none" />
      <path d="M62 16 c 2 -6 6 -8 8 -8 c 2 0 6 2 8 8" />
      <path d="M62 16 c 2 6 6 8 8 8 c 2 0 6 -2 8 -8" />
      <path d="M55 16 c -2 -3 -4 -3 -6 -1" />
      <path d="M55 16 c -2 3 -4 3 -6 1" />
      <path d="M85 16 c 2 -3 4 -3 6 -1" />
      <path d="M85 16 c 2 3 4 3 6 1" />
    </svg>
  );
}
