import { useEffect, useRef, useState } from "react";
import { Play, Pause, VolumeX } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { MUSIC_TRACKS } from "@/lib/music/tracks";

interface Patch {
  musicSlug: string | null;
  musicEnabled: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  currentSlug: string | null | undefined;
  enabled: boolean;
  onPatch: (patch: Partial<Patch>) => void;
}

export function MusicSheet({ open, onOpenChange, currentSlug, enabled, onPatch }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!open) {
      audioRef.current?.pause();
      setPlaying(null);
    }
  }, [open]);

  const preview = (slug: string, url: string) => {
    if (playing === slug) {
      audioRef.current?.pause();
      setPlaying(null);
      return;
    }
    audioRef.current?.pause();
    const a = new Audio(url);
    a.volume = 0.6;
    a.play().catch(() => {});
    a.onended = () => setPlaying(null);
    audioRef.current = a;
    setPlaying(slug);
  };

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="Musique d'ambiance">
      <div className="space-y-5">
        <p className="text-[12px] opacity-70">
          Choisissez une musique qui se lance automatiquement à l'ouverture de
          votre page. Les invités peuvent la couper via le bouton flottant.
        </p>

        <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3">
          <div>
            <p className="text-sm font-medium">Activer la musique d'ambiance</p>
            <p className="text-[11px] opacity-60">
              Lecture en boucle, démarre en silence puis s'active à la première interaction.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => onPatch({ musicEnabled: !enabled })}
            className={
              "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors " +
              (enabled ? "bg-primary" : "bg-muted")
            }
          >
            <span
              className={
                "inline-block size-5 rounded-full bg-background shadow transition-transform " +
                (enabled ? "translate-x-5" : "translate-x-0.5")
              }
            />
          </button>
        </label>

        <div className={enabled ? "space-y-2" : "pointer-events-none space-y-2 opacity-40"}>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
            Bibliothèque
          </p>
          {MUSIC_TRACKS.map((t) => {
            const active = currentSlug === t.slug;
            const isPlaying = playing === t.slug;
            return (
              <div
                key={t.slug}
                className={
                  "flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition " +
                  (active
                    ? "border-foreground bg-foreground/5"
                    : "border-border bg-background hover:border-foreground/40")
                }
              >
                <button
                  type="button"
                  onClick={() => preview(t.slug, t.url)}
                  aria-label={isPlaying ? "Pause" : `Écouter ${t.name}`}
                  className="grid size-9 place-items-center rounded-full border border-border bg-background"
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <button
                  type="button"
                  onClick={() => onPatch({ musicSlug: t.slug, musicEnabled: true })}
                  className="flex-1 text-left"
                >
                  <p className="text-sm font-medium">{t.name}</p>
                  {t.mood && (
                    <p className="text-[11px] opacity-60">{t.mood}</p>
                  )}
                </button>
                {active && (
                  <span className="font-mono text-[9px] uppercase tracking-widest opacity-60">
                    Choisie
                  </span>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => {
              audioRef.current?.pause();
              setPlaying(null);
              onPatch({ musicSlug: null, musicEnabled: false });
            }}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm hover:border-foreground/40"
          >
            <VolumeX size={14} /> Aucune musique
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
