import { useState } from "react";
import { Plus } from "lucide-react";
import { HexEditor } from "./HexEditor";

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
  label = "Palette de couleurs",
  helper = "Choisissez les teintes qui rythmeront la journée.",
}: Props) {
  const [editing, setEditing] = useState<number | null>(null);

  const update = (i: number, v: string) => {
    const next = [...colors];
    next[i] = v;
    onChange(next);
  };
  const add = () => {
    if (colors.length >= max) return;
    onChange([...colors, "#c9a96b"]);
    setEditing(colors.length);
  };
  const remove = (i: number) => {
    onChange(colors.filter((_, idx) => idx !== i));
    setEditing(null);
  };

  return (
    <div>
      <div className="mb-2 flex items-end justify-between">
        <label className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
          {label} ({colors.length}/{max})
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {colors.map((c, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setEditing(editing === i ? null : i)}
            className={
              "relative size-10 rounded-full shadow-sm ring-1 ring-black/10 transition-all active:scale-95 " +
              (editing === i
                ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                : "hover:scale-105")
            }
            style={{ backgroundColor: c || "#ffffff" }}
            aria-label={`Couleur ${i + 1}`}
          />
        ))}
        {colors.length < max && (
          <button
            type="button"
            onClick={add}
            className="grid size-10 place-items-center rounded-full border-2 border-dashed border-border text-muted-foreground transition hover:border-foreground/40 hover:text-foreground"
            aria-label="Ajouter une couleur"
          >
            <Plus className="size-4" />
          </button>
        )}
      </div>

      {editing !== null && colors[editing] !== undefined && (
        <HexEditor
          value={colors[editing]}
          onChange={(v) => update(editing, v)}
          onClose={() => setEditing(null)}
          onRemove={() => remove(editing)}
        />
      )}

      {helper && <p className="mt-2 text-[10px] opacity-60">{helper}</p>}
    </div>
  );
}

