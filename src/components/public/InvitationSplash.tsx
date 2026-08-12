import { useEffect, useState } from "react";
import type { ResolvedTheme } from "@/lib/wedding-theme";
import "./invitation-splash.css";

type Phase = "enter" | "names" | "expand" | "exit";

interface SplashColors {
  bgGradient: string;
  accent: string;
  accentSoft: string;
  text: string;
  textSoft: string;
  gold: string;
  fontHeading: string;
  fontBody: string;
}

function isDarkHex(hex: string): boolean {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return false;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b < 128;
}

function shiftColor(hex: string, amount: number): string {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const r = clamp(((n >> 16) & 255) + amount);
  const g = clamp(((n >> 8) & 255) + amount);
  const b = clamp((n & 255) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export function splashColors(theme: ResolvedTheme): SplashColors {
  const dark = isDarkHex(theme.bg);
  return {
    bgGradient: dark
      ? `linear-gradient(160deg, ${theme.bg} 0%, ${shiftColor(theme.bg, 18)} 100%)`
      : `linear-gradient(160deg, ${theme.bg} 0%, ${shiftColor(theme.bg, -10)} 100%)`,
    accent: theme.accent,
    accentSoft: `${theme.accent}20`,
    text: dark ? "#F7F3EE" : theme.textPrimary,
    textSoft: dark ? "rgba(247,243,238,0.6)" : `${theme.textSecondary}B3`,
    gold: "#C6A15B",
    fontHeading: theme.fontHeading,
    fontBody: theme.fontBody,
  };
}

const HeartIcon = ({ color, size = 52 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 20.5s-7.5-4.7-7.5-10a4.3 4.3 0 0 1 7.5-2.8A4.3 4.3 0 0 1 19.5 10.5c0 5.3-7.5 10-7.5 10Z"
      fill={color}
      fillOpacity="0.14"
      stroke={color}
      strokeWidth="1.1"
      strokeLinejoin="round"
    />
  </svg>
);

const FloralOrnament = ({
  color,
  position,
  visible,
  rotate = false,
}: {
  color: string;
  position: string;
  visible: boolean;
  rotate?: boolean;
}) => (
  <div
    className={`floral-ornament floral-${position}${visible ? " visible" : ""}`}
    style={{ transform: rotate ? "rotate(180deg)" : undefined }}
    aria-hidden="true"
  >
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="4" fill={color} fillOpacity="0.5" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 40 + 6 * Math.cos(rad);
        const y1 = 40 + 6 * Math.sin(rad);
        const x2 = 40 + 22 * Math.cos(rad);
        const y2 = 40 + 22 * Math.sin(rad);
        return (
          <g key={angle}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={color}
              strokeWidth="0.8"
              strokeOpacity="0.5"
            />
            <circle cx={x2} cy={y2} r="2.2" fill={color} fillOpacity="0.35" />
          </g>
        );
      })}
    </svg>
  </div>
);

const DiamondDivider = ({ color }: { color: string }) => (
  <svg width="70" height="8" viewBox="0 0 70 8" fill="none" aria-hidden="true">
    <line x1="0" y1="4" x2="27" y2="4" stroke={color} strokeWidth="0.7" strokeOpacity="0.6" />
    <rect x="31.5" y="0.5" width="7" height="7" transform="rotate(45 35 4)" stroke={color} strokeWidth="0.7" />
    <line x1="43" y1="4" x2="70" y2="4" stroke={color} strokeWidth="0.7" strokeOpacity="0.6" />
  </svg>
);

function formatWeddingDate(date?: string | null): string {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

interface InvitationSplashProps {
  brideName: string;
  groomName: string;
  weddingDate?: string | null;
  city?: string | null;
  theme: ResolvedTheme;
  onDone: () => void;
}

export function InvitationSplash({
  brideName,
  groomName,
  weddingDate,
  city,
  theme,
  onDone,
}: InvitationSplashProps) {
  const [phase, setPhase] = useState<Phase>("enter");
  const [progress, setProgress] = useState(0);
  const t = splashColors(theme);

  useEffect(() => {
    const totalDuration = 3200;
    let exitTimer: ReturnType<typeof setTimeout> | undefined;
    const timers = [
      setTimeout(() => setPhase("names"), 800),
      setTimeout(() => setPhase("expand"), 2200),
      setTimeout(() => {
        setPhase("exit");
        exitTimer = setTimeout(onDone, 400);
      }, totalDuration),
    ];

    let start: number | null = null;
    let rafId = 0;
    const animateProgress = (ts: number) => {
      if (start === null) start = ts;
      const elapsed = ts - start;
      setProgress(Math.min(elapsed / totalDuration, 1));
      if (elapsed < totalDuration) rafId = requestAnimationFrame(animateProgress);
    };
    rafId = requestAnimationFrame(animateProgress);

    return () => {
      timers.forEach(clearTimeout);
      if (exitTimer) clearTimeout(exitTimer);
      cancelAnimationFrame(rafId);
    };
  }, [onDone]);

  const namesIn = phase !== "enter";
  const detailsIn = progress * 3200 >= 1200 || phase === "expand" || phase === "exit";
  const ornamentsIn = phase === "expand" || phase === "exit";
  const dateLine = [formatWeddingDate(weddingDate), city].filter(Boolean).join(" · ");
  const activeDot = Math.min(2, Math.floor(progress * 3));

  return (
    <div
      className={`invitation-splash${phase === "exit" ? " exiting" : ""}`}
      style={{ fontFamily: t.fontBody, color: t.text }}
      role="status"
      aria-label="Ouverture de l'invitation"
    >
      <div
        className={`splash-bg${ornamentsIn ? " expanded" : ""}`}
        style={{ background: t.bgGradient }}
      />

      <FloralOrnament color={t.gold} position="top-left" visible={ornamentsIn} />
      <FloralOrnament color={t.gold} position="top-right" visible={ornamentsIn} />
      <FloralOrnament color={t.gold} position="bottom-left" visible={ornamentsIn} />
      <FloralOrnament color={t.gold} position="bottom-right" visible={ornamentsIn} rotate />

      <div className="splash-content">
        <div className="splash-heart visible">
          <HeartIcon color={t.accent} />
        </div>

        <p
          className={`splash-kicker${detailsIn ? " visible" : ""}`}
          style={{ color: t.accent }}
        >
          Vous êtes invité(e)
        </p>

        <h1
          className={`splash-name${namesIn ? " visible" : ""}`}
          style={{ fontFamily: t.fontHeading, ["--delay" as string]: "0s" }}
        >
          {brideName}
        </h1>

        <div className={`splash-divider${namesIn ? " visible" : ""}`}>
          <DiamondDivider color={t.gold} />
          <span className="splash-ampersand" style={{ fontFamily: t.fontHeading, color: t.accent }}>
            &amp;
          </span>
          <DiamondDivider color={t.gold} />
        </div>

        <p
          className={`splash-name${namesIn ? " visible" : ""}`}
          style={{ fontFamily: t.fontHeading, ["--delay" as string]: "0.22s" }}
        >
          {groomName}
        </p>

        {dateLine ? (
          <p className={`splash-date${detailsIn ? " visible" : ""}`} style={{ color: t.textSoft }}>
            {dateLine}
          </p>
        ) : null}
      </div>

      <div className="splash-dots">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="splash-dot"
            style={{
              width: i === activeDot ? 18 : 6,
              background: i === activeDot ? t.accent : t.accentSoft,
            }}
          />
        ))}
      </div>

      <div className="splash-progress-track">
        <div
          className="splash-progress-bar"
          style={{ width: `${progress * 100}%`, background: t.accent }}
        />
      </div>
    </div>
  );
}

export default InvitationSplash;
