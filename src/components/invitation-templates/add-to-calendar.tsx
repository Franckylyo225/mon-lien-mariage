import { useEffect, useState } from "react";
import {
  deviceTimeZone,
  downloadIcs,
  googleCalendarUrl,
  prefersAppleCalendar,
  type CalendarEvent,
} from "@/lib/calendar-invite";

export interface CalendarPalette {
  accent: string;
  border: string;
  muted: string;
  font: string;
  bg: string;
}

const THEME_PALETTE: CalendarPalette = {
  accent: "var(--wedding-accent)",
  border: "var(--wedding-border)",
  muted: "var(--wedding-text-secondary)",
  font: "var(--wedding-font-body)",
  bg: "var(--wedding-bg)",
};

interface Props {
  event: CalendarEvent;
  palette?: CalendarPalette;
  label?: string;
  fileName?: string;
  className?: string;
}

/**
 * Bouton discret « Ajouter à mon agenda » : Google Agenda ou fichier
 * universel (.ics) pour Apple Calendar, Outlook et les autres.
 */
export function AddToCalendarButton({
  event,
  palette = THEME_PALETTE,
  label = "Ajouter à mon agenda",
  fileName = "invitation",
  className = "",
}: Props) {
  const [apple, setApple] = useState(false);

  useEffect(() => {
    setApple(prefersAppleCalendar());
  }, []);

  const gUrl = googleCalendarUrl(event, deviceTimeZone());
  if (!gUrl) return null;

  const base =
    "inline-flex min-h-11 items-center justify-center gap-2 border px-5 py-2.5 text-[10px] uppercase tracking-[0.18em] transition duration-200 hover:-translate-y-0.5 hover:opacity-90";
  const style = {
    color: palette.accent,
    borderColor: palette.border,
    fontFamily: palette.font,
    background: "transparent",
  };

  const google = (
    <a key="google" href={gUrl} target="_blank" rel="noreferrer" className={base} style={style}>
      <CalendarIcon className="size-4 shrink-0" />
      {label} · Google
    </a>
  );

  const ics = (
    <button
      key="ics"
      type="button"
      onClick={() => downloadIcs(event, fileName)}
      className={base}
      style={style}
    >
      <AppleIcon className="size-4 shrink-0" />
      {label} · Apple
    </button>
  );

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {apple ? [ics, google] : [google, ics]}
    </div>
  );
}


function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M16.4 12.7c0-2.2 1.8-3.2 1.9-3.3-1-1.5-2.6-1.7-3.2-1.7-1.4-.1-2.6.8-3.3.8-.7 0-1.7-.8-2.8-.8-1.5 0-2.8.9-3.6 2.2-1.5 2.6-.4 6.5 1.1 8.6.7 1 1.6 2.2 2.7 2.2 1.1 0 1.5-.7 2.8-.7s1.6.7 2.8.7c1.2 0 1.9-1 2.6-2.1.8-1.2 1.2-2.4 1.2-2.4s-2.2-.9-2.2-3.5ZM14.3 5.9c.6-.7 1-1.7.9-2.7-.9 0-2 .6-2.6 1.3-.6.6-1.1 1.7-.9 2.6 1 .1 2-.5 2.6-1.2Z" />
    </svg>
  );
}
