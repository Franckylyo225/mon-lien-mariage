import { BottomSheet } from "@/components/ui/bottom-sheet";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Couple, ThemeId } from "@/lib/wedding-store";
import {
  ACCENTS,
  BACKGROUNDS,
  THEMES,
  THEME_FAMILIES,
  resolveTheme,
  type BackgroundSlug,
  type ThemeFamilyId,
} from "@/lib/wedding-theme";
import { Check } from "lucide-react";
import { ThemeThumbnail } from "./ThemeThumbnail";

interface ThemeSheetProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  couple: Couple;
  onPatch: (patch: Partial<Couple>) => void;
}

export function ThemeSheet({ open, onOpenChange, couple, onPatch }: ThemeSheetProps) {
  const [tab, setTab] = useState<"theme" | "colors">("theme");

  const currentFamily: ThemeFamilyId = THEMES[couple.theme]?.family ?? "classiques";
  const [family, setFamily] = useState<ThemeFamilyId>(currentFamily);

  const resolved = resolveTheme(couple);

  const selectTheme = (slug: ThemeId) => {
    // Applying a theme resets custom accent/background so the theme defaults kick in.
    onPatch({ theme: slug, accentColor: undefined, backgroundBase: undefined });
  };

  const selectAccent = (hex: string) => onPatch({ accentColor: hex });
  const selectBg = (slug: BackgroundSlug) => onPatch({ backgroundBase: slug });

  const restoreDefaults = () =>
    onPatch({ accentColor: undefined, backgroundBase: undefined });

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
          Thème
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
      ) : (
        <div className="space-y-6">
          <section>
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
              Couleur d'accent
            </p>
            <div className="grid grid-cols-6 gap-3">
              {ACCENTS.map((a) => {
                const active = resolved.accent.toLowerCase() === a.hex.toLowerCase();
                return (
                  <button
                    key={a.hex}
                    type="button"
                    onClick={() => selectAccent(a.hex)}
                    className="group flex flex-col items-center gap-1 text-center"
                    title={a.name}
                  >
                    <span
                      className={cn(
                        "grid size-11 place-items-center rounded-full transition",
                        active ? "ring-2 ring-offset-2 ring-offset-background" : "",
                      )}
                      style={{ background: a.hex, ["--tw-ring-color" as string]: a.hex }}
                    >
                      {active && (
                        <span className="grid size-5 place-items-center rounded-full bg-white">
                          <Check className="size-3" style={{ color: a.hex }} />
                        </span>
                      )}
                    </span>
                    <span className="line-clamp-1 text-[9px] opacity-70">{a.name}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
              Fond
            </p>
            <div className="grid grid-cols-2 gap-3">
              {BACKGROUNDS.map((b) => {
                const activeSlug =
                  couple.backgroundBase ?? THEMES[couple.theme]?.defaultBg;
                const active = activeSlug === b.slug;
                return (
                  <button
                    key={b.slug}
                    type="button"
                    onClick={() => selectBg(b.slug)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition",
                      active ? "" : "border-border",
                    )}
                    style={active ? { borderColor: resolved.accent } : undefined}
                  >
                    <span
                      className="grid h-16 w-full place-items-center rounded-lg border border-black/5"
                      style={{ background: b.hex }}
                    >
                      <span
                        className="text-2xl italic"
                        style={{
                          fontFamily: 'Playfair Display, serif',
                          color: "#1A1A1A",
                        }}
                      >
                        Aa
                      </span>
                    </span>
                    <span className="text-[11px]">{b.name}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <button
            type="button"
            onClick={restoreDefaults}
            disabled={!couple.accentColor && !couple.backgroundBase}
            className="w-full rounded-full border border-border bg-background py-3 text-center font-mono text-[11px] uppercase tracking-widest transition hover:border-foreground/40 hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Restaurer les valeurs du thème
          </button>
        </div>
      )}

      <p className="mt-6 text-center text-[10px] italic opacity-50">
        Vos changements sont visibles en direct ci-dessus.
      </p>
    </BottomSheet>
  );
}

function bgHex(slug: BackgroundSlug): string {
  return BACKGROUNDS.find((b) => b.slug === slug)?.hex ?? "#F5EFE7";
}
