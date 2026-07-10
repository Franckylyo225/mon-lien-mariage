import { useEffect, useRef } from "react";
import { ParticleEngine } from "@/lib/particles/engine";
import type { ParticleStyle } from "@/lib/particles/types";

interface Props {
  style: ParticleStyle;
  isActive: boolean;
  onClick: () => void;
  width?: number;
  height?: number;
}

export function StyleThumbnail({
  style,
  isActive,
  onClick,
  width = 96,
  height = 120,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const engine = new ParticleEngine(
      canvas,
      {
        slug: style.slug,
        intensity: "normal",
        speed: 0.9,
        size: "small",
        colorMode: "auto",
        accentColor: style.defaultColors[0],
      },
      { contained: true },
    );
    // Prime with a couple of particles so the thumb isn't empty on first paint.
    engine.burst(4);
    engine.startLoop();
    return () => engine.destroy();
  }, [style.slug, style.defaultColors, width, height]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "group flex flex-col items-center gap-1.5 rounded-2xl border p-2 transition active:scale-[0.97] " +
        (isActive
          ? "border-foreground bg-foreground/[0.04]"
          : "border-border bg-background hover:border-foreground/40")
      }
      aria-pressed={isActive}
    >
      <div
        className="overflow-hidden rounded-xl"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklab, var(--foreground) 6%, transparent), color-mix(in oklab, var(--foreground) 2%, transparent))",
        }}
      >
        <canvas ref={canvasRef} width={width} height={height} aria-hidden="true" />
      </div>
      <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest">
        <span aria-hidden>{style.emoji}</span>
        <span>{style.name}</span>
      </span>
    </button>
  );
}
