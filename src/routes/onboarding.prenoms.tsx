import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useWedding } from "@/lib/wedding-store";
import { Field } from "./signup";

export const Route = createFileRoute("/onboarding/prenoms")({
  head: () => ({ meta: [{ title: "Étape 1 / 4 — Vos prénoms" }] }),
  component: StepPrenoms,
});

function StepPrenoms() {
  const { couple, updateCouple, setOnboardingStep } = useWedding();
  const navigate = useNavigate();
  const [brideName, setBride] = useState(couple.brideName ?? "");
  const [groomName, setGroom] = useState(couple.groomName ?? "");

  const valid = brideName.trim() && groomName.trim();

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
      className="space-y-6"
    >
      <div>
        <h1 className="font-serif text-4xl italic">Vos prénoms</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Ils apparaîtront en grand sur votre page d'invitation.
        </p>
      </div>

      <div className="space-y-4">
        <Field label="Prénom marié(e) A">
          <input
            required
            value={brideName}
            onChange={(e) => setBride(e.target.value)}
            className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="Aïcha"
          />
        </Field>
        <Field label="Prénom marié(e) B">
          <input
            required
            value={groomName}
            onChange={(e) => setGroom(e.target.value)}
            className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="Kouamé"
          />
        </Field>
      </div>

      <button
        type="submit"
        disabled={!valid}
        className="w-full rounded-lg bg-primary px-4 py-3.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
      >
        Continuer
      </button>
    </form>
  );
}
