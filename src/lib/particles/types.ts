export type ParticleSlug =
  | "glitter"
  | "flowers"
  | "hearts"
  | "petals"
  | "bubbles"
  | "stars";

export type ParticleIntensity = "soft" | "normal" | "festive";
export type ParticleSize = "small" | "normal" | "large";
export type ParticleColorMode =
  | "auto"
  | "bordeaux"
  | "gold"
  | "blush"
  | "sage"
  | "white";

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  rotation: number;
  rotationSpeed: number;
  swayPhase: number;
  swayAmplitude: number;
  age: number;
  maxAge: number;
  /** When true the physics loop treats this particle as rising (bubbles). */
  rising?: boolean;
}

export interface ParticleStyle {
  slug: ParticleSlug;
  name: string;
  emoji: string;
  description: string;
  defaultColors: string[];
  /** Direction: 'down' (default) or 'up' for bubbles. */
  direction?: "down" | "up";
  draw: (ctx: CanvasRenderingContext2D, particle: Particle) => void;
}

export interface ParticleConfig {
  slug: ParticleSlug | null;
  intensity: ParticleIntensity;
  speed: number; // 0.5, 1, 2 …
  size: ParticleSize;
  colorMode: ParticleColorMode;
  accentColor: string;
  /** Force soft mode & no loop for accessibility. */
  reducedMotion?: boolean;
}
