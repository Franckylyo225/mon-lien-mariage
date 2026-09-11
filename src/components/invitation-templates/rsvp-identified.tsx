import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ThemeId } from "@/lib/wedding-store";
import { resolveRsvpDesign } from "@/lib/rsvp-design";
import { RsvpOrnament } from "./rsvp-ornament";

interface Props {
  theme?: ThemeId;
  slug: string;
  token: string;
  guestName: string;
  onConfirmed?: () => void;
}

/**
 * RSVP simplifié pour un invité identifié par son lien personnel :
 * deux boutons, pas de formulaire, réponse rattachée à sa fiche existante.
 */
export function IdentifiedRsvp({ theme, slug, token, guestName, onConfirmed }: Props) {
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
      if (data !== "ok") throw new Error("Réponse impossible pour le moment.");
      setStatus(attending ? "confirmé" : "décliné");
      if (attending) onConfirmed?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur s'est produite.");
    } finally {
      setPending(null);
    }
  };

  const firstName = guestName.trim().split(/\s+/)[0] || guestName;

  return (
    <section
      className={
        "relative mt-12 w-full max-w-full overflow-hidden px-5 py-8 text-center sm:px-8 sm:py-10 " +
        design.wrapperRadius +
        " " +
        design.border1
      }
      style={{
        background: design.bg,
        color: design.ink,
        borderColor: design.border,
        fontFamily: design.bodyFont,
      }}
    >
      <div className="mb-4">
        <RsvpOrnament kind={design.ornament} color={design.accent} />
      </div>

      <p
        className="text-[10px] uppercase tracking-[0.35em]"
        style={{ color: design.accent, fontFamily: design.eyebrowFont }}
      >
        {design.eyebrow}
      </p>

      <h3
        className={
          "mt-3 break-words text-3xl leading-tight sm:text-4xl " +
          (design.headingItalic ? "italic" : "")
        }
        style={{ fontFamily: design.headingFont, color: design.ink }}
      >
        {status === "idle" ? `Hello ${firstName}` : `Merci ${firstName} !`}
      </h3>

      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed" style={{ color: design.mutedInk }}>
        {status === "confirmé"
          ? "Votre présence est confirmée. Nous avons hâte de vous voir !"
          : status === "décliné"
            ? "Votre réponse est enregistrée. Vous nous manquerez."
            : "Cette invitation vous est personnellement adressée. Un clic suffit pour répondre."}
      </p>

      {status === "idle" ? (
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            disabled={pending !== null}
            onClick={() => respond(true)}
            className={
              "inline-flex w-full max-w-xs items-center justify-center px-6 py-3 text-[11px] uppercase tracking-[0.25em] transition hover:opacity-90 disabled:opacity-60 sm:w-auto " +
              design.fieldRadius
            }
            style={{
              background: design.accent,
              color: design.accentInk,
              fontFamily: design.eyebrowFont,
              boxShadow: `0 10px 25px -12px ${design.accent}`,
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
    </section>
  );
}
