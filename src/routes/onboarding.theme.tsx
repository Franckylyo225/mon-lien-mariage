import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useWedding, type ThemeId } from "@/lib/wedding-store";
import { THEMES } from "@/lib/wedding-theme";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding/theme")({
  head: () => ({ meta: [{ title: "Étape 4 / 4 — Choisissez un thème" }] }),
  component: StepTheme,
});

const FEATURED: ThemeId[] = [
  "rose-elegance",
  "ivoire-epure",
  "or-antique",
  "vert-sauge",
  "wax-dore",
  "bleu-nuit",
];

const THEME_SWATCH: Record<string, { bg: string; fg: string }> = {
  "rose-elegance": { bg: "#F5EAEA", fg: "#993556" },
  "ivoire-epure": { bg: "#F7F3EC", fg: "#1A1A1A" },
  "or-antique": { bg: "#F5EFDC", fg: "#A08234" },
  "vert-sauge": { bg: "#E7EDE4", fg: "#5C6E4E" },
  "wax-dore": { bg: "#F4E9CE", fg: "#8C5A1D" },
  "bleu-nuit": { bg: "#DDE3EE", fg: "#1E2A4A" },
};

function StepTheme() {
  const { couple, updateCouple, setOnboardingStep } = useWedding();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<ThemeId>(couple.theme ?? "rose-elegance");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-4xl italic">Choisissez un thème</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Vous pourrez en changer à tout moment dans l'éditeur.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {FEATURED.map((slug) => {
          const t = THEMES[slug];
          const sw = THEME_SWATCH[slug] ?? { bg: "#F5F5F0", fg: "#333" };
          const active = selected === slug;
          return (
            <button
              key={slug}
              type="button"
              onClick={() => setSelected(slug)}
              className={cn(
                "flex flex-col overflow-hidden rounded-xl border bg-card text-left transition",
                active ? "border-[1.5px] border-foreground" : "border-border",
              )}
            >
              <div
                className="grid aspect-[4/5] place-items-center"
                style={{ backgroundColor: sw.bg }}
              >
                <span
                  className="font-serif text-3xl italic"
                  style={{ color: sw.fg, fontFamily: t.fontHeading }}
                >
                  Aa
                </span>
              </div>
              <div className="px-2 py-1.5">
                <p className="truncate text-[9px] font-medium uppercase tracking-wider">
                  {t.name}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-[9px] text-muted-foreground">
        +9 autres thèmes disponibles dans l'éditeur
      </p>

      <button
        onClick={async () => {
          await updateCouple({ theme: selected });
          await setOnboardingStep(4);
          navigate({ to: "/dashboard" });
        }}
        className="w-full rounded-lg bg-primary px-4 py-3.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
      >
        Voir mon tableau de bord
      </button>
    </div>
  );
}
