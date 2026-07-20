import { useEffect, useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { supabase } from "@/integrations/supabase/client";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Camera, ImageIcon, Loader2, Trash2, Plus } from "lucide-react";
import { ensureAuthOrMessage, friendlyUploadError } from "@/lib/upload-errors";

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
  extraControls?: React.ReactNode;
  /** Optional display-mode toggle (used by the gallery to pick grid vs marquee). */
  displayField?: {
    value: "grid" | "marquee";
    onChange: (v: "grid" | "marquee") => void;
  };
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
  extraControls,
  displayField,
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
      const skipped: string[] = [];
      for (const file of toUpload) {
        // Reject HEIC/HEIF up-front — browsers can't decode them, and the
        // compressor would silently fail on low-end Android (Tecno, Itel).
        const nameLower = file.name.toLowerCase();
        const looksHeic =
          /image\/hei[cf]/i.test(file.type) ||
          nameLower.endsWith(".heic") ||
          nameLower.endsWith(".heif");
        if (looksHeic) {
          skipped.push(file.name || "photo");
          continue;
        }
        // Compress best-effort; fall back to the original file (Android Chrome
        // sometimes fails to encode WebP / very large HEIC-derived JPEGs).
        let payload: Blob = file;
        try {
          payload = await imageCompression(file, {
            maxSizeMB: 1.2,
            maxWidthOrHeight: 1800,
            useWebWorker: true,
            fileType: "image/jpeg",
          });
        } catch (compErr) {
          console.warn("[photo] compression failed, uploading original", compErr);
        }
        const path = `${weddingId}/${folder}/${safeUuid()}.jpg`;
        const { error: upErr } = await supabase.storage
          .from("wedding-photos")
          .upload(path, payload, { contentType: "image/jpeg", upsert: false });
        if (upErr) throw upErr;
        const { data: signed, error: sErr } = await supabase.storage
          .from("wedding-photos")
          .createSignedUrl(path, SIGNED_URL_EXPIRY);
        if (sErr || !signed?.signedUrl) throw sErr ?? new Error("URL introuvable");
        uploaded.push(signed.signedUrl);
      }
      if (uploaded.length > 0) onImagesChange([...images, ...uploaded]);
      if (skipped.length > 0) {
        setError(
          `Format HEIC non lisible par votre navigateur (${skipped.length} photo${skipped.length > 1 ? "s" : ""} ignorée${skipped.length > 1 ? "s" : ""}). Dans les réglages de votre appareil photo, choisissez « JPEG » ou « Plus compatible ».`,
        );
      }
    } catch (err) {
      console.error("[photo upload]", err);
      setError(err instanceof Error ? err.message : "Erreur pendant l'envoi.");
    } finally {
      setUploading(false);
      if (galleryInputRef.current) galleryInputRef.current.value = "";
      if (cameraInputRef.current) cameraInputRef.current.value = "";
    }
  };


  function safeUuid(): string {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    const bytes = new Uint8Array(16);
    (crypto as Crypto).getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

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
                value={titleDraft}
                placeholder={titleField.placeholder}
                onChange={(e) => {
                  setTitleDraft(e.target.value);
                  titleField.onChange(e.target.value);
                }}
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
                value={bodyDraft}
                rows={5}
                placeholder={bodyField.placeholder}
                onChange={(e) => {
                  setBodyDraft(e.target.value);
                  bodyField.onChange(e.target.value);
                }}
                className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          )}

          {displayField && (
            <div>
              <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
                Type d'affichage
              </label>
              <div className="grid grid-cols-2 gap-2">
                <DisplayOption
                  active={displayField.value === "grid"}
                  onClick={() => displayField.onChange("grid")}
                  title="Grille"
                  subtitle="Affichage classique"
                  preview={<GridPreview />}
                />
                <DisplayOption
                  active={displayField.value === "marquee"}
                  onClick={() => displayField.onChange("marquee")}
                  title="Défilement"
                  subtitle="2 lignes animées"
                  preview={<MarqueePreview />}
                />
              </div>
            </div>
          )}

          {extraControls}


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

function DisplayOption({
  active,
  onClick,
  title,
  subtitle,
  preview,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
  preview: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        "flex flex-col overflow-hidden rounded-2xl border-2 text-left transition active:scale-[0.98] " +
        (active
          ? "border-foreground shadow-sm"
          : "border-border hover:border-foreground/40")
      }
    >
      <div className="grid h-16 w-full place-items-center bg-muted/40 px-2">
        {preview}
      </div>
      <div className="border-t border-border bg-background px-3 py-2">
        <p className="text-[12px] font-medium">{title}</p>
        <p className="text-[10px] opacity-60">{subtitle}</p>
      </div>
    </button>
  );
}

function GridPreview() {
  return (
    <div className="grid w-full max-w-[80px] grid-cols-3 gap-1">
      {Array.from({ length: 6 }).map((_, i) => (
        <span
          key={i}
          className="aspect-square rounded-[3px] bg-foreground/60"
        />
      ))}
    </div>
  );
}

function MarqueePreview() {
  return (
    <div className="flex w-full max-w-[90px] flex-col gap-1 overflow-hidden">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={"a" + i}
            className="h-4 w-6 rounded-[4px] bg-foreground/60"
            style={{ opacity: 1 - i * 0.15 }}
          />
        ))}
      </div>
      <div className="flex justify-end gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={"b" + i}
            className="h-4 w-6 rounded-[4px] bg-foreground/60"
            style={{ opacity: 0.4 + i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}
