import type { ParticleStyle } from "./types";

export const PARTICLE_STYLES: Record<string, ParticleStyle> = {
  glitter: {
    slug: "glitter",
    name: "Paillettes",
    emoji: "✨",
    description: "Petits losanges dorés qui scintillent",
    defaultColors: ["#C8973A", "#993556", "#FAF0F3", "#E8D5B7"],
    draw: (ctx, p) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.alpha;

      ctx.beginPath();
      ctx.moveTo(0, -p.size);
      ctx.lineTo(p.size * 0.55, 0);
      ctx.lineTo(0, p.size);
      ctx.lineTo(-p.size * 0.55, 0);
      ctx.closePath();
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 4;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(0, -p.size * 0.9);
      ctx.lineTo(p.size * 0.2, -p.size * 0.4);
      ctx.lineTo(0, -p.size * 0.3);
      ctx.closePath();
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.shadowBlur = 0;
      ctx.fill();

      ctx.restore();
    },
  },

  flowers: {
    slug: "flowers",
    name: "Fleurs",
    emoji: "🌸",
    description: "Petites fleurs à 5 pétales qui tournent doucement",
    defaultColors: ["#C97B93", "#E8B4C8", "#FBEAF0"],
    draw: (ctx, p) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.alpha;

      for (let i = 0; i < 5; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI * 2) / 5);
        ctx.beginPath();
        ctx.ellipse(0, -p.size * 0.65, p.size * 0.32, p.size * 0.52, 0, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();
      }

      ctx.beginPath();
      ctx.arc(0, 0, p.size * 0.26, 0, Math.PI * 2);
      ctx.fillStyle = "#C8973A";
      ctx.fill();

      ctx.restore();
    },
  },

  hearts: {
    slug: "hearts",
    name: "Cœurs",
    emoji: "💗",
    description: "Cœurs qui tombent en se balançant",
    defaultColors: ["#993556", "#E8829A", "#FBEAF0", "#C8973A"],
    draw: (ctx, p) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.alpha;
      ctx.scale(p.size / 8, p.size / 8);

      ctx.beginPath();
      ctx.moveTo(0, 2.4);
      ctx.bezierCurveTo(-8.8, -2.4, -8.8, -8, 0, -3.2);
      ctx.bezierCurveTo(8.8, -8, 8.8, -2.4, 0, 2.4);
      ctx.closePath();
      ctx.fillStyle = p.color;
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(-2.5, -4.5, 1.5, 2.5, -0.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.fill();

      ctx.restore();
    },
  },

  petals: {
    slug: "petals",
    name: "Pétales",
    emoji: "🌺",
    description: "Pétales ovales qui virevoltent en tombant",
    defaultColors: ["#C97B93", "#E8B4C8", "#FBEAF0", "#993556"],
    draw: (ctx, p) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.alpha;

      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 0.42, p.size * 1.05, 0, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(0, -p.size * 0.9);
      ctx.lineTo(0, p.size * 0.9);
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.restore();
    },
  },

  bubbles: {
    slug: "bubbles",
    name: "Bulles",
    emoji: "🫧",
    description: "Bulles iridescentes qui montent doucement",
    defaultColors: ["#993556", "#C8973A", "#7A9E7E", "#1E3A5F"],
    direction: "up",
    draw: (ctx, p) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.globalAlpha = p.alpha * 0.75;

      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(-p.size * 0.28, -p.size * 0.28, p.size * 0.28, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(p.size * 0.2, p.size * 0.2, p.size * 0.1, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.fill();

      ctx.restore();
    },
  },

  stars: {
    slug: "stars",
    name: "Étoiles",
    emoji: "⭐",
    description: "Étoiles à 5 branches qui scintillent",
    defaultColors: ["#C8973A", "#993556", "#FAF0F3", "#1E3A5F"],
    draw: (ctx, p) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.alpha;

      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const outerAngle = (i * Math.PI * 2) / 5 - Math.PI / 2;
        const innerAngle = outerAngle + Math.PI / 5;
        const outerX = Math.cos(outerAngle) * p.size;
        const outerY = Math.sin(outerAngle) * p.size;
        const innerX = Math.cos(innerAngle) * p.size * 0.4;
        const innerY = Math.sin(innerAngle) * p.size * 0.4;
        if (i === 0) ctx.moveTo(outerX, outerY);
        else ctx.lineTo(outerX, outerY);
        ctx.lineTo(innerX, innerY);
      }
      ctx.closePath();
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 5;
      ctx.fill();

      ctx.restore();
    },
  },
};

export const PARTICLE_STYLE_LIST: ParticleStyle[] = [
  PARTICLE_STYLES.glitter,
  PARTICLE_STYLES.flowers,
  PARTICLE_STYLES.hearts,
  PARTICLE_STYLES.petals,
  PARTICLE_STYLES.bubbles,
  PARTICLE_STYLES.stars,
];

export const COLOR_MODE_MAP: Record<string, string> = {
  bordeaux: "#993556",
  gold: "#C8973A",
  blush: "#FBEAF0",
  sage: "#7A8471",
  white: "#FFFFFF",
};
