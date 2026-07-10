import { COLOR_MODE_MAP, PARTICLE_STYLES } from "./styles";
import type {
  Particle,
  ParticleConfig,
  ParticleIntensity,
  ParticleSize,
  ParticleSlug,
} from "./types";

const INTENSITY_RATE: Record<ParticleIntensity, { max: number; every: number }> = {
  soft: { max: 8, every: 90 },
  normal: { max: 18, every: 45 },
  festive: { max: 35, every: 20 },
};

const SIZE_RANGE: Record<ParticleSize, [number, number]> = {
  small: [3, 5],
  normal: [5, 9],
  large: [8, 14],
};

function randBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function pickColor(cfg: ParticleConfig, styleColors: string[]): string {
  if (cfg.colorMode === "auto") {
    if (Math.random() > 0.4 && cfg.accentColor) return cfg.accentColor;
    return styleColors[Math.floor(Math.random() * styleColors.length)];
  }
  return COLOR_MODE_MAP[cfg.colorMode] ?? cfg.accentColor;
}

interface EngineOptions {
  /** Clamp particles inside the canvas (used by thumbnails & preview). */
  contained?: boolean;
}

export class ParticleEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cfg: ParticleConfig;
  private particles: Particle[] = [];
  private frame = 0;
  private raf: number | null = null;
  private looping = false;
  private contained: boolean;
  private stopAt: number | null = null;

  constructor(canvas: HTMLCanvasElement, cfg: ParticleConfig, opts: EngineOptions = {}) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D indisponible");
    this.ctx = ctx;
    this.cfg = cfg;
    this.contained = !!opts.contained;
  }

  updateConfig(cfg: ParticleConfig) {
    this.cfg = cfg;
  }

  /** Start the continuous spawn loop. */
  startLoop() {
    if (this.looping) return;
    this.looping = true;
    if (this.raf == null) this.tick();
  }

  /** Stop spawning; existing particles keep animating until they die. */
  stopLoop() {
    this.looping = false;
  }

  /** Emit N particles right now. */
  burst(count: number) {
    for (let i = 0; i < count; i++) this.spawn();
    if (this.raf == null) this.tick();
  }

  /** RSVP burst — 30 hearts exploding from the centre for ~3s. */
  burstRsvp(accent?: string) {
    const style = PARTICLE_STYLES.hearts;
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      this.particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: randBetween(8, 14),
        color:
          Math.random() > 0.5
            ? accent ?? this.cfg.accentColor ?? "#993556"
            : style.defaultColors[Math.floor(Math.random() * style.defaultColors.length)],
        alpha: 1,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        swayPhase: Math.random() * Math.PI * 2,
        swayAmplitude: 0.2,
        age: 0,
        maxAge: 80,
      });
    }
    this.stopAt = performance.now() + 3000;
    if (this.raf == null) this.tick();
  }

  resize(w: number, h: number) {
    this.canvas.width = w;
    this.canvas.height = h;
  }

  destroy() {
    this.looping = false;
    if (this.raf != null) cancelAnimationFrame(this.raf);
    this.raf = null;
    this.particles = [];
    try {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    } catch {
      /* canvas may be detached */
    }
  }

  private spawn(overrideStyle?: ParticleSlug) {
    const slug: ParticleSlug | null = overrideStyle ?? this.cfg.slug;
    if (!slug) return;
    const style = PARTICLE_STYLES[slug];
    if (!style) return;

    const [smin, smax] = SIZE_RANGE[this.cfg.size];
    const size = randBetween(smin, smax);
    const speedMult = Math.max(0.25, this.cfg.speed || 1);
    const rising = style.direction === "up";

    const baseVy = rising ? -randBetween(0.4, 1.1) : randBetween(0.6, 1.6);
    const startY = rising
      ? this.canvas.height + size + 4
      : -size - randBetween(0, 40);

    this.particles.push({
      x: Math.random() * this.canvas.width,
      y: startY,
      vx: (Math.random() - 0.5) * 0.6 * speedMult,
      vy: baseVy * speedMult,
      size,
      color: pickColor(this.cfg, style.defaultColors),
      alpha: 0,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.06,
      swayPhase: Math.random() * Math.PI * 2,
      swayAmplitude: randBetween(0.3, 1.1),
      age: 0,
      maxAge: rising ? 260 : 340,
      rising,
    });
  }

  private tick = () => {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const rate = INTENSITY_RATE[this.cfg.intensity];
    if (
      this.looping &&
      this.cfg.slug &&
      this.frame % rate.every === 0 &&
      this.particles.length < rate.max
    ) {
      this.spawn();
    }

    const style = this.cfg.slug ? PARTICLE_STYLES[this.cfg.slug] : null;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx + Math.sin(p.swayPhase + this.frame * 0.02) * p.swayAmplitude;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.age++;

      const lifeRatio = p.age / p.maxAge;
      if (lifeRatio < 0.1) p.alpha = lifeRatio * 10 * 0.9;
      else if (lifeRatio > 0.8) p.alpha = Math.max(0, (1 - lifeRatio) * 5 * 0.9);
      else p.alpha = 0.9;

      // Choose the correct draw fn: use style linked to this particle if provided,
      // else the engine's active style. Falls back to hearts (rsvp burst case).
      const drawStyle = style ?? PARTICLE_STYLES.hearts;
      drawStyle.draw(ctx, p);

      if (this.contained) {
        if (p.x < -p.size) p.x = canvas.width + p.size;
        if (p.x > canvas.width + p.size) p.x = -p.size;
        if (p.rising && p.y < -p.size) p.y = canvas.height + p.size;
        if (!p.rising && p.y > canvas.height + p.size) p.y = -p.size;
      }

      const outOfBounds =
        !this.contained &&
        (p.y > canvas.height + 30 || p.y < -30 || p.age > p.maxAge);
      if (outOfBounds) this.particles.splice(i, 1);
      else if (this.contained && p.age > p.maxAge) this.particles.splice(i, 1);
    }

    this.frame++;

    if (this.stopAt && performance.now() > this.stopAt) {
      this.stopAt = null;
      this.looping = false;
    }

    if (this.looping || this.particles.length > 0) {
      this.raf = requestAnimationFrame(this.tick);
    } else {
      this.raf = null;
    }
  };
}

/** Detects accessibility / low-end constraints. */
export function detectMotionConstraints(): { reduced: boolean; lowMem: boolean } {
  if (typeof window === "undefined") return { reduced: false, lowMem: false };
  const reduced =
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const lowMem = typeof mem === "number" && mem < 4;
  return { reduced, lowMem };
}
