import { formatFrenchDate } from "@/lib/wedding-store";
import { eventTypeMeta } from "@/lib/ceremony-meta";
import { resolveTheme, THEMES } from "@/lib/wedding-theme";
import { decorForTheme } from "@/lib/theme-decor";
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
import {
  CornerOrnaments,
  Divider,
  HeroFrame,
  OrnamentBand,
} from "./ornaments";

/**
 * Gabarit ornemental partagé par les thèmes africains & orientaux.
 * Le rendu est piloté par `theme-decor.ts` : chaque thème possède sa
 * propre forme de cadre photo, son séparateur signature, ses ornements
 * d'angle, sa composition de hero et sa palette — pour que deux thèmes
 * d'une même famille ne se ressemblent jamais.
 */
export function OrnateTemplate({ couple, ceremonies, rsvpSlot }: TemplateProps) {
  const published = ceremonies.filter((c) => c.status === "publiée");
  const def = THEMES[couple.theme];
  const decor = decorForTheme(couple.theme);
  const r = resolveTheme(couple);

  if (!decor || !def) return null;

  const accent = r.accent;
  const deep = r.deep ?? def.deep ?? "#1a1a1a";
  const onDeep = def.onDeep ?? "#f6f1e7";
  const bg = r.bg;
  const text = r.textPrimary;
  const muted = def.muted ?? "rgba(0,0,0,0.6)";
  const heading = def.fontHeading;

  const eyebrow = (extra?: string) => ({
    fontSize: "10px",
    letterSpacing: decor.eyebrowTracking,
    textTransform: "uppercase" as const,
    color: extra ?? accent,
  });

  const names = (
    <h1
      className="leading-[1.02]"
      style={{ fontFamily: heading, color: text }}
    >
      <span
        className={
          "block " +
          (decor.namesCase === "upper"
            ? "text-[2.35rem] tracking-[0.06em]"
            : "text-[2.9rem] italic")
        }
        style={{
          textTransform: decor.namesCase === "upper" ? "uppercase" : "none",
        }}
      >
        {couple.brideName}
      </span>
      <span className="my-2 block text-xl" style={{ color: accent }}>
        {decor.ampersand}
      </span>
      <span
        className={
          "block " +
          (decor.namesCase === "upper"
            ? "text-[2.35rem] tracking-[0.06em]"
            : "text-[2.9rem] italic")
        }
        style={{
          textTransform: decor.namesCase === "upper" ? "uppercase" : "none",
        }}
      >
        {couple.groomName}
      </span>
    </h1>
  );

  const dateBlock = (
    <div className="mt-6">
      <p className="text-lg" style={{ fontFamily: heading, color: accent }}>
        {formatFrenchDate(couple.weddingDate)}
      </p>
      {couple.city ? (
        <p className="mt-1" style={eyebrow(muted)}>
          {couple.city}
        </p>
      ) : null}
    </div>
  );

  const photo = (
    <HeroFrame
      src={couple.heroImageUrl}
      shape={decor.heroShape}
      accent={accent}
      deep={deep}
    />
  );

  return (
    <main
      className="min-h-screen"
      style={{ background: bg, color: text, fontFamily: def.fontBody }}
    >
      {/* Bandeau d'en-tête : plein `deep` ou simple filet textile */}
      {decor.headerFill === "deep" ? (
        <header
          className="px-6 pb-7 pt-8 text-center"
          style={{ background: deep, color: onDeep }}
        >
          <p style={eyebrow(accent)}>
            {couple.caption || eventTypeMeta[couple.eventType ?? "mariage"].programTitle}
          </p>
          <Divider
            kind={decor.divider}
            accent={accent}
            deep={onDeep}
            className="mx-auto mt-4 max-w-[220px]"
          />
        </header>
      ) : (
        <>
          <OrnamentBand css={def.bandCss ?? `linear-gradient(90deg, ${accent}, ${deep})`} height={8} />
          <header className="px-6 pt-8 text-center">
            <p style={eyebrow()}>
              {couple.caption || eventTypeMeta[couple.eventType ?? "mariage"].programTitle}
            </p>
          </header>
        </>
      )}

      <article className="relative mx-auto max-w-lg px-5 pb-24 pt-8 sm:px-8 animate-fade-in">
        <CornerOrnaments kind={decor.corner} accent={accent} deep={deep} />

        {/* -------- HERO -------- */}
        {decor.heroLayout === "overlay" && couple.heroImageUrl ? (
          <section className="relative overflow-hidden" style={{ borderRadius: 14 }}>
            <img
              src={couple.heroImageUrl}
              alt=""
              className="aspect-[3/4] w-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(180deg, ${deep}22 0%, ${deep}dd 78%)`,
              }}
            />
            <div className="absolute inset-x-0 bottom-0 p-6 text-center" style={{ color: onDeep }}>
              <div style={{ color: onDeep }}>
                <h1 className="leading-[1.05]" style={{ fontFamily: heading }}>
                  <span className={decor.namesCase === "upper" ? "block text-[2.1rem] uppercase tracking-[0.08em]" : "block text-[2.6rem] italic"}>
                    {couple.brideName}
                  </span>
                  <span className="my-1 block text-lg" style={{ color: accent }}>
                    {decor.ampersand}
                  </span>
                  <span className={decor.namesCase === "upper" ? "block text-[2.1rem] uppercase tracking-[0.08em]" : "block text-[2.6rem] italic"}>
                    {couple.groomName}
                  </span>
                </h1>
              </div>
              <Divider
                kind={decor.divider}
                accent={accent}
                deep={onDeep}
                className="mx-auto mt-4 max-w-[200px]"
              />
              <p className="mt-3 text-base" style={{ fontFamily: heading, color: accent }}>
                {formatFrenchDate(couple.weddingDate)}
              </p>
              {couple.city ? (
                <p className="mt-1" style={eyebrow(onDeep)}>
                  {couple.city}
                </p>
              ) : null}
            </div>
          </section>
        ) : decor.heroLayout === "names-first" ? (
          <section className="text-center">
            {names}
            <Divider
              kind={decor.divider}
              accent={accent}
              deep={deep}
              className="mx-auto mt-5 max-w-[240px]"
            />
            {dateBlock}
            <div className="mt-8">{photo}</div>
          </section>
        ) : (
          <section className="text-center">
            {photo}
            <div className="mt-8">{names}</div>
            <Divider
              kind={decor.divider}
              accent={accent}
              deep={deep}
              className="mx-auto mt-5 max-w-[240px]"
            />
            {dateBlock}
          </section>
        )}

        <ScrollIndicator accent={accent} />

        {(couple.countdownEnabled ?? true) && (
          <div className="mt-8">
            <Countdown
              targetDate={couple.weddingDate}
              style={couple.countdownStyle}
              units={couple.countdownUnits}
              tone={{
                cellBg: "",
                cellBorder: "border",
                numberClass: "text-3xl",
                labelClass: "text-[9px] uppercase tracking-[0.3em]",
              }}
            />
          </div>
        )}

        <OurStorySection couple={couple} accent={accent} />
        <ThemeBlockSection couple={couple} accent={accent} />

        {couple.introMessage ? (
          <>
            <Divider
              kind={decor.dividerAlt}
              accent={accent}
              deep={deep}
              className="mx-auto mt-12 max-w-[220px]"
            />
            <p
              className="mt-6 text-center text-lg leading-relaxed"
              style={{ fontFamily: heading, color: muted }}
            >
              {couple.introMessage}
            </p>
          </>
        ) : null}

        <section className="mt-14">
          <div className="mb-5 text-center">
            <p style={eyebrow()}>
              {eventTypeMeta[couple.eventType ?? "mariage"].programTitle}
            </p>
            <Divider
              kind={decor.dividerAlt}
              accent={accent}
              deep={deep}
              className="mx-auto mt-3 max-w-[160px]"
            />
          </div>
          <CeremonyProgramTabs ceremonies={published} variant={decor.program} accent={accent} />
        </section>

        {rsvpSlot}

        <GallerySection couple={couple} accent={accent} layout={decor.gallery} />

        <TemplateBottomSections
          couple={couple}
          ceremonies={published}
          accent={accent}
        />

        <Divider
          kind={decor.divider}
          accent={accent}
          deep={deep}
          className="mx-auto mt-14 max-w-[240px]"
        />
        <footer className="pt-5 text-center">
          <p style={eyebrow(muted)}>
            {couple.hashtag ?? `${couple.brideName} & ${couple.groomName}`}
          </p>
        </footer>
      </article>

      <OrnamentBand
        css={def.bandCss ?? `linear-gradient(90deg, ${deep}, ${accent})`}
        height={8}
      />
    </main>
  );
}
