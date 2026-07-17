import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useWedding, type EventType } from "@/lib/wedding-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding/evenement")({
  head: () => ({ meta: [{ title: "Étape 2 / 4 — Votre événement" }] }),
  component: StepEvenement,
});

type Option = { value: EventType; label: string; blurb: string; icon: string };

const OPTIONS: Option[] = [
  { value: "mariage", label: "Mariage", blurb: "Union officielle", icon: "◈" },
  { value: "coutumier", label: "Mariage coutumier", blurb: "Rites & traditions", icon: "✿" },
  { value: "anniversaire", label: "Anniversaire", blurb: "De mariage", icon: "✦" },
  { value: "autre", label: "Autre", blurb: "Célébration", icon: "⋯" },
];

function StepEvenement() {
  const { couple, updateCouple, setOnboardingStep } = useWedding();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<EventType>(couple.eventType ?? "mariage");
  const [customLabel, setCustomLabel] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-4xl italic">Votre événement</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Choisissez le type de célébration.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {OPTIONS.map((o) => {
          const active = selected === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => setSelected(o.value)}
              className={cn(
                "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition",
                active
                  ? "border-[1.5px] border-foreground bg-secondary/60"
                  : "border-border bg-card hover:bg-secondary/20",
              )}
            >
              <span className="font-serif text-2xl italic">{o.icon}</span>
              <p className="font-medium text-sm">{o.label}</p>
              <p className="text-xs text-muted-foreground">{o.blurb}</p>
            </button>
          );
        })}
      </div>

      {selected === "autre" ? (
        <input
          value={customLabel}
          onChange={(e) => setCustomLabel(e.target.value)}
          className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          placeholder="Quel type de célébration ?"
        />
      ) : null}

      <p className="text-[9px] text-muted-foreground">
        Les étapes de votre mariage (dot, civil, réception…) se configurent plus tard dans le programme.
      </p>

      <button
        onClick={async () => {
          await updateCouple({ eventType: selected });
          await setOnboardingStep(2);
          navigate({ to: "/onboarding/dates" });
        }}
        className="w-full rounded-lg bg-primary px-4 py-3.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
      >
        Continuer
      </button>
    </div>
  );
}
