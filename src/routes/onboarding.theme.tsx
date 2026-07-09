import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { IconEye, IconX, IconCheck } from "@tabler/icons-react";
import { useWedding, type ThemeId } from "@/lib/wedding-store";
import { THEMES, resolveTheme, themeCssString } from "@/lib/wedding-theme";
import { componentForTheme } from "@/components/invitation-templates";
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
  const { couple, ceremonies, updateCouple, setOnboardingStep } = useWedding();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<ThemeId>(couple.theme ?? "rose-elegance");
  const [previewOpen, setPreviewOpen] = useState(false);

  const confirmChoice = async () => {
    await updateCouple({ theme: selected });
    await setOnboardingStep(4);
    navigate({ to: "/dashboard" });
  };

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
        type="button"
        onClick={() => setPreviewOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium transition hover:bg-secondary/40"
      >
        <IconEye size={16} />
        Aperçu plein écran
      </button>

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
  // Lock body scroll while overlay open + esc to close
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
      {/* Header */}
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

      {/* Scrollable preview surface */}
      <div
        className="flex-1 overflow-y-auto overscroll-contain animate-in slide-in-from-bottom-4 duration-300"
        style={
          {
            [`--wedding-preview`]: "1",
          } as React.CSSProperties
        }
      >
        <div style={{ cssText: themeCssString(resolved) } as never}>
          <div style={parseCssText(themeCssString(resolved))}>
            <Template
              couple={themedCouple}
              ceremonies={ceremonies}
              rsvpSlot={null}
            />
          </div>
        </div>
      </div>

      {/* Sticky footer CTA */}
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

// Minimal couple shape for template rendering during preview.
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

// Convert "k:v;k:v" into a React style object for scoped CSS-var injection.
function parseCssText(css: string): React.CSSProperties {
  const style: Record<string, string> = {};
  for (const decl of css.split(";")) {
    const [k, v] = decl.split(":");
    if (k && v) style[k.trim()] = v.trim();
  }
  return style as React.CSSProperties;
}
