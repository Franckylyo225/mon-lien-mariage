import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { findTrack } from "@/lib/music/tracks";

interface Props {
  slug?: string | null;
  enabled?: boolean;
}

const CROSSFADE_MS = 3500;
const DEFAULT_VOLUME = 0.55;
const LS_MUTED = "moninvit.music.muted";

function readBool(key: string, fallback: boolean) {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  if (raw === null) return fallback;
  return raw === "1" || raw === "true";
}

/**
 * Ambient music player: crossfade looping, play/pause only for visitors.
 */
export function AmbientMusicPlayer({ slug, enabled }: Props) {
  const track = findTrack(slug);

  // Audio graph refs.
  const aRef = useRef<HTMLAudioElement | null>(null);
  const bRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainARef = useRef<GainNode | null>(null);
  const gainBRef = useRef<GainNode | null>(null);
  const activeRef = useRef<"a" | "b">("a");
  const rafRef = useRef<number | null>(null);
  const scheduledRef = useRef(false);

  const mutedRef = useRef(true);
  const [muted, setMuted] = useState(true);
  const [ready, setReady] = useState(false);

  // Hydrate mute setting from localStorage on mount.
  useEffect(() => {
    const m = readBool(LS_MUTED, true);
    mutedRef.current = m;
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
      el.volume = 1;
      el.muted = mutedRef.current;
      return el;
    };
    const a = make();
    const b = make();
    aRef.current = a;
    bRef.current = b;

    // Try to set up Web Audio graph for master volume control.
    let ctx: AudioContext | null = null;
    let gainA: GainNode | null = null;
    let gainB: GainNode | null = null;
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
        gainA.gain.value = 0;
        gainB.gain.value = 0;
        srcA.connect(gainA);
        srcB.connect(gainB);
        gainA.connect(ctx.destination);
        gainB.connect(ctx.destination);
      }
    } catch {
      ctx = null;
    }
    ctxRef.current = ctx;
    gainARef.current = gainA;
    gainBRef.current = gainB;

    const applyGain = (which: "a" | "b", fade: number) => {
      const g = which === "a" ? gainA : gainB;
      const el = which === "a" ? a : b;
      const target = mutedRef.current ? 0 : DEFAULT_VOLUME * fade;
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
      scheduledRef.current = false;
      activeRef.current = "a";
    };
  }, [enabled, track?.url]);

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
    <button
      type="button"
      onClick={() => applyMuted(!muted)}
      aria-label={muted ? `Activer la musique : ${track.name}` : `Couper la musique : ${track.name}`}
      title={track.name}
      className="fixed bottom-4 left-4 z-[65] inline-flex size-11 items-center justify-center rounded-full border border-white/25 bg-black/55 text-white shadow-lg backdrop-blur transition hover:bg-black/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      {muted || !ready ? <VolumeX size={18} /> : <Volume2 size={18} />}
    </button>
  );
}
