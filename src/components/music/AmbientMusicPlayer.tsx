import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { findTrack } from "@/lib/music/tracks";

interface Props {
  slug?: string | null;
  enabled?: boolean;
}

const TARGET_VOLUME = 0.55;
const FADE_MS = 1200;
const LS_MUTED = "moninvit.music.muted";

function storedMuted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(LS_MUTED) === "1";
  } catch {
    return false;
  }
}

/**
 * Lecteur d'ambiance : tente la lecture avec le son, et si le navigateur la
 * bloque, démarre en silence puis active le son à la première interaction
 * du visiteur (toucher, clic, touche, défilement) — y compris le geste
 * d'ouverture de l'invitation.
 */
export function AmbientMusicPlayer({ slug, enabled }: Props) {
  const track = findTrack(slug);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mutedRef = useRef(false);
  const fadeRef = useRef<number | null>(null);
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(false);

  const fadeIn = useCallback((el: HTMLAudioElement) => {
    if (fadeRef.current) window.clearInterval(fadeRef.current);
    let v = 0;
    try {
      el.volume = 0;
    } catch {
      return;
    }
    const step = TARGET_VOLUME / (FADE_MS / 50);
    fadeRef.current = window.setInterval(() => {
      v = Math.min(TARGET_VOLUME, v + step);
      try {
        el.volume = v;
      } catch {
        /* iOS ignore le volume */
      }
      if (v >= TARGET_VOLUME && fadeRef.current) {
        window.clearInterval(fadeRef.current);
        fadeRef.current = null;
      }
    }, 50);
  }, []);

  useEffect(() => {
    if (!enabled || !track) return;

    const wasMuted = storedMuted();
    mutedRef.current = wasMuted;
    setMuted(wasMuted);

    const el = new Audio();
    el.src = track.url;
    el.loop = true;
    el.preload = "auto";
    el.autoplay = true;
    // Certains navigateurs bloquent le décodage cross-origin via crossOrigin.
    el.setAttribute("playsinline", "");
    el.muted = wasMuted;
    el.volume = wasMuted ? 0 : TARGET_VOLUME;
    audioRef.current = el;

    let disposed = false;

    const attempt = async () => {
      if (disposed) return;
      try {
        el.muted = mutedRef.current;
        await el.play();
        if (!mutedRef.current) fadeIn(el);
        setPlaying(!mutedRef.current);
        if (!mutedRef.current) removeGestureListeners();
      } catch {
        // Lecture avec le son refusée : on démarre en silence et on attend
        // la première interaction pour réactiver le son.
        try {
          el.muted = true;
          await el.play();
        } catch {
          /* le navigateur refuse même en silence : on attend le geste */
        }
        setPlaying(false);
      }
    };

    const onGesture = () => {
      if (disposed) return;
      if (mutedRef.current) return; // le visiteur a coupé volontairement
      el.muted = false;
      const p = el.play();
      if (p && typeof p.then === "function") {
        p.then(() => {
          fadeIn(el);
          setPlaying(true);
          removeGestureListeners();
        }).catch(() => {});
      } else {
        fadeIn(el);
        setPlaying(true);
        removeGestureListeners();
      }
    };

    const events: Array<keyof DocumentEventMap> = [
      "pointerdown",
      "touchstart",
      "touchend",
      "mousedown",
      "click",
      "keydown",
      "scroll",
      "wheel",
    ];
    const addGestureListeners = () => {
      events.forEach((ev) =>
        document.addEventListener(ev, onGesture, { capture: true, passive: true }),
      );
    };
    function removeGestureListeners() {
      events.forEach((ev) =>
        document.removeEventListener(ev, onGesture, { capture: true } as EventListenerOptions),
      );
    }

    addGestureListeners();
    void attempt();

    // Reprise après retour d'onglet.
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (mutedRef.current || disposed) return;
      if (el.paused) el.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      disposed = true;
      removeGestureListeners();
      document.removeEventListener("visibilitychange", onVisible);
      if (fadeRef.current) window.clearInterval(fadeRef.current);
      el.pause();
      el.src = "";
      audioRef.current = null;
    };
  }, [enabled, track?.url, fadeIn]);

  const toggle = () => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMuted(next);
    const el = audioRef.current;
    if (el) {
      el.muted = next;
      if (!next) {
        el.volume = TARGET_VOLUME;
        el.play()
          .then(() => setPlaying(true))
          .catch(() => setPlaying(false));
      } else {
        setPlaying(false);
      }
    }
    try {
      window.localStorage.setItem(LS_MUTED, next ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

  if (!enabled || !track) return null;

  const soundOn = !muted && playing;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={soundOn ? `Couper la musique : ${track.name}` : `Activer la musique : ${track.name}`}
      title={track.name}
      className="fixed bottom-4 left-4 z-[65] inline-flex size-11 items-center justify-center rounded-full border border-white/25 bg-black/55 text-white shadow-lg backdrop-blur transition hover:bg-black/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
    </button>
  );
}
