import { useEffect, useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { supabase } from "@/integrations/supabase/client";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Camera, ImageIcon, Loader2, Trash2, Plus } from "lucide-react";

const SIGNED_URL_EXPIRY = 60 * 60 * 24 * 365 * 10;

interface PhotoGridSheetProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  intro?: string;
  weddingId: string | null;
  folder: string;
  enabled: boolean;
  onEnabledChange: (v: boolean) => void;
  titleField?: {
    label: string;
    value: string;
    placeholder?: string;
    onChange: (v: string) => void;
  };
  bodyField?: {
    label: string;
    value: string;
    placeholder?: string;
    onChange: (v: string) => void;
  };
  images: string[];
  onImagesChange: (next: string[]) => void;
  maxImages?: number;
}

export function PhotoGridSheet({
  open,
  onOpenChange,
  title,
  intro,
  weddingId,
  folder,
  enabled,
  onEnabledChange,
  titleField,
  bodyField,
  images,
  onImagesChange,
  maxImages = 12,
}: PhotoGridSheetProps) {
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local drafts so typing feels instant; parent persists debounced.
  const [titleDraft, setTitleDraft] = useState(titleField?.value ?? "");
  const [bodyDraft, setBodyDraft] = useState(bodyField?.value ?? "");

  // Sync from parent when the sheet (re)opens or the underlying value changes
  // from outside (e.g. after initial load).
  useEffect(() => {
    if (open) {
      setTitleDraft(titleField?.value ?? "");
      setBodyDraft(bodyField?.value ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleFiles = async (files: FileList) => {
    if (!weddingId) {
      setError("Terminez d'abord votre profil pour ajouter des photos.");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const remaining = Math.max(0, maxImages - images.length);
      const toUpload = Array.from(files).slice(0, remaining);
      const uploaded: string[] = [];
      for (const file of toUpload) {
        const compressed = await imageCompression(file, {
          maxSizeMB: 1.2,
          maxWidthOrHeight: 1800,
          useWebWorker: true,
          fileType: "image/webp",
        });
        const path = `${weddingId}/${folder}/${crypto.randomUUID()}.webp`;
        const { error: upErr } = await supabase.storage
          .from("wedding-photos")
          .upload(path, compressed, { contentType: "image/webp", upsert: false });
        if (upErr) throw upErr;
        const { data: signed, error: sErr } = await supabase.storage
          .from("wedding-photos")
          .createSignedUrl(path, SIGNED_URL_EXPIRY);
        if (sErr || !signed?.signedUrl) throw sErr ?? new Error("URL introuvable");
        uploaded.push(signed.signedUrl);
      }
      if (uploaded.length > 0) onImagesChange([...images, ...uploaded]);
    } catch (err) {
      console.error("[photo upload]", err);
      setError(err instanceof Error ? err.message : "Erreur pendant l'envoi.");
    } finally {
      setUploading(false);
      if (galleryInputRef.current) galleryInputRef.current.value = "";
      if (cameraInputRef.current) cameraInputRef.current.value = "";
    }
  };

  const removeImage = (i: number) => {
    onImagesChange(images.filter((_, idx) => idx !== i));
  };

  const canAdd = images.length < maxImages;

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title={title}>
      <div className="space-y-5">
        {intro && <p className="text-[12px] opacity-70">{intro}</p>}

        <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3">
          <div>
            <p className="text-sm font-medium">Afficher ce bloc</p>
            <p className="text-[11px] opacity-60">
              Vos invités verront ce bloc sur votre page.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => onEnabledChange(!enabled)}
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

        <div
          className={
            "space-y-4 transition-opacity " +
            (!enabled ? "pointer-events-none opacity-40" : "")
          }
        >
          {titleField && (
            <div>
              <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
                {titleField.label}
              </label>
              <input
                type="text"
                value={titleField.value}
                placeholder={titleField.placeholder}
                onChange={(e) => titleField.onChange(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          )}

          {bodyField && (
            <div>
              <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
                {bodyField.label}
              </label>
              <textarea
                value={bodyField.value}
                rows={5}
                placeholder={bodyField.placeholder}
                onChange={(e) => bodyField.onChange(e.target.value)}
                className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          )}

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
                Photos ({images.length}/{maxImages})
              </label>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {images.map((src, i) => (
                <div
                  key={i}
                  className="relative aspect-square overflow-hidden rounded-xl ring-1 ring-border"
                >
                  <img src={src} alt="" className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    aria-label="Retirer"
                    className="absolute right-1 top-1 grid size-7 place-items-center rounded-full bg-black/70 text-white transition hover:bg-black"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}

              {canAdd && (
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={uploading}
                  className="grid aspect-square place-items-center rounded-xl border-2 border-dashed border-border text-muted-foreground transition hover:border-foreground/40 hover:text-foreground disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <Plus className="size-6" />
                  )}
                </button>
              )}
            </div>
          </div>

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />

          {canAdd && (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={uploading}
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 py-3 text-sm transition active:scale-[0.98] disabled:opacity-50"
              >
                <Camera className="size-4" />
                Prendre une photo
              </button>
              <button
                type="button"
                disabled={uploading}
                onClick={() => galleryInputRef.current?.click()}
                className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 py-3 text-sm transition active:scale-[0.98] disabled:opacity-50"
              >
                <ImageIcon className="size-4" />
                Depuis mes photos
              </button>
            </div>
          )}

          {error && (
            <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-[12px] text-destructive">
              {error}
            </p>
          )}

          {!weddingId && (
            <p className="text-[11px] text-amber-600">
              Terminez d'abord votre profil pour ajouter des photos.
            </p>
          )}
        </div>
      </div>
    </BottomSheet>
  );
}
