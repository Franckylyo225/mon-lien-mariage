import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { findTrack } from "@/lib/music/tracks";

interface Props {
  slug?: string | null;
  enabled?: boolean;
}

/**
 * Ambient music player for the public invitation page.
 * - Attempts autoplay muted (allowed by browsers), unmutes on first user gesture.
 * - Loops indefinitely.
 * - Shows a floating mute/unmute button.
 */
export function AmbientMusicPlayer({ slug, enabled }: Props) {
  const track = findTrack(slug);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled || !track) return;
    const audio = new Audio(track.url);
    audio.loop = true;
    audio.preload = "auto";
    audio.muted = true;
    audio.volume = 0.55;
    audioRef.current = audio;
    audio.play().then(() => setReady(true)).catch(() => setReady(true));

    // Unmute on first user interaction if user hasn't touched the button yet.
    const onFirstGesture = () => {
      const a = audioRef.current;
      if (!a) return;
      if (a.muted) {
        a.muted = false;
        setMuted(false);
        a.play().catch(() => {});
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
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [enabled, track?.url]);

  if (!enabled || !track) return null;

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.muted || a.paused) {
      a.muted = false;
      setMuted(false);
      a.play().catch(() => {});
    } else {
      a.muted = true;
      setMuted(true);
    }
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
