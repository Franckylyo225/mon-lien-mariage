import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Drawer } from "vaul";
import { Check, Expand, X } from "lucide-react";
import { useWedding, type ThemeId } from "@/lib/wedding-store";
import { THEMES, THEME_FAMILIES, resolveTheme, type ThemeFamilyId } from "@/lib/wedding-theme";
import { componentForTheme } from "@/components/invitation-templates";
import { ThemeThumbnail } from "@/components/editor/ThemeThumbnail";
import { couplePhotoForTheme } from "@/lib/couple-photos";
import { THEME_THUMBNAIL_URL } from "@/lib/theme-thumbnails";
import { placeholderNamesFor } from "@/lib/ceremony-meta";
import {
  onboardingNextDestination,
  onboardingStepAfter,
  onboardingStepTitle,
} from "@/lib/onboarding-steps";
import { preloadThemeFonts } from "@/hooks/use-wedding-fonts";
import { cn } from "@/lib/utils";
import { ThemeRoot } from "@/components/theme/ThemeRoot";

const STEP = "/onboarding/theme";

export const Route = createFileRoute("/onboarding/theme")({
  head: () => ({ meta: [{ title: onboardingStepTitle(STEP, "Choisissez un thème") }] }),
  component: StepTheme,
});

/**
 * Sheet snap points. Collapsed holds the handle, the family chips, one row of
 * theme thumbnails and the CTA — nothing more, so the preview keeps the rest.
 * vaul runs `parseInt` on string snap points, so these must be plain pixels.
 */
const SHEET_COLLAPSED_PX = 330;
const SHEET_EXPANDED = 0.88;
const SHEET_COLLAPSED = `${SHEET_COLLAPSED_PX}px`;
const SNAP_POINTS: (string | number)[] = [SHEET_COLLAPSED, SHEET_EXPANDED];

/** The preview takes everything the collapsed sheet and the step chrome leave. */
const PREVIEW_HEIGHT = `clamp(18rem, calc(100dvh - ${SHEET_COLLAPSED_PX}px - 8.5rem), 46rem)`;

function StepTheme() {
  const { couple, ceremonies, updateCouple, setOnboardingStep } = useWedding();
  const navigate = useNavigate();

  const initialTheme: ThemeId = (couple.theme as ThemeId) ?? "rose-elegance";
  const [selected, setSelected] = useState<ThemeId>(initialTheme);
  const [family, setFamily] = useState<ThemeFamilyId>(THEMES[initialTheme]?.family ?? "classique");
  const [snap, setSnap] = useState<number | string | null>(SNAP_POINTS[0]);
  const [fullscreen, setFullscreen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const keptScroll = useRef(0);

  const previewCouple = usePreviewCouple(couple, selected);
  const familyDef = THEME_FAMILIES.find((f) => f.id === family) ?? THEME_FAMILIES[0];
  const selectedName = THEMES[selected].name;

  /**
   * Switching theme swaps the template component (see `componentForTheme`),
   * which resets the scroll box. Re-apply the offset in the same frame so the
   * preview stays exactly where the user was reading.
   */
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el && keptScroll.current > 0) el.scrollTop = keptScroll.current;
  }, [selected]);

  /** Warm the assets of every theme the user can reach in one tap. */
  useEffect(() => {
    preloadThemeFonts(familyDef.themes);
    for (const slug of familyDef.themes) {
      // The hero photo feeds the live preview, the thumbnail feeds the picker.
      for (const url of [couplePhotoForTheme(slug), THEME_THUMBNAIL_URL[slug]]) {
        if (!url) continue;
        const img = new Image();
        img.src = url;
      }
    }
  }, [familyDef]);

  const pickTheme = (slug: ThemeId) => {
    keptScroll.current = scrollRef.current?.scrollTop ?? 0;
    setSelected(slug);
  };

  const confirmChoice = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await updateCouple({ theme: selected });
      await setOnboardingStep(onboardingStepAfter(STEP));
      navigate({ to: onboardingNextDestination(STEP) });
    } catch {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="sr-only">Choisissez un thème</h1>

      {/* Live preview — breaks out of the layout gutter to sit edge to edge. */}
      <div className="-mx-5 sm:mx-0">
        <div
          className="relative overflow-hidden border-y border-border bg-background sm:rounded-2xl sm:border"
          style={{ height: PREVIEW_HEIGHT }}
        >
          <div
            ref={scrollRef}
            onScroll={(e) => {
              const top = e.currentTarget.scrollTop;
              keptScroll.current = top;
              setScrolled(top > 24);
            }}
            className="h-full overflow-y-auto overscroll-contain"
          >
            <ThemePreviewSurface
              themeSlug={selected}
              previewCouple={previewCouple}
              ceremonies={ceremonies}
            />
          </div>

          <button
            type="button"
            onClick={() => setFullscreen(true)}
            aria-label="Agrandir l'aperçu en plein écran"
            className="absolute right-3 top-3 z-20 grid size-9 place-items-center rounded-full border border-border bg-background/85 text-foreground shadow-sm backdrop-blur transition active:scale-95"
          >
            <Expand size={16} />
          </button>

          {/*
            Scroll affordance. Only a fade: 21 of the templates already render
            their own "Scrollez vers le bas" chevron inside the content, and a
            second one would read as a duplicate. z-20 clears ThemeRoot's z-10
            content layer.
          */}
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-0 z-20 h-14 bg-gradient-to-t from-black/15 to-transparent transition-opacity duration-300",
              scrolled ? "opacity-0" : "opacity-100",
            )}
          />
        </div>
      </div>

      {/* Spacer so the preview can be scrolled clear of the resting sheet. */}
      <div aria-hidden style={{ height: SHEET_COLLAPSED }} />

      <Drawer.Root
        open
        modal={false}
        dismissible={false}
        snapPoints={SNAP_POINTS}
        activeSnapPoint={snap}
        setActiveSnapPoint={setSnap}
      >
        <Drawer.Portal>
          <Drawer.Content
            className="fixed inset-x-0 bottom-0 z-40 mx-auto flex h-full w-full max-w-lg flex-col rounded-t-3xl border border-b-0 border-border bg-background outline-none"
            aria-label="Choix du thème"
          >
            <Drawer.Title className="sr-only">Choisissez un thème</Drawer.Title>
            <Drawer.Description className="sr-only">
              Faites glisser ce panneau vers le haut pour voir tous les thèmes de la famille
              sélectionnée.
            </Drawer.Description>

            <div className="flex shrink-0 cursor-grab flex-col items-center gap-1 pb-2 pt-2.5 active:cursor-grabbing">
              <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
              <p className="text-[11px] text-muted-foreground">Votre invitation, en direct</p>
            </div>

            <FamilyChips family={family} onChange={setFamily} />

            <ThemePillRow themes={familyDef.themes} selected={selected} onSelect={pickTheme} />

            <div className="shrink-0 px-4 pb-3 pt-0.5">
              <button
                type="button"
                onClick={confirmChoice}
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 btn-accent-gradient rounded-xl px-4 py-3.5 text-sm font-semibold disabled:opacity-60"
              >
                <Check size={16} strokeWidth={2.5} />
                <span className="truncate">
                  {saving ? "Enregistrement…" : `Choisir « ${selectedName} »`}
                </span>
              </button>
            </div>

            {/* Below the collapsed fold: the full grid, reached by dragging up. */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain border-t border-border px-4 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-3">
              <p className="pb-2.5 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                Tous les thèmes · {familyDef.label}
              </p>
              <div className="grid grid-cols-3 gap-2.5">
                {familyDef.themes.map((slug) => (
                  <ThemePill
                    key={slug}
                    slug={slug}
                    active={selected === slug}
                    onSelect={pickTheme}
                    layout="wide"
                  />
                ))}
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {fullscreen ? (
        <ThemePreviewOverlay
          themeSlug={selected}
          previewCouple={previewCouple}
          ceremonies={ceremonies}
          onClose={() => setFullscreen(false)}
          onConfirm={async () => {
            setFullscreen(false);
            await confirmChoice();
          }}
        />
      ) : null}
    </div>
  );
}

/**
 * The themed invitation itself.
 *
 * `ThemeRoot` already derives and applies every `--wedding-*` variable from the
 * couple it is given, so switching theme only swaps those variables: the
 * wrapper never unmounts and the colours cross-fade. Templates that map to a
 * different component do remount, which is inherent to `componentForTheme`.
 */
function ThemePreviewSurface({
  themeSlug,
  previewCouple,
  ceremonies,
}: {
  themeSlug: ThemeId;
  previewCouple: PreviewCouple;
  ceremonies: ReturnType<typeof useWedding>["ceremonies"];
}) {
  const Template = componentForTheme(themeSlug);
  const resolved = useMemo(() => resolveTheme(previewCouple), [previewCouple]);
  const themedCouple = useMemo(
    () => ({ ...previewCouple, accent: resolved.accent }),
    [previewCouple, resolved.accent],
  );

  return (
    <ThemeRoot couple={previewCouple} className="transition-colors duration-300 ease-out">
      <Template couple={themedCouple} ceremonies={ceremonies} rsvpSlot={null} />
    </ThemeRoot>
  );
}

function FamilyChips({
  family,
  onChange,
}: {
  family: ThemeFamilyId;
  onChange: (id: ThemeFamilyId) => void;
}) {
  return (
    <div className="shrink-0 overflow-x-auto px-4 pb-2 pt-0.5">
      <div className="flex gap-2">
        {THEME_FAMILIES.map((f) => {
          const active = f.id === family;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onChange(f.id)}
              aria-pressed={active}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition",
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
  );
}

/** Horizontal quick picker, visible while the sheet rests collapsed. */
function ThemePillRow({
  themes,
  selected,
  onSelect,
}: {
  themes: readonly ThemeId[];
  selected: ThemeId;
  onSelect: (slug: ThemeId) => void;
}) {
  return (
    <div className="shrink-0 overflow-x-auto px-4 pb-2.5">
      <div className="flex gap-2.5">
        {themes.map((slug) => (
          <ThemePill
            key={slug}
            slug={slug}
            active={selected === slug}
            onSelect={onSelect}
            layout="compact"
          />
        ))}
      </div>
    </div>
  );
}

/**
 * A theme card: the real screenshot of that theme's invitation, its name and
 * the selected state. Same thumbnail asset the editor's theme sheet uses, so
 * the two pickers stay visually identical.
 */
function ThemePill({
  slug,
  active,
  onSelect,
  layout,
}: {
  slug: ThemeId;
  active: boolean;
  onSelect: (slug: ThemeId) => void;
  layout: "compact" | "wide";
}) {
  const t = THEMES[slug];

  return (
    <button
      type="button"
      onClick={() => onSelect(slug)}
      aria-pressed={active}
      aria-label={`Thème ${t.name}`}
      className={cn(
        "group relative flex shrink-0 flex-col overflow-hidden rounded-2xl border-2 text-left transition",
        active ? "shadow-md" : "border-border hover:border-foreground/30",
        layout === "compact" ? "w-[6.5rem]" : "w-full",
      )}
      style={active ? { borderColor: t.defaultAccent } : undefined}
    >
      <ThemeThumbnail theme={slug} />
      <div className="flex items-center justify-between gap-1 border-t border-border bg-background px-2 py-1.5">
        <span className="truncate text-[10px] font-medium">{t.name}</span>
        {active ? (
          <span
            className="grid size-3.5 shrink-0 place-items-center rounded-full text-white"
            style={{ background: t.defaultAccent }}
          >
            <Check size={8} strokeWidth={3} />
          </span>
        ) : null}
      </div>
    </button>
  );
}

function ThemePreviewOverlay({
  themeSlug,
  previewCouple,
  ceremonies,
  onClose,
  onConfirm,
}: {
  themeSlug: ThemeId;
  previewCouple: PreviewCouple;
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

  const themeName = THEMES[themeSlug].name;

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
          <X size={18} />
        </button>
        <div className="min-w-0 flex-1 text-center">
          <p className="text-[9px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
            Aperçu
          </p>
          <p className="truncate font-serif text-sm italic">{themeName}</p>
        </div>
        <div className="size-9 shrink-0" aria-hidden />
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain">
        <ThemePreviewSurface
          themeSlug={themeSlug}
          previewCouple={previewCouple}
          ceremonies={ceremonies}
        />
      </div>

      <div className="shrink-0 border-t border-border bg-background/95 px-4 py-3 backdrop-blur [padding-bottom:calc(env(safe-area-inset-bottom)+0.75rem)]">
        <button
          type="button"
          onClick={onConfirm}
          className="flex w-full items-center justify-center gap-2 btn-accent-gradient rounded-xl px-4 py-3.5 text-sm font-semibold"
        >
          <Check size={16} strokeWidth={2.5} />
          Choisir ce thème
        </button>
      </div>
    </div>
  );
}

type PreviewCouple = ReturnType<typeof usePreviewCouple>;

/**
 * Builds the couple handed to the preview: the real data entered during
 * onboarding, with per-event-type placeholder names and the theme's demo photo
 * standing in for anything still blank. Shared by the inline preview and the
 * full-screen overlay so the two can never drift apart.
 */
function usePreviewCouple(couple: ReturnType<typeof useWedding>["couple"], themeSlug: ThemeId) {
  const {
    brideName,
    groomName,
    weddingDate,
    city,
    customFontTitle,
    customFontBody,
    eventType,
    heroImageUrl,
  } = couple;

  return useMemo(() => {
    const fallback = placeholderNamesFor(eventType);
    return {
      ...emptyPreviewCouple(),
      brideName: brideName || fallback.brideName,
      groomName: groomName || fallback.groomName,
      weddingDate: weddingDate || "2027-02-14",
      city: city || "Abidjan",
      // Without a photo the preview reads poorer than its own thumbnails; this
      // is the same demo pool the thumbnail generator already uses.
      heroImageUrl: heroImageUrl || couplePhotoForTheme(themeSlug),
      theme: themeSlug,
      customFontTitle,
      customFontBody,
    };
  }, [
    brideName,
    groomName,
    weddingDate,
    city,
    customFontTitle,
    customFontBody,
    eventType,
    heroImageUrl,
    themeSlug,
  ]);
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
