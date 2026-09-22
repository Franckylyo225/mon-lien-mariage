import type { Ceremony } from "@/lib/wedding-store";
import { ceremonyTimeStart, ceremonyVenue } from "@/lib/wedding-store";
import type { RsvpDesign } from "@/lib/rsvp-design";
import { AddToCalendarButton } from "./add-to-calendar";

/**
 * Encart affiché après une confirmation de présence : invite l'invité à
 * enregistrer la date dans son agenda pour recevoir un rappel.
 */
export function RsvpCalendarNote({
  design,
  ceremonies,
}: {
  design: RsvpDesign;
  ceremonies: Ceremony[];
}) {
  const next = ceremonies
    .filter((c) => c.status === "publiée" && c.date)
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        ceremonyTimeStart(a).localeCompare(ceremonyTimeStart(b)),
    )[0];
  if (!next) return null;

  return (
    <div
      className="mt-7 flex flex-col items-center gap-3 border-t pt-6"
      style={{ borderColor: design.border }}
    >
      <p
        className="max-w-xs text-center text-xs leading-relaxed"
        style={{ color: design.mutedInk, fontFamily: design.eyebrowFont }}
      >
        Ne manquez aucun moment : enregistrez la date dans votre agenda pour être prévenu à l’avance.
      </p>
      <AddToCalendarButton
        event={{
          title: next.name || next.label,
          date: next.date,
          timeStart: ceremonyTimeStart(next) || undefined,
          timeEnd: next.timeEnd || undefined,
          location: ceremonyVenue(next) || undefined,
          description: typeof window !== "undefined" ? window.location.href : undefined,
        }}
        palette={{
          accent: design.accent,
          border: design.border,
          muted: design.mutedInk,
          font: design.eyebrowFont,
          bg: design.surface ?? "#ffffff",
        }}
        fileName="invitation"
      />
    </div>
  );
}
