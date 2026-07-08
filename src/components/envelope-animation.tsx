import { useEffect, useState } from "react";

interface Props {
  brideName: string;
  groomName: string;
  onDone?: () => void;
  duration?: number; // ms
  autoStart?: boolean;
}

/**
 * Animation d'enveloppe SVG : le sceau se brise, le rabat s'ouvre,
 * la carte glisse vers le haut, puis l'ensemble s'efface (~3s).
 */
export function EnvelopeAnimation({
  brideName,
  groomName,
  onDone,
  duration = 3000,
  autoStart = true,
}: Props) {
  const [phase, setPhase] = useState<"idle" | "playing" | "done">(
    autoStart ? "playing" : "idle",
  );

  useEffect(() => {
    if (phase !== "playing") return;
    const t = setTimeout(() => {
      setPhase("done");
      onDone?.();
    }, duration);
    return () => clearTimeout(t);
  }, [phase, duration, onDone]);

  if (phase === "done") return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-envelope-fade"
      onClick={() => {
        setPhase("done");
        onDone?.();
      }}
    >
      <style>{`
        @keyframes envelope-fade { 0%{opacity:0} 15%{opacity:1} 90%{opacity:1} 100%{opacity:0} }
        .animate-envelope-fade { animation: envelope-fade ${duration}ms ease forwards; }
        @keyframes seal-break { 0%,30%{transform:scale(1);opacity:1} 45%{transform:scale(1.3);opacity:0.8} 55%,100%{transform:scale(0);opacity:0} }
        @keyframes flap-open { 0%,35%{transform:rotateX(0)} 65%,100%{transform:rotateX(180deg)} }
        @keyframes card-rise { 0%,55%{transform:translateY(20%);opacity:0} 80%,100%{transform:translateY(-42%);opacity:1} }
        .seal { transform-origin:center; animation: seal-break ${duration}ms ease forwards; }
        .flap { transform-origin: top center; transform-style: preserve-3d; animation: flap-open ${duration}ms ease forwards; }
        .card { transform-origin: center; animation: card-rise ${duration}ms cubic-bezier(.2,.7,.2,1) forwards; }
      `}</style>
      <div className="relative" style={{ perspective: 800 }}>
        <svg viewBox="0 0 320 220" width="280" height="192" className="drop-shadow-2xl">
          {/* Corps de l'enveloppe */}
          <rect x="10" y="60" width="300" height="150" rx="8" fill="#FBEAF0" stroke="#993556" strokeWidth="1.5" />
          {/* Carte à l'intérieur */}
          <g className="card">
            <rect x="30" y="70" width="260" height="130" rx="4" fill="#FAFAF9" stroke="#993556" strokeWidth="1" />
            <text x="160" y="120" textAnchor="middle" fontFamily="Playfair Display, serif" fontStyle="italic" fontSize="22" fill="#993556">
              {brideName}
            </text>
            <text x="160" y="145" textAnchor="middle" fontFamily="Playfair Display, serif" fontStyle="italic" fontSize="16" fill="#993556">
              &amp;
            </text>
            <text x="160" y="172" textAnchor="middle" fontFamily="Playfair Display, serif" fontStyle="italic" fontSize="22" fill="#993556">
              {groomName}
            </text>
          </g>
          {/* Rabat qui s'ouvre */}
          <g className="flap">
            <polygon points="10,60 310,60 160,150" fill="#993556" />
          </g>
          {/* Triangles latéraux */}
          <polygon points="10,60 10,210 90,135" fill="#c4557a" opacity="0.6" />
          <polygon points="310,60 310,210 230,135" fill="#c4557a" opacity="0.6" />
          {/* Sceau */}
          <g className="seal">
            <circle cx="160" cy="105" r="18" fill="#8b0028" />
            <text x="160" y="111" textAnchor="middle" fontFamily="Playfair Display, serif" fontStyle="italic" fontSize="16" fill="#FBEAF0">
              M
            </text>
          </g>
        </svg>
        <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-white/70">
          Vous êtes convié·e
        </p>
      </div>
    </div>
  );
}
