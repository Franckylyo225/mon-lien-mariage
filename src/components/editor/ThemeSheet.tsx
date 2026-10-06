import { BottomSheet } from "@/components/ui/bottom-sheet";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Couple, ThemeId } from "@/lib/wedding-store";
import { THEMES, THEME_FAMILIES, type ThemeFamilyId } from "@/lib/wedding-theme";
import { Check } from "lucide-react";
import { ThemeThumbnail } from "./ThemeThumbnail";
import { PalettePanel } from "./PalettePanel";
import { TypographyPanel } from "./TypographyPanel";

interface ThemeSheetProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  couple: Couple;
  onPatch: (patch: Partial<Couple>) => void;
}

export function ThemeSheet({ open, onOpenChange, couple, onPatch }: ThemeSheetProps) {
  const [tab, setTab] = useState<"theme" | "colors" | "typography">("theme");

  const currentFamily: ThemeFamilyId = THEMES[couple.theme]?.family ?? "classique";
  const [family, setFamily] = useState<ThemeFamilyId>(currentFamily);

  // A theme is a layout now, so switching one keeps the chosen palette. Only
  // the per-colour overrides are cleared, so the palette applies cleanly.
  const selectTheme = (slug: ThemeId) => {
    onPatch({
      theme: slug,
      accentColor: undefined,
      backgroundBase: undefined,
      secondaryColor: undefined,
      ornamentColor: undefined,
      textColor: undefined,
    });
  };

  const familyDef = THEME_FAMILIES.find((f) => f.id === family) ?? THEME_FAMILIES[0];

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="Thème & couleurs">
      {/* Tabs */}
      <div className="mb-4 inline-flex rounded-full border border-border bg-muted/40 p-1 text-xs">
        <button
          type="button"
          onClick={() => setTab("theme")}
          className={cn(
            "rounded-full px-4 py-1.5 font-mono uppercase tracking-widest transition",
            tab === "theme" ? "bg-foreground text-background" : "opacity-60",
          )}
        >
          Mise en page
        </button>
        <button
          type="button"
          onClick={() => setTab("colors")}
          className={cn(
            "rounded-full px-4 py-1.5 font-mono uppercase tracking-widest transition",
            tab === "colors" ? "bg-foreground text-background" : "opacity-60",
          )}
        >
          Couleurs
        </button>
        <button
          type="button"
          onClick={() => setTab("typography")}
          className={cn(
            "rounded-full px-4 py-1.5 font-mono uppercase tracking-widest transition",
            tab === "typography" ? "bg-foreground text-background" : "opacity-60",
          )}
        >
          Polices
        </button>
      </div>

      {tab === "theme" ? (
        <div className="space-y-4">
          {/* Family chips (sticky-like inside sheet) */}
          <div className="-mx-4 overflow-x-auto px-4">
            <div className="flex gap-2 pb-1">
              {THEME_FAMILIES.map((f) => {
                const active = f.id === family;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFamily(f.id)}
                    className={cn(
                      "shrink-0 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition",
                      active
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-background opacity-70",
                    )}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3-column grid of themes in the active family */}
          <div className="grid grid-cols-3 gap-2.5">
            {familyDef.themes.map((slug) => {
              const t = THEMES[slug];
              const active = couple.theme === slug;
              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => selectTheme(slug)}
                  className={cn(
                    "group relative flex flex-col overflow-hidden rounded-2xl border-2 text-left transition",
                    active ? "shadow-md" : "border-border hover:border-foreground/30",
                  )}
                  style={active ? { borderColor: t.defaultAccent } : undefined}
                >
                  <ThemeThumbnail theme={slug} />
                  <div className="flex flex-col gap-0.5 border-t border-border bg-background px-2 py-1.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="truncate text-[10px] font-medium">{t.name}</span>
                      {active && (
                        <span
                          className="grid size-3.5 shrink-0 place-items-center rounded-full text-white"
                          style={{ background: t.defaultAccent }}
                        >
                          <Check className="size-2" />
                        </span>
                      )}
                    </div>
                    <span className="truncate text-[8px] font-mono uppercase tracking-widest opacity-50">
                      {t.mood}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : tab === "colors" ? (
        <PalettePanel couple={couple} onPatch={onPatch} />
      ) : (
        <TypographyPanel couple={couple} onPatch={onPatch} defaultExpanded />
      )}

      <p className="mt-6 text-center text-[10px] italic opacity-50">
        Vos changements sont visibles en direct ci-dessus.
      </p>
    </BottomSheet>
  );
}
