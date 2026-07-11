import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { IconX, IconCheck } from "@tabler/icons-react";
import { useWedding, type ThemeId } from "@/lib/wedding-store";
import {
  THEMES,
  THEME_FAMILIES,
  resolveTheme,
  themeCssString,
  type ThemeFamilyId,
} from "@/lib/wedding-theme";
import { componentForTheme } from "@/components/invitation-templates";
import { ThemeThumbnail } from "@/components/editor/ThemeThumbnail";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding/theme")({
  head: () => ({ meta: [{ title: "Étape 4 / 4 — Choisissez un thème" }] }),
  component: StepTheme,
});

function StepTheme() {
  const { couple, ceremonies, updateCouple, setOnboardingStep } = useWedding();
  const navigate = useNavigate();
  const initialTheme: ThemeId = (couple.theme as ThemeId) ?? "rose-elegance";
  const [selected, setSelected] = useState<ThemeId>(initialTheme);
  const [family, setFamily] = useState<ThemeFamilyId>(
    THEMES[initialTheme]?.family ?? "classiques",
  );
  const [previewOpen, setPreviewOpen] = useState(false);

  const confirmChoice = async () => {
    await updateCouple({ theme: selected });
    await setOnboardingStep(4);
    navigate({ to: "/dashboard" });
  };

  const familyDef =
    THEME_FAMILIES.find((f) => f.id === family) ?? THEME_FAMILIES[0];

  const onThemeTap = (slug: ThemeId) => {
    if (slug === selected) {
      // Second tap on the already-selected theme: zoom to live full-screen preview.
      setPreviewOpen(true);
      return;
    }
    setSelected(slug);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-4xl italic">Choisissez un thème</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Touchez un thème pour le sélectionner, touchez à nouveau pour
          l'agrandir. Vous pourrez en changer à tout moment.
        </p>
      </div>

      {/* Sticky family chips */}
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

      {/* Grid of themes in the active family */}
      <div className="grid grid-cols-3 gap-2.5">
        {familyDef.themes.map((slug) => {
          const t = THEMES[slug];
          const active = selected === slug;
          return (
            <button
              key={slug}
              type="button"
              onClick={() => onThemeTap(slug)}
              aria-pressed={active}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-2xl border-2 text-left transition",
                active
                  ? "shadow-md"
                  : "border-border hover:border-foreground/30",
              )}
              style={active ? { borderColor: t.defaultAccent } : undefined}
            >
              <ThemeThumbnail theme={slug} />
              <div className="flex flex-col gap-0.5 border-t border-border bg-background px-2 py-1.5">
                <div className="flex items-center justify-between gap-1">
                  <span className="truncate text-[10px] font-medium">
                    {t.name}
                  </span>
                  {active && (
                    <span
                      className="grid size-3.5 shrink-0 place-items-center rounded-full text-white"
                      style={{ background: t.defaultAccent }}
                    >
                      <IconCheck size={8} strokeWidth={3} />
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

      <button
        onClick={confirmChoice}
        className="w-full rounded-lg bg-primary px-4 py-3.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
      >
        Voir mon tableau de bord
      </button>

      {previewOpen ? (
        <ThemePreviewOverlay
          themeSlug={selected}
          coupleName={{
            brideName: couple.brideName || "Aïcha",
            groomName: couple.groomName || "Kouamé",
          }}
          weddingDate={couple.weddingDate}
          city={couple.city}
          ceremonies={ceremonies}
          onClose={() => setPreviewOpen(false)}
          onConfirm={async () => {
            setPreviewOpen(false);
            await confirmChoice();
          }}
        />
      ) : null}
    </div>
  );
}

function ThemePreviewOverlay({
  themeSlug,
  coupleName,
  weddingDate,
  city,
  ceremonies,
  onClose,
  onConfirm,
}: {
  themeSlug: ThemeId;
  coupleName: { brideName: string; groomName: string };
  weddingDate: string;
  city: string;
  ceremonies: ReturnType<typeof useWedding>["ceremonies"];
  onClose: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const previewCouple = useMemo(
    () => ({
      ...emptyPreviewCouple(),
      brideName: coupleName.brideName,
      groomName: coupleName.groomName,
      weddingDate: weddingDate || "2027-02-14",
      city: city || "Abidjan",
      theme: themeSlug,
    }),
    [themeSlug, coupleName.brideName, coupleName.groomName, weddingDate, city],
  );

  const resolved = useMemo(() => resolveTheme(previewCouple), [previewCouple]);
  const Template = componentForTheme(themeSlug);
  const themeName = THEMES[themeSlug].name;
  const themedCouple = { ...previewCouple, accent: resolved.accent };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-background animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label={`Aperçu du thème ${themeName}`}
    >
      <div className="flex shrink-0 items-center gap-2 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer l'aperçu"
          className="grid size-9 shrink-0 place-items-center rounded-full border border-border transition active:bg-secondary/60"
        >
          <IconX size={18} />
        </button>
        <div className="min-w-0 flex-1 text-center">
          <p className="text-[9px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
            Aperçu
          </p>
          <p className="truncate font-serif text-sm italic">{themeName}</p>
        </div>
        <div className="size-9 shrink-0" aria-hidden />
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain animate-in slide-in-from-bottom-4 duration-300">
        <div style={parseCssText(themeCssString(resolved))}>
          <Template couple={themedCouple} ceremonies={ceremonies} rsvpSlot={null} />
        </div>
      </div>

      <div className="shrink-0 border-t border-border bg-background/95 px-4 py-3 backdrop-blur [padding-bottom:calc(env(safe-area-inset-bottom)+0.75rem)]">
        <button
          type="button"
          onClick={onConfirm}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          <IconCheck size={16} strokeWidth={2.5} />
          Choisir ce thème
        </button>
      </div>
    </div>
  );
}

function emptyPreviewCouple() {
  return {
    brideName: "",
    groomName: "",
    weddingDate: "",
    rsvpDeadline: undefined,
    city: "Abidjan",
    introMessage:
      "Sous le soleil, nous scellons notre promesse. Nous vous invitons à célébrer cette union.",
    templateId: "terracotta" as const,
    theme: "rose-elegance" as ThemeId,
    isPublished: false,
    isLocked: false,
    countdownEnabled: true,
    countdownUnits: ["days", "hours", "minutes", "seconds"] as Array<
      "days" | "hours" | "minutes" | "seconds"
    >,
  };
}

function parseCssText(css: string): React.CSSProperties {
  const style: Record<string, string> = {};
  for (const decl of css.split(";")) {
    const [k, v] = decl.split(":");
    if (k && v) style[k.trim()] = v.trim();
  }
  return style as React.CSSProperties;
}
