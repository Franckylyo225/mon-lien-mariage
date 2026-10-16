import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useWedding } from "@/lib/wedding-store";
import { DEMO_BRIDE, DEMO_GROOM } from "@/lib/couple-photos";
import { Field } from "./signup";

export const Route = createFileRoute("/onboarding/prenoms")({
  head: () => ({ meta: [{ title: "Étape 1 / 4 — Vos prénoms" }] }),
  component: StepPrenoms,
});

function StepPrenoms() {
  const { couple, updateCouple, setOnboardingStep } = useWedding();
  const navigate = useNavigate();
  // Empty by default: pre-filling with the demo names used to ship them
  // straight onto published invitations. They are placeholders only.
  const [brideName, setBride] = useState(couple.brideName ?? "");
  const [groomName, setGroom] = useState(couple.groomName ?? "");

  const valid = Boolean(brideName.trim() && groomName.trim());

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!valid) return;
        await updateCouple({
          brideName: brideName.trim(),
          groomName: groomName.trim(),
        });
        await setOnboardingStep(1);
        navigate({ to: "/onboarding/evenement" });
      }}
      className="space-y-5"
    >
      <div>
        <h1 className="page-title">Vos prénoms</h1>
        <p className="mt-2.5 text-sm text-muted-foreground">
          Ils apparaîtront en grand sur votre page d'invitation.
        </p>
      </div>

      <NamesPreview bride={brideName} groom={groomName} />

      <div className="space-y-3">
        <Field label="Premier prénom">
          <input
            required
            autoFocus
            maxLength={40}
            value={brideName}
            onChange={(e) => setBride(e.target.value)}
            className="wizard-input"
            placeholder={DEMO_BRIDE}
            autoComplete="off"
          />
        </Field>

        <div aria-hidden className="flex items-center gap-3">
          <span className="h-px flex-1 bg-champagne-light" />
          <span className="font-serif text-xl italic text-champagne">&amp;</span>
          <span className="h-px flex-1 bg-champagne-light" />
        </div>

        <Field label="Second prénom">
          <input
            required
            maxLength={40}
            value={groomName}
            onChange={(e) => setGroom(e.target.value)}
            className="wizard-input"
            placeholder={DEMO_GROOM}
            autoComplete="off"
          />
        </Field>
      </div>

      <div className="pb-[env(safe-area-inset-bottom)]">
        <button
          type="submit"
          disabled={!valid}
          className="w-full btn-accent-gradient rounded-xl px-4 py-3.5 text-sm font-semibold disabled:opacity-40"
        >
          Continuer
        </button>
      </div>
    </form>
  );
}

/**
 * Live typographic preview: the two names set in the invitation's title face,
 * updated on every keystroke. A blank field shows its placeholder dimmed, so
 * the effect is visible without passing a demo name off as the user's own.
 */
function NamesPreview({ bride, groom }: { bride: string; groom: string }) {
  const a = bride.trim();
  const b = groom.trim();

  return (
    <div className="relative overflow-hidden rounded-2xl border border-champagne-light bg-gradient-to-br from-[#FDFBF7] to-[#F5EDDF] px-5 py-8">
      <span
        aria-hidden
        className="absolute inset-x-8 top-4 h-px bg-gradient-to-r from-transparent via-champagne/45 to-transparent"
      />
      <span
        aria-hidden
        className="absolute inset-x-8 bottom-4 h-px bg-gradient-to-r from-transparent via-champagne/45 to-transparent"
      />
      <p
        className="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 text-center font-serif text-[26px] leading-tight text-foreground"
        aria-live="polite"
      >
        <span className={a ? "break-words" : "break-words opacity-35"}>{a || DEMO_BRIDE}</span>
        <span className="text-champagne italic">&amp;</span>
        <span className={b ? "break-words" : "break-words opacity-35"}>{b || DEMO_GROOM}</span>
      </p>
    </div>
  );
}
