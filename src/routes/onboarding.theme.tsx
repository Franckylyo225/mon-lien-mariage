import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useWedding, type ThemeId } from "@/lib/wedding-store";
import { THEMES, THEME_FAMILIES, BACKGROUNDS } from "@/lib/wedding-theme";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding/theme")({
  head: () => ({ meta: [{ title: "Étape 3 / 4 — Choisissez un thème" }] }),
  component: Step3,
});

function bgHex(slug: string): string {
  return BACKGROUNDS.find((b) => b.slug === slug)?.hex ?? "#F5EFE7";
}

function Step3() {
  const { couple, updateCouple, setOnboardingStep } = useWedding();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<ThemeId>(couple.theme ?? "rose-elegance");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-4xl italic">Choisissez un thème</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Vous pourrez le changer à tout moment.
        </p>
      </div>

      <div className="space-y-6">
        {THEME_FAMILIES.map((fam) => (
          <section key={fam.id} className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              {fam.label}
            </p>
            <div className="-mx-4 overflow-x-auto px-4">
              <div className="flex gap-3 pb-2">
                {fam.themes.map((slug) => {
                  const t = THEMES[slug];
                  const active = selected === slug;
                  return (
                    <button
                      type="button"
                      key={slug}
                      onClick={() => {
                        setSelected(slug);
                        updateCouple({ theme: slug });
                      }}
                      className={cn(
                        "shrink-0 flex flex-col overflow-hidden rounded-2xl border-2 text-left transition",
                        active ? "shadow-md" : "border-border hover:border-muted-foreground/40",
                      )}
                      style={active ? { borderColor: t.defaultAccent } : undefined}
                    >
                      <div
                        className="flex h-40 w-32 flex-col items-center justify-center px-3 text-center"
                        style={{ background: bgHex(t.defaultBg) }}
                      >
                        <p
                          className="mb-1 font-mono text-[8px] uppercase tracking-[0.25em]"
                          style={{ color: t.defaultAccent }}
                        >
                          Save the date
                        </p>
                        <p
                          className="text-base leading-tight italic"
                          style={{ fontFamily: t.fontHeading, color: "#1A1A1A" }}
                        >
                          Aïcha
                          <br />&amp;<br />
                          Kouamé
                        </p>
                        <span
                          className="mt-2 block h-px w-6"
                          style={{ background: t.defaultAccent }}
                        />
                      </div>
                      <div className="border-t border-border bg-background px-3 py-1.5">
                        <p className="truncate text-[11px] font-medium">{t.name}</p>
                        <p className="truncate font-mono text-[8px] uppercase tracking-widest opacity-50">
                          {t.mood}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        ))}
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
