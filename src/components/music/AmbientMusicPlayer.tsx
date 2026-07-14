import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Settings2 } from "lucide-react";
import { findTrack } from "@/lib/music/tracks";

interface Props {
  slug?: string | null;
  enabled?: boolean;
}

const CROSSFADE_MS = 3500;
const DEFAULT_VOLUME = 0.55;
const DEFAULT_BALANCE = 0;
const LS_VOLUME = "moninvit.music.volume";
const LS_BALANCE = "moninvit.music.balance";
const LS_MUTED = "moninvit.music.muted";

function readNumber(key: string, fallback: number, min: number, max: number) {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  if (raw === null) return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function readBool(key: string, fallback: boolean) {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  if (raw === null) return fallback;
  return raw === "1" || raw === "true";
}

/**
 * Ambient music player: crossfade looping, per-visitor volume + balance,
 * persisted in localStorage.
 */
export function AmbientMusicPlayer({ slug, enabled }: Props) {
  const track = findTrack(slug);

  // Audio graph refs.
  const aRef = useRef<HTMLAudioElement | null>(null);
  const bRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainARef = useRef<GainNode | null>(null);
  const gainBRef = useRef<GainNode | null>(null);
  const pannerRef = useRef<StereoPannerNode | null>(null);
  const activeRef = useRef<"a" | "b">("a");
  const rafRef = useRef<number | null>(null);
  const scheduledRef = useRef(false);

  // User settings (persisted, but held in refs for the rAF loop).
  const volumeRef = useRef(DEFAULT_VOLUME);
  const balanceRef = useRef(DEFAULT_BALANCE);
  const mutedRef = useRef(true);

  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [balance, setBalance] = useState(DEFAULT_BALANCE);
  const [muted, setMuted] = useState(true);
  const [ready, setReady] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  // Hydrate settings from localStorage on mount.
  useEffect(() => {
    const v = readNumber(LS_VOLUME, DEFAULT_VOLUME, 0, 1);
    const b = readNumber(LS_BALANCE, DEFAULT_BALANCE, -1, 1);
    const m = readBool(LS_MUTED, true);
    volumeRef.current = v;
    balanceRef.current = b;
    mutedRef.current = m;
    setVolume(v);
    setBalance(b);
    setMuted(m);
  }, []);

  // Build audio graph.
  useEffect(() => {
    if (!enabled || !track) return;

    const make = () => {
      const el = new Audio(track.url);
      el.loop = false;
      el.preload = "auto";
      el.crossOrigin = "anonymous";
      // Fallback volume; real gain is handled by GainNode when Web Audio available.
      el.volume = 1;
      el.muted = mutedRef.current;
      return el;
    };
    const a = make();
    const b = make();
    aRef.current = a;
    bRef.current = b;

    // Try to set up Web Audio graph for balance + master volume control.
    let ctx: AudioContext | null = null;
    let gainA: GainNode | null = null;
    let gainB: GainNode | null = null;
    let panner: StereoPannerNode | null = null;
    try {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AC) {
        ctx = new AC();
        const srcA = ctx.createMediaElementSource(a);
        const srcB = ctx.createMediaElementSource(b);
        gainA = ctx.createGain();
        gainB = ctx.createGain();
        panner = "createStereoPanner" in ctx ? ctx.createStereoPanner() : null;
        gainA.gain.value = 0;
        gainB.gain.value = 0;
        srcA.connect(gainA);
        srcB.connect(gainB);
        if (panner) {
          panner.pan.value = balanceRef.current;
          gainA.connect(panner);
          gainB.connect(panner);
          panner.connect(ctx.destination);
        } else {
          gainA.connect(ctx.destination);
          gainB.connect(ctx.destination);
        }
      }
    } catch {
      ctx = null;
    }
    ctxRef.current = ctx;
    gainARef.current = gainA;
    gainBRef.current = gainB;
    pannerRef.current = panner;

    const applyGain = (which: "a" | "b", fade: number) => {
      const g = which === "a" ? gainA : gainB;
      const el = which === "a" ? a : b;
      const target = mutedRef.current ? 0 : volumeRef.current * fade;
      if (g && ctx) g.gain.value = target;
      else el.volume = target;
    };

    const startElement = (el: HTMLAudioElement) => {
      try {
        el.currentTime = 0;
      } catch {
        /* ignore */
      }
      el.muted = mutedRef.current;
      el.play().catch(() => {});
    };

    const tick = () => {
      rafRef.current = null;
      const active = activeRef.current === "a" ? aRef.current : bRef.current;
      const other = activeRef.current === "a" ? bRef.current : aRef.current;
      if (!active || !other) return;

      const dur = active.duration;
      if (Number.isFinite(dur) && dur > 0) {
        const remaining = dur - active.currentTime;
        const fade = Math.min(CROSSFADE_MS / 1000, dur / 3);
        if (!scheduledRef.current && remaining <= fade) {
          scheduledRef.current = true;
          startElement(other);
        }
        if (scheduledRef.current) {
          const t = 1 - Math.max(0, remaining) / fade;
          applyGain(activeRef.current, 1 - t);
          applyGain(activeRef.current === "a" ? "b" : "a", t);
          if (t >= 1 || active.ended) {
            active.pause();
            try {
              active.currentTime = 0;
            } catch {
              /* ignore */
            }
            activeRef.current = activeRef.current === "a" ? "b" : "a";
            scheduledRef.current = false;
          }
        } else {
          applyGain(activeRef.current, 1);
        }
      }
      rafRef.current = window.requestAnimationFrame(tick);
    };

    const onCanPlay = () => setReady(true);
    a.addEventListener("canplaythrough", onCanPlay, { once: true });

    startElement(a);
    applyGain("a", 1);
    rafRef.current = window.requestAnimationFrame(tick);

    const onFirstGesture = () => {
      if (ctxRef.current && ctxRef.current.state === "suspended") {
        ctxRef.current.resume().catch(() => {});
      }
      if (mutedRef.current && !readBool(LS_MUTED, false)) {
        // Auto-unmute only if user hadn't explicitly muted in a previous visit.
        mutedRef.current = false;
        setMuted(false);
        [aRef.current, bRef.current].forEach((el) => {
          if (el) el.muted = false;
        });
      }
      cleanupGestures();
    };
    const cleanupGestures = () => {
      window.removeEventListener("pointerdown", onFirstGesture);
      window.removeEventListener("keydown", onFirstGesture);
      window.removeEventListener("touchstart", onFirstGesture);
    };
    window.addEventListener("pointerdown", onFirstGesture, { once: true });
    window.addEventListener("keydown", onFirstGesture, { once: true });
    window.addEventListener("touchstart", onFirstGesture, { once: true });

    return () => {
      cleanupGestures();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      a.removeEventListener("canplaythrough", onCanPlay);
      [a, b].forEach((el) => {
        el.pause();
        el.src = "";
      });
      try {
        ctx?.close();
      } catch {
        /* ignore */
      }
      aRef.current = null;
      bRef.current = null;
      ctxRef.current = null;
      gainARef.current = null;
      gainBRef.current = null;
      pannerRef.current = null;
      scheduledRef.current = false;
      activeRef.current = "a";
    };
  }, [enabled, track?.url]);

  // Persist + apply live changes.
  const applyVolume = (v: number) => {
    volumeRef.current = v;
    setVolume(v);
    try {
      window.localStorage.setItem(LS_VOLUME, String(v));
    } catch {
      /* ignore */
    }
  };
  const applyBalance = (b: number) => {
    balanceRef.current = b;
    setBalance(b);
    if (pannerRef.current) pannerRef.current.pan.value = b;
    try {
      window.localStorage.setItem(LS_BALANCE, String(b));
    } catch {
      /* ignore */
    }
  };
  const applyMuted = (next: boolean) => {
    mutedRef.current = next;
    setMuted(next);
    [aRef.current, bRef.current].forEach((el) => {
      if (!el) return;
      el.muted = next;
      const active = activeRef.current === "a" ? aRef.current : bRef.current;
      if (!next && el === active && el.paused) el.play().catch(() => {});
    });
    if (!next && ctxRef.current?.state === "suspended") {
      ctxRef.current.resume().catch(() => {});
    }
    try {
      window.localStorage.setItem(LS_MUTED, next ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

  if (!enabled || !track) return null;

  return (
    <div
      className="fixed bottom-4 left-4 z-[65] flex flex-col items-start gap-2"
      style={{ paddingBottom: "max(0px, env(safe-area-inset-bottom))" }}
    >
      {panelOpen && (
        <div className="w-64 rounded-2xl border border-white/15 bg-black/70 p-3 text-white shadow-lg backdrop-blur">
          <div className="flex items-center justify-between text-[11px] font-medium opacity-90">
            <span className="line-clamp-1">{track.name}</span>
            <span className="font-mono text-[9px] uppercase tracking-widest opacity-60">
              {Math.round(volume * 100)}%
            </span>
          </div>
          <label className="mt-2 block">
            <span className="font-mono text-[9px] uppercase tracking-widest opacity-60">
              Volume
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => applyVolume(Number(e.target.value))}
              className="mt-1 w-full accent-white"
              aria-label="Volume"
            />
          </label>
          <label className="mt-2 block">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-widest opacity-60">
                Balance
              </span>
              <span className="font-mono text-[9px] tracking-widest opacity-60">
                {balance === 0
                  ? "Centre"
                  : balance < 0
                    ? `G ${Math.round(Math.abs(balance) * 100)}`
                    : `D ${Math.round(balance * 100)}`}
              </span>
            </div>
            <input
              type="range"
              min={-1}
              max={1}
              step={0.05}
              value={balance}
              onChange={(e) => applyBalance(Number(e.target.value))}
              className="mt-1 w-full accent-white"
              aria-label="Balance stéréo"
              disabled={!pannerRef.current}
            />
            {!pannerRef.current && (
              <p className="mt-1 text-[9px] opacity-50">
                Balance non supportée par ce navigateur.
              </p>
            )}
          </label>
          <button
            type="button"
            onClick={() => {
              applyVolume(DEFAULT_VOLUME);
              applyBalance(DEFAULT_BALANCE);
            }}
            className="mt-2 w-full rounded-lg border border-white/20 px-2 py-1 text-[10px] uppercase tracking-widest opacity-80 transition hover:opacity-100"
          >
            Réinitialiser
          </button>
        </div>
      )}

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => applyMuted(!muted)}
          aria-label={muted ? `Activer la musique : ${track.name}` : `Couper la musique : ${track.name}`}
          title={track.name}
          className="inline-flex size-11 items-center justify-center rounded-full border border-white/25 bg-black/55 text-white shadow-lg backdrop-blur transition hover:bg-black/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {muted || !ready ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <button
          type="button"
          onClick={() => setPanelOpen((o) => !o)}
          aria-label="Réglages audio"
          aria-expanded={panelOpen}
          className="inline-flex size-9 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white shadow-md backdrop-blur transition hover:bg-black/70"
        >
          <Settings2 size={14} />
        </button>
      </div>
    </div>
  );
}
