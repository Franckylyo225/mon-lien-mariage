import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { findTrack } from "@/lib/music/tracks";

interface Props {
  slug?: string | null;
  enabled?: boolean;
}

const CROSSFADE_MS = 3500;
const TARGET_VOLUME = 0.55;

/**
 * Ambient music player with seamless crossfade looping.
 * Uses two <audio> elements ping-ponging: near end of A, start B and fade.
 */
export function AmbientMusicPlayer({ slug, enabled }: Props) {
  const track = findTrack(slug);
  const aRef = useRef<HTMLAudioElement | null>(null);
  const bRef = useRef<HTMLAudioElement | null>(null);
  const activeRef = useRef<"a" | "b">("a");
  const rafRef = useRef<number | null>(null);
  const scheduledRef = useRef(false);
  const mutedRef = useRef(true);
  const [muted, setMuted] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled || !track) return;

    const make = () => {
      const a = new Audio(track.url);
      a.loop = false;
      a.preload = "auto";
      a.crossOrigin = "anonymous";
      a.volume = 0;
      a.muted = true;
      return a;
    };
    const a = make();
    const b = make();
    aRef.current = a;
    bRef.current = b;

    const setVol = (el: HTMLAudioElement, v: number) => {
      el.volume = Math.max(0, Math.min(1, v));
    };

    const startElement = (el: HTMLAudioElement, targetVol: number) => {
      el.currentTime = 0;
      el.muted = mutedRef.current;
      setVol(el, mutedRef.current ? 0 : targetVol);
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
          startElement(other, mutedRef.current ? 0 : TARGET_VOLUME);
        }
        if (scheduledRef.current) {
          // t goes 0 -> 1 across the fade window
          const t = 1 - Math.max(0, remaining) / fade;
          const target = mutedRef.current ? 0 : TARGET_VOLUME;
          setVol(active, target * (1 - t));
          setVol(other, target * t);
          if (t >= 1 || active.ended) {
            active.pause();
            active.currentTime = 0;
            activeRef.current = activeRef.current === "a" ? "b" : "a";
            scheduledRef.current = false;
          }
        } else if (!mutedRef.current) {
          setVol(active, TARGET_VOLUME);
        }
      }
      rafRef.current = window.requestAnimationFrame(tick);
    };

    const onCanPlay = () => setReady(true);
    a.addEventListener("canplaythrough", onCanPlay, { once: true });

    // Kick off muted (browsers allow autoplay when muted).
    startElement(a, 0);
    rafRef.current = window.requestAnimationFrame(tick);

    const onFirstGesture = () => {
      if (mutedRef.current) {
        mutedRef.current = false;
        setMuted(false);
        [aRef.current, bRef.current].forEach((el) => {
          if (!el) return;
          el.muted = false;
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
      aRef.current = null;
      bRef.current = null;
      scheduledRef.current = false;
      activeRef.current = "a";
    };
  }, [enabled, track?.url]);

  if (!enabled || !track) return null;

  const toggle = () => {
    const nextMuted = !mutedRef.current;
    mutedRef.current = nextMuted;
    setMuted(nextMuted);
    [aRef.current, bRef.current].forEach((el) => {
      if (!el) return;
      el.muted = nextMuted;
      if (!nextMuted && el.paused && el === (activeRef.current === "a" ? aRef.current : bRef.current)) {
        el.play().catch(() => {});
      }
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={muted ? `Activer la musique : ${track.name}` : `Couper la musique : ${track.name}`}
      title={track.name}
      className="fixed bottom-4 left-4 z-[65] inline-flex size-11 items-center justify-center rounded-full border border-white/25 bg-black/55 text-white shadow-lg backdrop-blur transition hover:bg-black/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      style={{ paddingBottom: "max(0px, env(safe-area-inset-bottom))" }}
    >
      {muted || !ready ? <VolumeX size={18} /> : <Volume2 size={18} />}
      <span className="sr-only">{track.name}</span>
    </button>
  );
}
