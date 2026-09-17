import { Check, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const DRESS_CODE_COLORS = [
  { hex: "#17141A", name: "Noir encre" },
  { hex: "#3A2830", name: "Prune sombre" },
  { hex: "#6B2338", name: "Bordeaux" },
  { hex: "#9E2F4F", name: "Framboise" },
  { hex: "#C6577A", name: "Rose bordeaux" },
  { hex: "#C96B62", name: "Terracotta" },
  { hex: "#E39A86", name: "Corail poudré" },
  { hex: "#F2C4BD", name: "Rose pastel" },
  { hex: "#7A4A2D", name: "Brun acajou" },
  { hex: "#B77742", name: "Cuivre" },
  { hex: "#C6A15B", name: "Champagne" },
  { hex: "#E8D39B", name: "Or pâle" },
  { hex: "#FFF3D6", name: "Crème" },
  { hex: "#F8F5F0", name: "Ivoire" },
  { hex: "#D8D1C7", name: "Grège" },
  { hex: "#A49A91", name: "Taupe" },
  { hex: "#64615E", name: "Gris ardoise" },
  { hex: "#263B3A", name: "Vert forêt" },
  { hex: "#4D6B57", name: "Vert sauge foncé" },
  { hex: "#91A88E", name: "Vert sauge" },
  { hex: "#C9D8C0", name: "Vert pastel" },
  { hex: "#17324D", name: "Bleu nuit" },
  { hex: "#496A87", name: "Bleu ardoise" },
  { hex: "#B9CCDA", name: "Bleu pastel" },
] as const;

interface Props {
  colors: string[];
  onChange: (next: string[]) => void;
  max?: number;
  label?: string;
  helper?: string;
}

export function ColorPicker({
  colors,
  onChange,
  max = 12,
  label = "Palette du dress code",
  helper = "Choisissez les teintes qui rythmeront la journée.",
}: Props) {
  const normalizedColors = colors.map(normalizeHex);
  const atLimit = normalizedColors.length >= max;
  const customColors = normalizedColors
    .filter((hex) => !DRESS_CODE_COLORS.some((color) => color.hex.toLowerCase() === hex))
    .map((hex) => ({ hex, name: `Teinte personnalisée ${hex.toUpperCase()}` }));
  const palette = [...DRESS_CODE_COLORS, ...customColors];

  const toggle = (hex: string) => {
    const normalized = normalizeHex(hex);
    const selectedIndex = normalizedColors.indexOf(normalized);
    if (selectedIndex >= 0) {
      onChange(colors.filter((_, index) => index !== selectedIndex));
      return;
    }
    if (!atLimit) onChange([...colors, normalized]);
  };

  const addCustom = (hex: string) => {
    if (!hex || atLimit || normalizedColors.includes(normalizeHex(hex))) return;
    onChange([...colors, normalizeHex(hex)]);
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
          {label} ({colors.length}/{max})
        </p>
        <div className="mt-3 flex min-h-11 flex-wrap items-center gap-2">
          {colors.map((hex, index) => {
            const name = colorName(hex);
            return (
              <Button
                key={`${hex}-${index}`}
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => toggle(hex)}
                aria-label={`Retirer ${name}`}
                className="relative size-11 shrink-0 rounded-full p-0 shadow-sm ring-1 ring-foreground/10 hover:bg-transparent"
                style={{ backgroundColor: hex }}
              >
                <span className="pointer-events-none absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-dress-picker-ink text-background ring-1 ring-background">
                  <X className="size-2.5" strokeWidth={3} aria-hidden="true" />
                </span>
              </Button>
            );
          })}
          {colors.length === 0 ? (
            <span className="text-[11px] text-muted-foreground">Aucune teinte sélectionnée</span>
          ) : null}
        </div>
      </div>

      <fieldset>
        <legend className="text-sm font-semibold text-foreground">Choisir une couleur</legend>
        <p
          className={cn(
            "mt-1 min-h-8 text-[11px] leading-4",
            atLimit ? "text-dress-picker-accent" : "text-muted-foreground",
          )}
          aria-live="polite"
        >
          {atLimit
            ? `Maximum de ${max} teintes atteint — retirez-en une pour en ajouter`
            : helper}
        </p>

        <div className="mt-3 grid grid-cols-5 gap-3">
          {palette.map(({ hex, name }) => {
            const selected = normalizedColors.includes(normalizeHex(hex));
            const disabled = atLimit && !selected;
            return (
              <Button
                key={hex}
                type="button"
                variant="ghost"
                size="icon"
                disabled={disabled}
                aria-disabled={disabled}
                aria-pressed={selected}
                aria-label={`${name}, ${selected ? "sélectionnée" : "non sélectionnée"}`}
                onClick={() => toggle(hex)}
                className={cn(
                  "relative aspect-square size-full min-h-11 min-w-11 rounded-full p-0 shadow-sm ring-1 ring-foreground/10 transition hover:scale-105 hover:bg-transparent active:scale-95 disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-32",
                  selected && "ring-[3px] ring-dress-picker-ink ring-offset-2 ring-offset-background",
                )}
                style={{ backgroundColor: hex }}
              >
                {selected ? (
                  <span className="absolute inset-[3px] grid place-items-center rounded-full border-2 border-background">
                    <Check
                      className={cn("size-5", hasDarkContrast(hex) ? "text-background" : "text-dress-picker-ink")}
                      strokeWidth={3}
                      aria-hidden="true"
                    />
                  </span>
                ) : null}
              </Button>
            );
          })}

          <span
            className={cn(
              "relative grid aspect-square min-h-11 min-w-11 place-items-center rounded-full border-2 border-dashed border-dress-picker-disabled-text text-dress-picker-ink transition",
              atLimit && "cursor-not-allowed opacity-32",
            )}
          >
            <Plus className="size-5" aria-hidden="true" />
            <input
              type="color"
              onChange={(event) => addCustom(event.target.value)}
              disabled={atLimit}
              aria-label="Ajouter une teinte personnalisée"
              className="absolute inset-0 size-full cursor-pointer rounded-full opacity-0 disabled:cursor-not-allowed"
            />
          </span>
        </div>
      </fieldset>

      <div className="border-t border-border pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => onChange([])}
          disabled={colors.length === 0}
          aria-disabled={colors.length === 0}
          className={cn(
            "w-full rounded-xl bg-background disabled:pointer-events-auto",
            colors.length === 0
              ? "cursor-not-allowed border-dress-picker-disabled-border text-dress-picker-disabled-text opacity-100"
              : "border-dress-picker-border text-dress-picker-accent hover:bg-rose-poudre hover:text-dress-picker-accent",
          )}
        >
          Retirer
        </Button>
      </div>
    </div>
  );
}

function normalizeHex(hex: string): string {
  return hex.trim().toLowerCase();
}

function colorName(hex: string): string {
  const normalized = normalizeHex(hex);
  return (
    DRESS_CODE_COLORS.find((color) => color.hex.toLowerCase() === normalized)?.name ??
    `Teinte personnalisée ${normalized.toUpperCase()}`
  );
}

function hasDarkContrast(hex: string): boolean {
  const value = normalizeHex(hex).replace("#", "");
  if (!/^[0-9a-f]{6}$/.test(value)) return true;
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);
  return (red * 299 + green * 587 + blue * 114) / 1000 < 150;
}

