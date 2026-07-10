import { useEffect, useRef } from "react";
import { ParticleEngine, detectMotionConstraints } from "@/lib/particles/engine";
import type { ParticleConfig } from "@/lib/particles/types";

interface Props {
  config: ParticleConfig;
  /** Fire a one-shot burst on mount. */
  burstOnMount?: number;
  /** Start the continuous spawn loop. */
  loop?: boolean;
}

export function ParticleCanvas({ config, burstOnMount, loop }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ParticleEngine | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const canvas = canvasRef.current;
    if (!canvas || !config.slug) return;

    const constraints = detectMotionConstraints();
    const effective: ParticleConfig = {
      ...config,
      intensity: constraints.reduced || constraints.lowMem ? "soft" : config.intensity,
      reducedMotion: constraints.reduced,
    };
    const shouldLoop = loop && !constraints.reduced;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      engineRef.current?.resize(window.innerWidth * dpr, window.innerHeight * dpr);
    };
    resize();

    const engine = new ParticleEngine(canvas, effective);
    engineRef.current = engine;

    if (burstOnMount && burstOnMount > 0) engine.burst(burstOnMount);
    if (shouldLoop) engine.startLoop();

    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      engine.destroy();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    config.slug,
    config.intensity,
    config.speed,
    config.size,
    config.colorMode,
    config.accentColor,
    loop,
    burstOnMount,
  ]);

  if (!config.slug) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 10,
        willChange: "transform",
      }}
    />
  );
}

/** Fires an RSVP burst overlay, then unmounts itself after 3.2s. */
export function RsvpBurstOverlay({
  accentColor,
  onDone,
}: {
  accentColor: string;
  onDone?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const constraints = detectMotionConstraints();
    const engine = new ParticleEngine(canvas, {
      slug: "hearts",
      intensity: "normal",
      speed: 1,
      size: "normal",
      colorMode: "auto",
      accentColor,
      reducedMotion: constraints.reduced,
    });
    engine.burstRsvp(accentColor);

    const t = window.setTimeout(() => {
      engine.destroy();
      onDone?.();
    }, 3200);
    return () => {
      window.clearTimeout(t);
      engine.destroy();
    };
  }, [accentColor, onDone]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 60,
      }}
    />
  );
}
