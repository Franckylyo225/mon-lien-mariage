import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useWedding } from "@/lib/wedding-store";
import { Field } from "./signup";

export const Route = createFileRoute("/onboarding/couple")({
  head: () => ({ meta: [{ title: "Étape 1 / 4 — Vos prénoms" }] }),
  component: Step1,
});

function Step1() {
  const { couple, updateCouple, setOnboardingStep } = useWedding();
  const navigate = useNavigate();
  const [brideName, setBride] = useState(couple.brideName ?? "");
  const [groomName, setGroom] = useState(couple.groomName ?? "");
  const [weddingDate, setDate] = useState(couple.weddingDate ?? "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!brideName.trim() || !groomName.trim()) return;
        updateCouple({ brideName: brideName.trim(), groomName: groomName.trim(), weddingDate });
        setOnboardingStep(1);
        navigate({ to: "/onboarding/ceremonies" });
      }}
      className="space-y-6"
    >
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
          Vos prénoms
        </p>
        <h1 className="mt-3 font-serif text-4xl italic">Qui se marie ?</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Ces prénoms apparaîtront sur votre page d'invitation.
        </p>
      </div>

      <div className="space-y-4">
        <Field label="Prénom marié·e A">
          <input
            required
            value={brideName}
            onChange={(e) => setBride(e.target.value)}
            className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="Aïcha"
          />
        </Field>
        <Field label="Prénom marié·e B">
          <input
            required
            value={groomName}
            onChange={(e) => setGroom(e.target.value)}
            className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="Kouamé"
          />
        </Field>
        <Field label="Date du mariage (facultatif)">
          <input
            type="date"
            value={weddingDate}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </Field>
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-primary px-4 py-3.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
      >
        Continuer
      </button>
    </form>
  );
}
