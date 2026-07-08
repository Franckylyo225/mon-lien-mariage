import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useWedding, type ThemeId } from "@/lib/wedding-store";

export const Route = createFileRoute("/onboarding/theme")({
  head: () => ({ meta: [{ title: "Étape 3 / 4 — Choisissez une ambiance" }] }),
  component: Step3,
});

const themes: {
  id: ThemeId;
  name: string;
  desc: string;
  swatch: string[];
  bg: string;
  fg: string;
}[] = [
  {
    id: "rose-elegance",
    name: "Rose Élégance",
    desc: "Bordeaux et rose poudré, serif classique.",
    swatch: ["#993556", "#FBEAF0", "#FAFAF9"],
    bg: "#FAFAF9",
    fg: "#993556",
  },
  {
    id: "ivoire-epure",
    name: "Ivoire Épuré",
    desc: "Ivoire, noir et or, minimaliste.",
    swatch: ["#111111", "#C9A84C", "#F8F5EF"],
    bg: "#F8F5EF",
    fg: "#111111",
  },
  {
    id: "wax-dore",
    name: "Wax Doré",
    desc: "Ambre et terracotta, esprit africain.",
    swatch: ["#B85C1E", "#E8CBA0", "#FAF3E7"],
    bg: "#FAF3E7",
    fg: "#B85C1E",
  },
];

function Step3() {
  const { couple, updateCouple, setOnboardingStep } = useWedding();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<ThemeId>(couple.theme ?? "rose-elegance");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-4xl italic">Choisissez une ambiance</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Vous pourrez la changer à tout moment.
        </p>
      </div>

      <div className="space-y-3">
        {themes.map((t) => {
          const active = selected === t.id;
          return (
            <button
              type="button"
              key={t.id}
              onClick={() => {
                setSelected(t.id);
                updateCouple({ theme: t.id });
              }}
              className={
                "flex w-full items-center gap-4 rounded-lg border-2 p-4 text-left transition " +
                (active ? "border-primary" : "border-border hover:border-muted-foreground/40")
              }
            >
              <div
                className="grid size-16 shrink-0 place-items-center rounded-md"
                style={{ backgroundColor: t.bg }}
              >
                <span className="font-serif text-2xl italic" style={{ color: t.fg }}>
                  Aa
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{t.name}</p>
                  <div className="flex gap-1">
                    {t.swatch.map((c) => (
                      <span
                        key={c}
                        className="size-3 rounded-full ring-1 ring-border"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{t.desc}</p>
              </div>
              <span
                className={
                  "grid size-6 shrink-0 place-items-center rounded-full border-2 " +
                  (active ? "border-primary bg-primary text-primary-foreground" : "border-border")
                }
              >
                {active ? "✓" : ""}
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => {
          updateCouple({ theme: selected });
          setOnboardingStep(3);
          navigate({ to: "/onboarding/guests" });
        }}
        className="w-full rounded-lg bg-primary px-4 py-3.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
      >
        Continuer
      </button>
    </div>
  );
}
