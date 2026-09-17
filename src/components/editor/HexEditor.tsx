import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DRESS_CODE_COLORS,
  colorName,
  hasDarkContrast,
  normalizeHex,
} from "./ColorPicker";

interface HexEditorProps {
  value: string;
  onChange: (v: string) => void;
  onClose?: () => void;
  onRemove?: () => void;
  removeLabel?: string;
  label?: string;
  helper?: string;
}

export function HexEditor({
  value,
  onChange,
  onClose,
  onRemove,
  removeLabel = "Retirer",
  label = "Choisir une couleur",
  helper = "Sélectionnez une teinte ou ajoutez une couleur personnalisée.",
}: HexEditorProps) {
  const normalizedValue = normalizeHex(value);
  const isCurated = DRESS_CODE_COLORS.some(
    (color) => normalizeHex(color.hex) === normalizedValue,
  );
  const palette = isCurated
    ? [...DRESS_CODE_COLORS]
    : [
        ...DRESS_CODE_COLORS,
        { hex: normalizedValue, name: colorName(normalizedValue) },
      ];

  return (
    <fieldset className="mt-4 space-y-4 rounded-2xl border border-border bg-muted/30 p-4">
      <div>
        <legend className="text-sm font-semibold text-foreground">{label}</legend>
        <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{helper}</p>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {palette.map(({ hex, name }) => {
          const selected = normalizeHex(hex) === normalizedValue;
          return (
            <Button
              key={hex}
              type="button"
              variant="ghost"
              size="icon"
              aria-pressed={selected}
              aria-label={`${name}, ${selected ? "sélectionnée" : "non sélectionnée"}`}
              onClick={() => onChange(normalizeHex(hex))}
              className={cn(
                "relative aspect-square size-full min-h-11 min-w-11 rounded-full p-0 shadow-sm ring-1 ring-foreground/10 transition hover:scale-105 hover:bg-transparent active:scale-95",
                selected && "ring-[3px] ring-dress-picker-ink ring-offset-2 ring-offset-background",
              )}
              style={{ backgroundColor: hex }}
            >
              {selected ? (
                <span className="absolute inset-[3px] grid place-items-center rounded-full border-2 border-background">
                  <Check
                    className={cn(
                      "size-5",
                      hasDarkContrast(hex) ? "text-background" : "text-dress-picker-ink",
                    )}
                    strokeWidth={3}
                    aria-hidden="true"
                  />
                </span>
              ) : null}
            </Button>
          );
        })}

        <span className="relative grid aspect-square min-h-11 min-w-11 place-items-center rounded-full border-2 border-dashed border-dress-picker-disabled-text text-dress-picker-ink transition">
          <Plus className="size-5" aria-hidden="true" />
          <input
            type="color"
            value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#c6577a"}
            onChange={(event) => onChange(normalizeHex(event.target.value))}
            aria-label="Ajouter une teinte personnalisée"
            className="absolute inset-0 size-full cursor-pointer rounded-full opacity-0"
          />
        </span>
      </div>

      {onRemove || onClose ? <div className="flex gap-2 border-t border-border pt-4">
        {onRemove && (
          <Button
            type="button"
            variant="outline"
            onClick={onRemove}
            className="rounded-xl border-dress-picker-border bg-background text-dress-picker-accent hover:bg-rose-poudre hover:text-dress-picker-accent"
          >
            {removeLabel}
          </Button>
        )}
        {onClose ? <Button
          type="button"
          onClick={onClose}
          className="ml-auto rounded-xl bg-foreground text-background hover:bg-foreground/90"
        >
          <Check className="size-3.5" />
          Terminé
        </Button> : null}
      </div> : null}
    </fieldset>
  );
}
