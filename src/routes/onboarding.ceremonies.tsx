import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useWedding, type CeremonyType } from "@/lib/wedding-store";
import { ceremonyMeta } from "@/lib/ceremony-meta";

export const Route = createFileRoute("/onboarding/ceremonies")({
  head: () => ({ meta: [{ title: "Étape 2 / 4 — Vos cérémonies" }] }),
  component: Step2,
});

const options: { value: CeremonyType; preset: boolean }[] = [
  { value: "dot", preset: true },
  { value: "civil", preset: true },
  { value: "diner", preset: true },
  { value: "religieux", preset: false },
  { value: "fiancailles", preset: false },
  { value: "autre", preset: false },
];

function Step2() {
  const { addCeremony, setOnboardingStep, ceremonies } = useWedding();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Set<CeremonyType>>(
    new Set(options.filter((o) => o.preset).map((o) => o.value)),
  );
  const [autreLabel, setAutreLabel] = useState("");

  const toggle = (t: CeremonyType) => {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(t)) n.delete(t); else n.add(t);
      return n;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-4xl italic">Combien de célébrations ?</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Sélectionnez, vous détaillerez ensuite.
        </p>
      </div>

      <div className="space-y-2">
        {options.map((o) => {
          const meta = ceremonyMeta[o.value];
          const active = selected.has(o.value);
          return (
            <button
              type="button"
              key={o.value}
              onClick={() => toggle(o.value)}
              className={
                "flex w-full items-center gap-4 rounded-lg border px-4 py-4 text-left transition " +
                (active
                  ? "border-primary bg-secondary/50"
                  : "border-border bg-card hover:bg-secondary/20")
              }
            >
              <span
                className={
                  "grid size-6 shrink-0 place-items-center rounded border-2 " +
                  (active ? "border-primary bg-primary text-primary-foreground" : "border-border")
                }
              >
                {active ? "✓" : ""}
              </span>
              <span
                className="grid size-9 shrink-0 place-items-center rounded-md font-serif italic text-white"
                style={{ backgroundColor: meta.color }}
              >
                {meta.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{meta.label}</p>
                <p className="text-xs text-muted-foreground">{meta.blurb}</p>
              </div>
            </button>
          );
        })}

        {selected.has("autre") ? (
          <input
            value={autreLabel}
            onChange={(e) => setAutreLabel(e.target.value)}
            className="mt-2 w-full rounded-lg border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="Nom de votre cérémonie personnalisée"
          />
        ) : null}
      </div>

      <button
        onClick={() => {
          // Créer les cérémonies (nouvelles seulement) — évite les doublons si retour
          const existingTypes = new Set(ceremonies.map((c) => c.type));
          selected.forEach((t) => {
            if (existingTypes.has(t)) return;
            const meta = ceremonyMeta[t];
            addCeremony({
              type: t,
              label: meta.label,
              name: t === "autre" && autreLabel ? autreLabel : meta.label,
              date: "",
              timeStart: "",
              venue: "",
              color: meta.color,
              status: "brouillon",
            });
          });
          setOnboardingStep(2);
          navigate({ to: "/onboarding/theme" });
        }}
        disabled={selected.size === 0}
        className="w-full rounded-lg bg-primary px-4 py-3.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
      >
        Continuer
      </button>
    </div>
  );
}
