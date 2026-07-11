import { useEffect, useRef } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { StyleThumbnail } from "@/components/particles/StyleThumbnail";
import { PARTICLE_STYLE_LIST } from "@/lib/particles/styles";
import { ParticleEngine } from "@/lib/particles/engine";
import type {
  ParticleColorMode,
  ParticleConfig,
  ParticleIntensity,
  ParticleSize,
  ParticleSlug,
} from "@/lib/particles/types";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  config: ParticleConfig;
  onPatch: (patch: Partial<Patch>) => void;
  triggers: {
    open: boolean;
    loop: boolean;
    rsvp: boolean;
  };
}

interface Patch {
  particleEffectSlug: ParticleSlug | null;
  particleIntensity: ParticleIntensity;
  particleSpeed: number;
  particleSize: ParticleSize;
  particleColorMode: ParticleColorMode;
  particleTriggerOpen: boolean;
  particleTriggerLoop: boolean;
  particleTriggerRsvp: boolean;
}

const INTENSITY_OPTIONS: Array<{ v: ParticleIntensity; label: string; count: number }> = [
  { v: "soft", label: "Douce", count: 8 },
  { v: "normal", label: "Normale", count: 18 },
  { v: "festive", label: "Festive", count: 35 },
];

const SIZE_OPTIONS: Array<{ v: ParticleSize; label: string }> = [
  { v: "small", label: "Petite" },
  { v: "normal", label: "Normale" },
  { v: "large", label: "Grande" },
];

const SPEED_STEPS = [0.5, 1, 2];

const COLOR_OPTIONS: Array<{
  v: ParticleColorMode;
  label: string;
  swatch: string;
  isAuto?: boolean;
}> = [
  { v: "auto", label: "Auto", swatch: "", isAuto: true },
  { v: "bordeaux", label: "Bordeaux", swatch: "#993556" },
  { v: "gold", label: "Or", swatch: "#C8973A" },
  { v: "blush", label: "Rose poudré", swatch: "#FBEAF0" },
  { v: "sage", label: "Sauge", swatch: "#7A8471" },
  { v: "white", label: "Blanc", swatch: "#FFFFFF" },
];

export function ParticleSheet({ open, onOpenChange, config, onPatch, triggers }: Props) {
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="Effet de particules">
      <div className="space-y-6">
        <p className="text-[12px] opacity-70">
          Ajoutez une touche magique à votre page : paillettes, fleurs, cœurs…
          entièrement personnalisable.
        </p>

        {/* Section 1 — style grid */}
        <div>
          <Label>Choisir un style</Label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {PARTICLE_STYLE_LIST.map((style) => (
              <StyleThumbnail
                key={style.slug}
                style={style}
                isActive={config.slug === style.slug}
                onClick={() =>
                  onPatch({
                    particleEffectSlug: style.slug,
                    particleTriggerLoop: true,
                  })
                }
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => onPatch({ particleEffectSlug: null })}
            className={
              "mt-3 w-full rounded-2xl border px-4 py-3 text-sm transition active:scale-[0.98] " +
              (config.slug === null
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background hover:border-foreground/40")
            }
          >
            Aucun effet
          </button>
        </div>

        {config.slug && (
          <>
            {/* Section 2 — intensity */}
            <div>
              <Label>Intensité</Label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {INTENSITY_OPTIONS.map((o) => (
                  <ChipButton
                    key={o.v}
                    active={config.intensity === o.v}
                    onClick={() => onPatch({ particleIntensity: o.v })}
                  >
                    <div className="text-sm">{o.label}</div>
                    <div className="mt-0.5 font-mono text-[9px] opacity-60">
                      {o.count} particules
                    </div>
                  </ChipButton>
                ))}
              </div>
            </div>

            {/* Section 3 — speed */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label>Vitesse de chute</Label>
                <span className="font-mono text-[10px] opacity-70">
                  ×{config.speed.toFixed(1)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {SPEED_STEPS.map((s) => (
                  <ChipButton
                    key={s}
                    active={Math.abs(config.speed - s) < 0.05}
                    onClick={() => onPatch({ particleSpeed: s })}
                  >
                    <div className="text-sm">
                      {s === 0.5 ? "Lente" : s === 1 ? "Normale" : "Rapide"}
                    </div>
                    <div className="mt-0.5 font-mono text-[9px] opacity-60">×{s}</div>
                  </ChipButton>
                ))}
              </div>
            </div>

            {/* Section 4 — size */}
            <div>
              <Label>Taille</Label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {SIZE_OPTIONS.map((o) => (
                  <ChipButton
                    key={o.v}
                    active={config.size === o.v}
                    onClick={() => onPatch({ particleSize: o.v })}
                  >
                    <div className="text-sm">{o.label}</div>
                  </ChipButton>
                ))}
              </div>
            </div>

            {/* Section 5 — colour */}
            <div>
              <Label>Couleur</Label>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.v}
                    type="button"
                    onClick={() => onPatch({ particleColorMode: c.v })}
                    aria-label={c.label}
                    className={
                      "grid size-10 place-items-center rounded-full ring-1 ring-black/10 transition active:scale-90 " +
                      (config.colorMode === c.v
                        ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                        : "hover:scale-105")
                    }
                    style={
                      c.isAuto
                        ? {
                            background:
                              "conic-gradient(from 0deg, #C8973A, #993556, #FBEAF0, #7A8471, #1E3A5F, #C8973A)",
                          }
                        : { backgroundColor: c.swatch }
                    }
                  />
                ))}
              </div>
              <div className="mt-2 grid grid-cols-6 gap-2 text-center font-mono text-[9px] uppercase tracking-widest opacity-60">
                {COLOR_OPTIONS.map((c) => (
                  <span key={c.v}>{c.label}</span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Section 6 — triggers */}
        <div>
          <Label>Se déclenche</Label>
          <div className="mt-2 space-y-2">
            <ToggleRow
              label="À l'ouverture de la page"
              checked={triggers.open}
              onChange={(v) => onPatch({ particleTriggerOpen: v })}
              disabled={!config.slug}
            />
            <ToggleRow
              label="En continu pendant la visite"
              checked={triggers.loop}
              onChange={(v) => onPatch({ particleTriggerLoop: v })}
              disabled={!config.slug}
            />
            <ToggleRow
              label="Quand un invité confirme (RSVP)"
              checked={triggers.rsvp}
              onChange={(v) => onPatch({ particleTriggerRsvp: v })}
              hint="Cœurs festifs, disponibles même sans effet configuré."
            />
          </div>
        </div>

        {/* Live preview */}
        {config.slug && <LivePreview config={config} />}
      </div>
    </BottomSheet>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
      {children}
    </label>
  );
}

function ChipButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-xl border px-3 py-2 text-center transition active:scale-[0.97] " +
        (active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-background hover:border-foreground/40")
      }
    >
      {children}
    </button>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={
        "flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3 " +
        (disabled ? "opacity-40" : "")
      }
    >
      <div>
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-[11px] opacity-60">{hint}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors " +
          (checked ? "bg-primary" : "bg-muted")
        }
      >
        <span
          className={
            "inline-block size-5 rounded-full bg-background shadow transition-transform " +
            (checked ? "translate-x-5" : "translate-x-0.5")
          }
        />
      </button>
    </label>
  );
}

function LivePreview({ config }: { config: ParticleConfig }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ParticleEngine | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !config.slug) return;
    const width = canvas.parentElement?.clientWidth ?? 320;
    const height = 90;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const engine = new ParticleEngine(canvas, config, { contained: true });
    engine.burst(6);
    engine.startLoop();
    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [config.slug, config.intensity, config.speed, config.size, config.colorMode, config.accentColor]);

  return (
    <div>
      <Label>Aperçu</Label>
      <div className="mt-2 overflow-hidden rounded-2xl border border-border bg-muted/40">
        <canvas ref={canvasRef} aria-hidden="true" />
      </div>
    </div>
  );
}
