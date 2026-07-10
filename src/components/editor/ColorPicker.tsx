import { useEffect, useState } from "react";
import { Plus, Check } from "lucide-react";

/**
 * Curated wedding palette — nuit, or, terracotta, sauge, ivoire, encre.
 * Kept short so the sheet stays scannable on mobile.
 */
const PRESETS = [
  "#0b1a2b", "#1f3a5f", "#2b2a4c", "#4a1e3a",
  "#7a1e3a", "#a8324f", "#c9a96b", "#e6c78a",
  "#f4e4c1", "#efe7dc", "#e7d9c4", "#c9b79c",
  "#8b6f4e", "#5c4033", "#2d2a26", "#0a0a0a",
  "#f5f5f0", "#d6cfc2", "#5a6b57", "#3a5a40",
  "#1e3a2f", "#264653", "#e76f51", "#b56576",
];

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
        <ColorEditor
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

function ColorEditor({
  value,
  onChange,
  onClose,
  onRemove,
}: {
  value: string;
  onChange: (v: string) => void;
  onClose: () => void;
  onRemove: () => void;
}) {
  const [h, s, l] = hexToHsl(value);
  const [hex, setHex] = useState(value);

  useEffect(() => setHex(value), [value]);

  const commitHex = (v: string) => {
    let clean = v.trim().toLowerCase();
    if (!clean.startsWith("#")) clean = "#" + clean;
    if (/^#[0-9a-f]{6}$/.test(clean)) onChange(clean);
    else setHex(value);
  };

  return (
    <div className="mt-4 space-y-4 rounded-2xl border border-border bg-muted/30 p-4">
      <div className="flex items-center gap-3">
        <div
          className="size-14 shrink-0 rounded-full shadow-inner ring-1 ring-black/10"
          style={{ backgroundColor: value }}
        />
        <div className="flex-1">
          <label className="mb-1 block font-mono text-[9px] uppercase tracking-[0.2em] opacity-60">
            Code hexadécimal
          </label>
          <input
            type="text"
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            onBlur={() => commitHex(hex)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitHex(hex);
              }
            }}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-[12px] uppercase tracking-wider outline-none focus:ring-2 focus:ring-primary/40"
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect="off"
            maxLength={7}
          />
        </div>
      </div>

      <PremiumSlider
        label="Teinte"
        value={h}
        min={0}
        max={360}
        onChange={(nh) => onChange(hslToHex(nh, s, l))}
        gradient="linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)"
      />
      <PremiumSlider
        label="Saturation"
        value={s}
        min={0}
        max={100}
        suffix="%"
        onChange={(ns) => onChange(hslToHex(h, ns, l))}
        gradient={`linear-gradient(to right, hsl(${h} 0% ${l}%), hsl(${h} 100% ${l}%))`}
      />
      <PremiumSlider
        label="Luminosité"
        value={l}
        min={0}
        max={100}
        suffix="%"
        onChange={(nl) => onChange(hslToHex(h, s, nl))}
        gradient={`linear-gradient(to right,#000, hsl(${h} ${s}% 50%), #fff)`}
      />

      <div>
        <label className="mb-2 block font-mono text-[9px] uppercase tracking-[0.2em] opacity-60">
          Teintes suggérées
        </label>
        <div className="grid grid-cols-8 gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              className={
                "size-7 rounded-full shadow-sm ring-1 ring-black/10 transition active:scale-90 hover:scale-110 " +
                (p.toLowerCase() === value.toLowerCase()
                  ? "ring-2 ring-primary ring-offset-1 ring-offset-background"
                  : "")
              }
              style={{ backgroundColor: p }}
              aria-label={p}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onRemove}
          className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-destructive transition active:scale-[0.97]"
        >
          Retirer
        </button>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto flex items-center gap-1.5 rounded-xl bg-foreground px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-background transition active:scale-[0.97]"
        >
          <Check className="size-3.5" />
          Terminé
        </button>
      </div>
    </div>
  );
}

function PremiumSlider({
  label,
  value,
  min,
  max,
  onChange,
  gradient,
  suffix = "",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  gradient: string;
  suffix?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.2em] opacity-60">
        <span>{label}</span>
        <span>
          {Math.round(value)}
          {suffix}
        </span>
      </div>
      <div
        className="relative h-3 rounded-full shadow-inner ring-1 ring-black/10"
        style={{ background: gradient }}
      >
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label={label}
        />
        <div
          className="pointer-events-none absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-white shadow-md ring-1 ring-black/25"
          style={{ left: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ---------- color utils ----------
function hexToHsl(hex: string): [number, number, number] {
  const m = /^#?([a-f\d]{6})$/i.exec(hex.trim());
  if (!m) return [40, 40, 60];
  const int = parseInt(m[1], 16);
  const r = ((int >> 16) & 255) / 255;
  const g = ((int >> 8) & 255) / 255;
  const b = (int & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }
  return [h, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const c = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return Math.round(c * 255)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
