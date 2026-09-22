import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Ceremony, ThemeId } from "@/lib/wedding-store";
import { resolveRsvpDesign } from "@/lib/rsvp-design";
import { RsvpHonorCard } from "./rsvp-honor-card";
import { RsvpCalendarNote } from "./rsvp-calendar-note";
import { readableError, rsvpStatusMessage } from "@/lib/rsvp-errors";

interface Props {
  theme?: ThemeId;
  slug: string;
  token: string;
  guestName: string;
  ceremonies?: Ceremony[];
  onConfirmed?: () => void;
}

/**
 * RSVP simplifié pour un invité identifié par son lien personnel :
 * deux boutons, pas de formulaire, réponse rattachée à sa fiche existante.
 */
export function IdentifiedRsvp({ theme, slug, token, guestName, ceremonies = [], onConfirmed }: Props) {
  const design = resolveRsvpDesign(theme);
  const [status, setStatus] = useState<"idle" | "confirmé" | "décliné">("idle");
  const [pending, setPending] = useState<null | "yes" | "no">(null);
  const [error, setError] = useState<string | null>(null);

  const respond = async (attending: boolean) => {
    setError(null);
    setPending(attending ? "yes" : "no");
    try {
      const { data, error: err } = await supabase.rpc("rsvp_respond_by_token", {
        _slug: slug,
        _token: token,
        _attending: attending,
        _companions: 0,
      });
      if (err) throw err;
      if (data !== "ok") {
        throw new Error(
          rsvpStatusMessage(data) ?? "Réponse impossible pour le moment.",
        );
      }
      setStatus(attending ? "confirmé" : "décliné");
      if (attending) onConfirmed?.();
    } catch (e) {
      setError(readableError(e));
    } finally {
      setPending(null);
    }
  };

  const firstName = guestName.trim().split(/\s+/)[0] || guestName;

  return (
    <RsvpHonorCard
      design={design}
      eyebrow={design.eyebrow}
      title={status === "idle" ? `Hello ${firstName}` : `Merci ${firstName} !`}
      description={
        status === "confirmé"
          ? "Votre présence est confirmée. Nous avons hâte de vous voir !"
          : status === "décliné"
            ? "Votre réponse est enregistrée. Vous nous manquerez."
            : "Cette invitation vous est personnellement adressée. Un clic suffit pour répondre."
      }
    >
      {status === "idle" ? (
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            disabled={pending !== null}
            onClick={() => respond(true)}
            className={
              "inline-flex min-h-12 w-full max-w-xs items-center justify-center border px-7 py-3 text-[11px] uppercase tracking-[0.22em] transition duration-200 hover:-translate-y-0.5 hover:opacity-95 disabled:opacity-60 sm:w-auto " +
              design.fieldRadius
            }
            style={{
              background: design.accent,
              color: design.accentInk,
              fontFamily: design.eyebrowFont,
              borderColor: design.accentInk,
              boxShadow: `0 0 0 3px ${design.accent}, 0 14px 30px -15px ${design.accent}`,
            }}
          >
            {pending === "yes" ? "Envoi…" : "Confirmer ma présence"}
          </button>
          <button
            type="button"
            disabled={pending !== null}
            onClick={() => respond(false)}
            className={
              "inline-flex w-full max-w-xs items-center justify-center border px-6 py-3 text-[11px] uppercase tracking-[0.25em] transition hover:opacity-90 disabled:opacity-60 sm:w-auto " +
              design.fieldRadius
            }
            style={{
              borderColor: design.border,
              color: design.mutedInk,
              fontFamily: design.eyebrowFont,
            }}
          >
            {pending === "no" ? "Envoi…" : "Ne pourra pas venir"}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 text-[11px] uppercase tracking-[0.25em] underline underline-offset-4"
          style={{ color: design.accent, fontFamily: design.eyebrowFont }}
        >
          Modifier ma réponse
        </button>
      )}

      {error ? (
        <p className="mt-4 text-xs" style={{ color: design.accent }}>
          {error}
        </p>
      ) : null}
    </RsvpHonorCard>
  );
}
