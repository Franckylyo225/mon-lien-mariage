import type { ReactNode } from "react";
import { Globe, Plane } from "lucide-react";
import { formatFrenchDate, formatShortDate } from "@/lib/wedding-store";
import { eventTypeMeta } from "@/lib/ceremony-meta";
import { resolveTheme, THEMES } from "@/lib/wedding-theme";
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

/**
 * Billet d'Envol — voyage & embarquement.
 * Fond nuit d'aéroport, cartes "billet" blanches à encoches et liseré
 * pointillé (comme un vrai ticket déchirable), globe & avion en fil de fer,
 * mini-calendrier pour la date. Un clin d'œil chic au voyage, pas un thème
 * littéralement "voyage de noces" — utilisable pour n'importe quel mariage.
 */
export function BilletEnvolTemplate({ couple, ceremonies, rsvpSlot }: TemplateProps) {
  const published = ceremonies.filter((c) => c.status === "publiée");
  const def = THEMES[couple.theme];
  const r = resolveTheme(couple);

  const accent = r.accent;
  const bg = r.bg;
  const onBg = r.textPrimary;
  const card = def?.deep ?? "#ffffff";
  const ink = def?.onDeep ?? "#182238";
  const inkFaint = ink + "14";

  return (
    <main
      className="min-h-screen"
      style={{
        background: bg,
        color: onBg,
        fontFamily: 'var(--wedding-font-body, "Inter", sans-serif)',
      }}
    >
      <article className="mx-auto max-w-lg px-5 pb-24 pt-10 sm:px-8 animate-fade-in">
        <p
          className="flex items-center justify-center gap-2 text-center text-[10px] uppercase tracking-[0.5em]"
          style={{ color: accent }}
        >
          <Plane size={11} strokeWidth={1.75} />
          {couple.caption || "Billet de mariage"}
          <Plane size={11} strokeWidth={1.75} className="-scale-x-100" />
        </p>

        {/* -------- Ticket d'identité -------- */}
        <TicketCard className="mt-5" card={card} ink={ink} bg={bg} label="Billet de mariage" footer>
          <div className="px-6 pb-6 pt-1 text-center">
            <Globe size={26} strokeWidth={1.4} style={{ color: accent }} className="mx-auto" />
            <h1
              className="mt-4 leading-[1.05]"
              style={{ fontFamily: "var(--wedding-font-heading)" }}
            >
              <span className="block text-[2.3rem] uppercase tracking-[0.05em]">
                {couple.brideName}
              </span>
              <span className="my-1 block text-lg" style={{ color: accent }}>
                &amp;
              </span>
              <span className="block text-[2.3rem] uppercase tracking-[0.05em]">
                {couple.groomName}
              </span>
            </h1>
          </div>

          <div
            className="grid grid-cols-2 gap-4 border-t px-6 py-5"
            style={{ borderColor: inkFaint }}
          >
            <div className="border-r pr-4" style={{ borderColor: inkFaint }}>
              <p className="text-[9px] uppercase tracking-[0.3em] opacity-50">Date de vol</p>
              <p className="mt-1 text-sm font-semibold">
                {couple.weddingDate ? formatShortDate(couple.weddingDate) : "À définir"}
              </p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.3em] opacity-50">Classe</p>
              <p className="mt-1 text-sm font-semibold">Vol direct</p>
            </div>
          </div>

          <div
            className="flex items-center justify-between gap-4 border-t px-6 py-5"
            style={{ borderColor: inkFaint }}
          >
            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-[0.3em] opacity-50">Destination</p>
              <p className="mt-1 text-sm font-semibold" style={{ color: accent }}>
                {couple.city ? `${couple.city} · pour la vie` : "Direction le grand jour"}
              </p>
            </div>
            <PassportStamp accent={accent} />
          </div>
        </TicketCard>

        <ScrollIndicator accent={accent} />

        {/* -------- Compte à rebours, étiquette d'embarquement -------- */}
        {(couple.countdownEnabled ?? true) && (
          <TicketCard className="mt-8" card={card} ink={ink} bg={bg} label="Embarquement imminent">
            <div className="px-6 pb-7 pt-2">
              <Countdown
                targetDate={couple.weddingDate}
                style={couple.countdownStyle}
                units={couple.countdownUnits}
                tone={{
                  cellBg: "bg-transparent",
                  cellBorder: "border",
                  numberClass: "text-3xl font-semibold",
                  labelClass: "text-[9px] uppercase tracking-[0.3em] opacity-50",
                }}
              />
            </div>
          </TicketCard>
        )}

        <FlightDivider color={accent + "55"} />

        {couple.introMessage ? (
          <p
            className="text-center text-lg leading-relaxed"
            style={{ fontFamily: "var(--wedding-font-heading)", color: onBg + "cc" }}
          >
            {couple.introMessage}
          </p>
        ) : null}

        <OurStorySection couple={couple} accent={accent} />
        <ThemeBlockSection couple={couple} accent={accent} />

        {couple.heroImageUrl ? (
          <figure className="mt-14 overflow-hidden rounded-[26px]">
            <img
              src={couple.heroImageUrl}
              alt=""
              className="aspect-[4/5] w-full object-cover"
              style={{ filter: "saturate(0.92) contrast(1.02)" }}
            />
          </figure>
        ) : null}

        {/* -------- Réservez la date, mini-calendrier -------- */}
        {couple.weddingDate ? (
          <div
            className="mt-8 rounded-[26px] px-6 py-7 text-center"
            style={{ background: card, color: ink }}
          >
            <p className="text-[10px] uppercase tracking-[0.4em] opacity-50">Réservez la date</p>
            <MiniCalendar dateISO={couple.weddingDate} accent={accent} ink={ink} />
            <p className="mt-2 text-lg font-semibold tracking-wide" style={{ color: accent }}>
              {formatFrenchDate(couple.weddingDate)}
            </p>
          </div>
        ) : null}

        <FlightDivider color={accent + "55"} />

        {/* -------- Programme, sous forme de billet -------- */}
        {published.length > 0 ? (
          <TicketCard
            card={card}
            ink={ink}
            bg={bg}
            label={eventTypeMeta[couple.eventType ?? "mariage"].programTitle}
          >
            <div
              className="px-6 pb-7 pt-1"
              style={
                {
                  "--wedding-bg": card,
                  "--wedding-text-primary": ink,
                  "--wedding-text-secondary": ink + "99",
                  "--wedding-border": inkFaint,
                  "--wedding-accent": accent,
                } as React.CSSProperties
              }
            >
              <CeremonyProgramTabs ceremonies={published} variant="noir" accent={accent} />
            </div>
          </TicketCard>
        ) : null}

        {rsvpSlot}

        <GallerySection couple={couple} accent={accent} layout="mosaic" />

        <TemplateBottomSections couple={couple} ceremonies={published} accent={accent} />

        <footer
          className="mt-16 flex items-center justify-center gap-3 border-t pt-6 text-center text-[10px] uppercase tracking-[0.4em]"
          style={{ borderColor: onBg + "26", color: onBg + "b3" }}
        >
          <Plane size={11} strokeWidth={1.75} />
          {couple.hashtag ?? `${couple.brideName} & ${couple.groomName}`}
        </footer>
      </article>
    </main>
  );
}

/**
 * White "boarding pass" card: a label strip, then a dashed tear-line with two
 * circular notches biting into the card's own edges (the classic ticket-stub
 * illusion — the notches are filled with the page's background colour and
 * clipped by the card's `overflow-hidden`). `footer` repeats the strip at the
 * bottom, closing the ticket like the top.
 */
function TicketCard({
  children,
  className,
  card,
  ink,
  bg,
  label,
  footer,
}: {
  children: ReactNode;
  className?: string;
  card: string;
  ink: string;
  bg: string;
  label: string;
  footer?: boolean;
}) {
  const strip = (
    <>
      <p
        className="pt-5 text-center text-[9px] uppercase tracking-[0.4em]"
        style={{ color: ink + "80" }}
      >
        {label}
      </p>
      <TicketPerforation notchColor={bg} lineColor={ink + "30"} />
    </>
  );

  return (
    <div
      className={
        "relative overflow-hidden rounded-[26px] shadow-[0_18px_40px_-22px_rgba(8,15,32,0.55)] " +
        (className ?? "")
      }
      style={{ background: card, color: ink }}
    >
      {strip}
      {children}
      {footer ? strip : null}
    </div>
  );
}

function TicketPerforation({ notchColor, lineColor }: { notchColor: string; lineColor: string }) {
  return (
    <div className="relative my-3">
      <div className="mx-7 border-t border-dashed" style={{ borderColor: lineColor }} />
      <span
        className="absolute left-0 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: notchColor }}
        aria-hidden
      />
      <span
        className="absolute right-0 top-1/2 size-5 translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: notchColor }}
        aria-hidden
      />
    </div>
  );
}

/** Small decorative "confirmed flight" wax-stamp, drawn in pure CSS. */
function PassportStamp({ accent }: { accent: string }) {
  return (
    <div
      className="grid size-14 shrink-0 place-items-center rounded-full border-2 border-dashed text-center leading-tight"
      style={{ borderColor: accent, color: accent, transform: "rotate(-9deg)" }}
      aria-hidden
    >
      <span className="text-[7px] font-semibold uppercase tracking-[0.12em]">
        Vol
        <br />
        confirmé
      </span>
    </div>
  );
}

/** A dashed flight path with a tilted plane, used as a section separator. */
function FlightDivider({ color }: { color: string }) {
  return (
    <div className="my-10 flex items-center justify-center gap-3" aria-hidden>
      <span className="h-px w-14 border-t border-dashed" style={{ borderColor: color }} />
      <Plane size={14} strokeWidth={1.5} className="rotate-45" style={{ color }} />
      <span className="h-px w-14 border-t border-dashed" style={{ borderColor: color }} />
    </div>
  );
}

const DOW = ["L", "M", "M", "J", "V", "S", "D"];

/** Self-contained month grid (no external calendar lib) highlighting the wedding day. */
function MiniCalendar({ dateISO, accent, ink }: { dateISO: string; accent: string; ink: string }) {
  const d = new Date(dateISO + "T00:00:00");
  const year = d.getFullYear();
  const month = d.getMonth();
  const targetDay = d.getDate();
  const monthLabel = d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="mx-auto mt-4 max-w-[15rem]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.25em]" style={{ color: ink }}>
        {monthLabel}
      </p>
      <div className="mt-3 grid grid-cols-7 gap-y-1.5">
        {DOW.map((label, i) => (
          <span
            key={`dow-${i}`}
            className="text-[8px] font-medium uppercase opacity-40"
            style={{ color: ink }}
          >
            {label}
          </span>
        ))}
        {cells.map((day, i) => (
          <span key={`cell-${i}`} className="flex items-center justify-center py-0.5 text-[11px]">
            {day === targetDay ? (
              <span
                className="grid size-6 place-items-center rounded-full font-semibold text-white"
                style={{ background: accent }}
              >
                {day}
              </span>
            ) : (
              <span style={{ color: ink }}>{day ?? ""}</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
