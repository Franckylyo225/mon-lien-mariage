import { useState } from "react";
import { Check, ChevronDown, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Couple } from "@/lib/wedding-store";
import { resolveTheme } from "@/lib/wedding-theme";
import {
  PALETTE_LIST,
  contrastRatio,
  adjustForContrast,
  AA_TEXT,
  isHex,
  type PaletteId,
} from "@/lib/wedding-palette";
import { HexEditor } from "./HexEditor";

interface Props {
  couple: Couple;
  onPatch: (patch: Partial<Couple>) => void;
}

/**
 * Colour tab of the theme sheet: eight ready-made palettes first, then the
 * three roles a couple may override, then the two that break a page most
 * easily, folded away under "Avancé".
 *
 * Ink is never offered as a primary choice — it follows the background — so
 * the quickest path through this panel cannot produce an unreadable page.
 */
export function PalettePanel({ couple, onPatch }: Props) {
  const [open, setOpen] = useState<"bg" | "accent" | "deep" | "ornament" | "text" | null>(null);
  const [advanced, setAdvanced] = useState(false);
  const resolved = resolveTheme(couple);

  const selectPalette = (slug: PaletteId) => {
    // Picking a palette clears every override, otherwise the new colours would
    // only half-apply and the couple would think the palette is broken.
    setOpen(null);
    onPatch({
      palette: slug,
      accentColor: undefined,
      backgroundBase: undefined,
      secondaryColor: undefined,
      ornamentColor: undefined,
      textColor: undefined,
    });
  };

  const hasOverride =
    !!couple.accentColor ||
    !!couple.backgroundBase ||
    !!couple.secondaryColor ||
    !!couple.ornamentColor ||
    !!couple.textColor;

  const accentRatio = contrastRatio(resolved.accent, resolved.bg);
  const accentTooLight = accentRatio < AA_TEXT;

  return (
    <div className="space-y-6">
      <section>
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">Palettes</p>
        <div className="space-y-2">
          {PALETTE_LIST.map((p) => {
            const active = couple.palette === p.slug;
            return (
              <button
                key={p.slug}
                type="button"
                onClick={() => selectPalette(p.slug)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border-2 px-3 py-2.5 text-left transition",
                  active ? "" : "border-border hover:border-foreground/30",
                )}
                style={active ? { borderColor: p.accent } : undefined}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium">{p.name}</span>
                  <span className="block truncate font-mono text-[9px] uppercase tracking-widest opacity-50">
                    {p.mood}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1">
                  {[p.bg, p.accent, p.deep, p.ornament].map((c, i) => (
                    <span
                      key={i}
                      className="size-5 rounded-md border border-black/10"
                      style={{ background: c }}
                    />
                  ))}
                </span>
                {active ? (
                  <span
                    className="grid size-4 shrink-0 place-items-center rounded-full text-white"
                    style={{ background: p.accent }}
                  >
                    <Check className="size-2.5" strokeWidth={3} />
                  </span>
                ) : (
                  <span className="size-4 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
          Personnalisation
        </p>
        <div className="space-y-2">
          <ColorRow
            label="Fond"
            swatch={resolved.bg}
            overridden={isHex(couple.backgroundBase)}
            expanded={open === "bg"}
            onToggle={() => setOpen(open === "bg" ? null : "bg")}
          >
            <HexEditor
              value={resolved.bg}
              onChange={(v) => onPatch({ backgroundBase: v })}
              onClose={() => setOpen(null)}
              onRemove={
                couple.backgroundBase ? () => onPatch({ backgroundBase: undefined }) : undefined
              }
              label="Couleur de fond"
              helper="Le texte passe automatiquement en clair ou en foncé selon ce fond."
            />
          </ColorRow>

          <ColorRow
            label="Accent"
            swatch={resolved.accent}
            overridden={!!couple.accentColor}
            expanded={open === "accent"}
            onToggle={() => setOpen(open === "accent" ? null : "accent")}
            warning={
              accentTooLight
                ? `Contraste ${accentRatio.toFixed(1)}:1 sur le fond — en dessous de 4,5:1, le petit texte devient difficile à lire.`
                : undefined
            }
            onFixWarning={
              accentTooLight
                ? () => onPatch({ accentColor: adjustForContrast(resolved.accent, resolved.bg) })
                : undefined
            }
          >
            <HexEditor
              value={resolved.accent}
              onChange={(v) => onPatch({ accentColor: v })}
              onClose={() => setOpen(null)}
              onRemove={couple.accentColor ? () => onPatch({ accentColor: undefined }) : undefined}
              label="Couleur d'accent"
              helper="Boutons, petits titres et liens."
            />
          </ColorRow>

          <ColorRow
            label="Secondaire"
            swatch={resolved.deep}
            overridden={!!couple.secondaryColor}
            expanded={open === "deep"}
            onToggle={() => setOpen(open === "deep" ? null : "deep")}
          >
            <HexEditor
              value={resolved.deep}
              onChange={(v) => onPatch({ secondaryColor: v })}
              onClose={() => setOpen(null)}
              onRemove={
                couple.secondaryColor ? () => onPatch({ secondaryColor: undefined }) : undefined
              }
              label="Couleur secondaire"
              helper="Bandeaux, voiles sur les photos et pied de page."
            />
          </ColorRow>
        </div>
      </section>

      <section>
        <button
          type="button"
          onClick={() => setAdvanced((v) => !v)}
          className="flex w-full items-center justify-between rounded-xl px-1 py-2 font-mono text-[10px] uppercase tracking-[0.2em] opacity-60 transition hover:opacity-100"
          aria-expanded={advanced}
        >
          Avancé
          <ChevronDown
            className={cn("size-4 transition-transform", advanced && "rotate-180")}
            strokeWidth={1.75}
          />
        </button>

        {advanced ? (
          <div className="mt-2 space-y-2">
            <ColorRow
              label="Ornement"
              swatch={resolved.ornament}
              overridden={!!couple.ornamentColor}
              expanded={open === "ornament"}
              onToggle={() => setOpen(open === "ornament" ? null : "ornament")}
            >
              <HexEditor
                value={resolved.ornament}
                onChange={(v) => onPatch({ ornamentColor: v })}
                onClose={() => setOpen(null)}
                onRemove={
                  couple.ornamentColor ? () => onPatch({ ornamentColor: undefined }) : undefined
                }
                label="Couleur d'ornement"
                helper="Filets, cadres et filigranes. Jamais utilisée pour du texte : un métal lisible n'est plus un métal."
              />
            </ColorRow>

            <ColorRow
              label="Texte"
              swatch={resolved.textPrimary}
              overridden={!!couple.textColor}
              expanded={open === "text"}
              onToggle={() => setOpen(open === "text" ? null : "text")}
            >
              <HexEditor
                value={resolved.textPrimary}
                onChange={(v) => onPatch({ textColor: v })}
                onClose={() => setOpen(null)}
                onRemove={couple.textColor ? () => onPatch({ textColor: undefined }) : undefined}
                label="Couleur du texte"
                helper="Laissez vide pour que le texte s'adapte tout seul au fond."
              />
            </ColorRow>
          </div>
        ) : null}
      </section>

      <button
        type="button"
        onClick={() => {
          setOpen(null);
          onPatch({
            accentColor: undefined,
            backgroundBase: undefined,
            secondaryColor: undefined,
            ornamentColor: undefined,
            textColor: undefined,
          });
        }}
        disabled={!hasOverride}
        className="w-full rounded-full border border-border bg-background py-3 text-center font-mono text-[11px] uppercase tracking-widest transition hover:border-foreground/40 hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Revenir aux couleurs de la palette
      </button>
    </div>
  );
}

function ColorRow({
  label,
  swatch,
  overridden,
  expanded,
  onToggle,
  warning,
  onFixWarning,
  children,
}: {
  label: string;
  swatch: string;
  overridden: boolean;
  expanded: boolean;
  onToggle: () => void;
  warning?: string;
  onFixWarning?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
        aria-expanded={expanded}
      >
        <span
          className="size-7 shrink-0 rounded-lg border border-black/10"
          style={{ background: swatch }}
        />
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-medium">{label}</span>
          <span className="block font-mono text-[10px] uppercase tracking-wider opacity-50">
            {swatch.toUpperCase()}
            {overridden ? " · modifié" : ""}
          </span>
        </span>
        {warning ? (
          <TriangleAlert className="size-4 shrink-0 text-amber-600" strokeWidth={2} />
        ) : null}
        <ChevronDown
          className={cn(
            "size-4 shrink-0 opacity-50 transition-transform",
            expanded && "rotate-180",
          )}
          strokeWidth={1.75}
        />
      </button>

      {warning ? (
        <div className="mx-3 mb-2.5 rounded-xl bg-amber-50 px-3 py-2">
          <p className="text-[12px] leading-[1.45] text-amber-900">{warning}</p>
          {onFixWarning ? (
            <button
              type="button"
              onClick={onFixWarning}
              className="mt-1.5 text-[12px] font-medium text-amber-900 underline underline-offset-2"
            >
              Corriger automatiquement
            </button>
          ) : null}
        </div>
      ) : null}

      {expanded ? <div className="border-t border-border px-3 py-3">{children}</div> : null}
    </div>
  );
}
