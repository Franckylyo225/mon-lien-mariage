/**
 * Génération des liens « Ajouter au calendrier » pour les invités.
 *
 * Deux formats :
 *  - Google Agenda : lien direct (web ou application).
 *  - iCalendar (.ics) : fichier universel (Apple Calendar, Outlook, etc.)
 *    avec deux rappels automatiques (24 h et 2 h avant).
 *
 * Les heures sont écrites en « heure locale flottante » : l'événement
 * s'affiche à la même heure quel que soit le fuseau de l'invité.
 */

export interface CalendarEvent {
  title: string;
  /** YYYY-MM-DD */
  date: string;
  /** HH:MM (optionnel → journée entière) */
  timeStart?: string;
  /** HH:MM (optionnel → +3 h) */
  timeEnd?: string;
  location?: string;
  description?: string;
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function parseDate(date: string): { y: number; m: number; d: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim());
  if (!m) return null;
  return { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) };
}

function parseTime(time?: string): { h: number; min: number } | null {
  if (!time) return null;
  const m = /^(\d{1,2})[:hH](\d{2})/.exec(time.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return { h, min };
}

function stampDate(y: number, m: number, d: number): string {
  return `${y}${pad(m)}${pad(d)}`;
}

function addDays(y: number, m: number, d: number, days: number) {
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
}

interface Range {
  allDay: boolean;
  start: string;
  end: string;
}

/** Bornes de l'événement au format compact (local flottant). */
export function calendarRange(ev: CalendarEvent): Range | null {
  const day = parseDate(ev.date);
  if (!day) return null;
  const start = parseTime(ev.timeStart);
  if (!start) {
    const next = addDays(day.y, day.m, day.d, 1);
    return {
      allDay: true,
      start: stampDate(day.y, day.m, day.d),
      end: stampDate(next.y, next.m, next.d),
    };
  }
  const endTime = parseTime(ev.timeEnd);
  const startMinutes = start.h * 60 + start.min;
  let endMinutes = endTime ? endTime.h * 60 + endTime.min : startMinutes + 180;
  if (endMinutes <= startMinutes) endMinutes = startMinutes + 180;
  const endDayOffset = Math.floor(endMinutes / (24 * 60));
  const endOfDay = endMinutes % (24 * 60);
  const endDay = addDays(day.y, day.m, day.d, endDayOffset);
  return {
    allDay: false,
    start: `${stampDate(day.y, day.m, day.d)}T${pad(start.h)}${pad(start.min)}00`,
    end: `${stampDate(endDay.y, endDay.m, endDay.d)}T${pad(Math.floor(endOfDay / 60))}${pad(endOfDay % 60)}00`,
  };
}

/** Lien direct vers Google Agenda. */
export function googleCalendarUrl(ev: CalendarEvent, timeZone?: string): string | null {
  const range = calendarRange(ev);
  if (!range) return null;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: ev.title,
    dates: `${range.start}/${range.end}`,
  });
  if (ev.description) params.set("details", ev.description);
  if (ev.location) params.set("location", ev.location);
  if (!range.allDay && timeZone) params.set("ctz", timeZone);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function escapeIcs(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function foldLine(line: string): string {
  if (line.length <= 73) return line;
  const parts: string[] = [];
  let rest = line;
  parts.push(rest.slice(0, 73));
  rest = rest.slice(73);
  while (rest.length > 72) {
    parts.push(` ${rest.slice(0, 72)}`);
    rest = rest.slice(72);
  }
  if (rest.length) parts.push(` ${rest}`);
  return parts.join("\r\n");
}

/** Contenu d'un fichier .ics (Apple Calendar, Outlook, autres). */
export function buildIcs(ev: CalendarEvent, uidSeed = "moninvit"): string | null {
  const range = calendarRange(ev);
  if (!range) return null;
  const now = new Date();
  const stamp =
    `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}` +
    `T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;
  const uid = `${uidSeed.replace(/[^a-zA-Z0-9-]/g, "")}-${range.start}@moninvit.com`;

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MonInvit//Invitation//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    range.allDay ? `DTSTART;VALUE=DATE:${range.start}` : `DTSTART:${range.start}`,
    range.allDay ? `DTEND;VALUE=DATE:${range.end}` : `DTEND:${range.end}`,
    `SUMMARY:${escapeIcs(ev.title)}`,
  ];
  if (ev.location) lines.push(`LOCATION:${escapeIcs(ev.location)}`);
  if (ev.description) lines.push(`DESCRIPTION:${escapeIcs(ev.description)}`);
  for (const [trigger, label] of [
    ["-P1D", "Demain : n'oubliez pas !"],
    ["-PT2H", "C'est bientôt !"],
  ] as const) {
    lines.push(
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeIcs(label)}`,
      `TRIGGER:${trigger}`,
      "END:VALARM",
    );
  }
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.map(foldLine).join("\r\n");
}

/** Télécharge le fichier .ics côté navigateur. */
export function downloadIcs(ev: CalendarEvent, fileName = "invitation.ics"): void {
  const ics = buildIcs(ev, fileName);
  if (!ics || typeof document === "undefined") return;
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName.endsWith(".ics") ? fileName : `${fileName}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** true sur iPhone / iPad / Mac : Apple Calendar est proposé en premier. */
export function prefersAppleCalendar(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /iPhone|iPad|iPod|Macintosh/i.test(ua);
}

export function deviceTimeZone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || undefined;
  } catch {
    return undefined;
  }
}
