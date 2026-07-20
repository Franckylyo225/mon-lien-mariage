import { useCallback, useEffect, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import imageCompression from "browser-image-compression";
import { supabase } from "@/integrations/supabase/client";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Camera, ImageIcon, Loader2, RotateCw, Trash2 } from "lucide-react";
import { ensureAuthOrMessage, friendlyUploadError } from "@/lib/upload-errors";



interface HeroPhotoSheetProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  weddingId: string | null;
  currentUrl?: string;
  onUploaded: (url: string) => void | Promise<void>;
  onRemove: () => void | Promise<void>;
}

type Step = "source" | "crop" | "uploading";

// 10 years (max acceptable)
const SIGNED_URL_EXPIRY = 60 * 60 * 24 * 365 * 10;
const ASPECT = 2 / 3;

export function HeroPhotoSheet({
  open,
  onOpenChange,
  weddingId,
  currentUrl,
  onUploaded,
  onRemove,
}: HeroPhotoSheetProps) {
  const [step, setStep] = useState<Step>("source");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [error, setError] = useState<string | null>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Track the current object URL so we can revoke it and free memory —
  // critical on low-RAM Android (Tecno / Itel) where large data URLs OOM.
  const objectUrlRef = useRef<string | null>(null);
  const revokeObjectUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };
  useEffect(() => () => revokeObjectUrl(), []);

  const reset = () => {
    revokeObjectUrl();
    setStep("source");
    setImageSrc(null);
    setRotation(0);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedArea(null);
    setError(null);
  };

  const handleClose = (o: boolean) => {
    if (!o) reset();
    onOpenChange(o);
  };

  const handleFile = async (file: File) => {
    setError(null);
    // HEIC/HEIF from newer phone cameras can't be decoded by the browser.
    const nameLower = file.name.toLowerCase();
    const looksHeic =
      /image\/hei[cf]/i.test(file.type) ||
      nameLower.endsWith(".heic") ||
      nameLower.endsWith(".heif");
    if (looksHeic) {
      setError(
        "Ce format (HEIC) n'est pas lisible par votre navigateur. Dans les réglages de votre appareil photo, choisissez « JPEG » ou « Plus compatible », puis reprenez la photo.",
      );
      return;
    }
    try {
      // Pre-downscale large photos BEFORE feeding the cropper. Full-res
      // phone photos (12MP+) blow up the WebView canvas on low-end Android
      // and either silently fail or freeze. 2000px on the long edge is
      // plenty for a hero image and keeps memory in check.
      let source: Blob = file;
      try {
        source = await imageCompression(file, {
          maxSizeMB: 3,
          maxWidthOrHeight: 2000,
          useWebWorker: true,
          fileType: "image/jpeg",
          initialQuality: 0.9,
        });
      } catch (preErr) {
        console.warn("[hero] pre-downscale failed, using original", preErr);
      }
      revokeObjectUrl();
      const url = URL.createObjectURL(source);
      objectUrlRef.current = url;
      // Verify the image actually decodes before entering the cropper.
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("decode"));
        img.src = url;
      });
      setImageSrc(url);
      setStep("crop");
    } catch (err) {
      console.error("[hero] handleFile", err);
      setError(
        "Impossible d'ouvrir cette photo. Essayez une autre image ou reprenez-la en JPEG.",
      );
    }
  };


  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedArea(pixels);
  }, []);

  const handleConfirm = async () => {
    if (!imageSrc || !croppedArea || !weddingId) return;
    setError(null);
    const authMsg = await ensureAuthOrMessage();
    if (authMsg) {
      setError(authMsg);
      return;
    }
    setStep("uploading");
    try {
      // 1. Render cropped canvas (JPEG — universally supported on Android/iOS)
      const blob = await renderCroppedBlob(imageSrc, croppedArea, rotation);
      // 2. Compress (best-effort — fall back to original if it fails)
      let toUpload: Blob = blob;
      try {
        toUpload = await imageCompression(
          new File([blob], "hero.jpg", { type: "image/jpeg" }),
          { maxSizeMB: 1.5, maxWidthOrHeight: 2000, useWebWorker: true, fileType: "image/jpeg" },
        );
      } catch (compErr) {
        console.warn("[hero] compression failed, uploading original", compErr);
      }
      // 3. Upload
      const path = `${weddingId}/hero/${safeUuid()}.jpg`;
      const { error: upErr } = await supabase.storage
        .from("wedding-photos")
        .upload(path, toUpload, { contentType: "image/jpeg", upsert: false });
      if (upErr) throw upErr;

      // 4. Signed URL (10 years)
      const { data: signed, error: sErr } = await supabase.storage
        .from("wedding-photos")
        .createSignedUrl(path, SIGNED_URL_EXPIRY);
      if (sErr || !signed?.signedUrl) throw sErr ?? new Error("URL introuvable");

      await onUploaded(signed.signedUrl);
      reset();
      onOpenChange(false);
    } catch (err) {
      console.error("[hero upload]", err);
      setError(friendlyUploadError(err));
      setStep("crop");
    }
  };

  return (
    <BottomSheet open={open} onOpenChange={handleClose} title="Photo de couverture">
      {step === "source" && (
        <div className="space-y-3">
          {currentUrl ? (
            <img
              src={currentUrl}
              alt=""
              className="aspect-[2/3] w-full rounded-2xl object-cover"
            />
          ) : (
            <div className="grid aspect-[2/3] w-full place-items-center rounded-2xl border-2 border-dashed border-border bg-muted/40 font-mono text-[10px] uppercase tracking-widest opacity-50">
              Aucune photo
            </div>
          )}

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="user"
            hidden
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex w-full items-center gap-3 rounded-2xl border border-border bg-background p-4 text-left transition active:scale-[0.98]"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Camera className="size-5" />
            </span>
            <div>
              <p className="text-sm font-medium">Prendre une photo</p>
              <p className="text-[11px] opacity-60">Utiliser l'appareil photo</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="flex w-full items-center gap-3 rounded-2xl border border-border bg-background p-4 text-left transition active:scale-[0.98]"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <ImageIcon className="size-5" />
            </span>
            <div>
              <p className="text-sm font-medium">Choisir depuis mes photos</p>
              <p className="text-[11px] opacity-60">Galerie de l'appareil</p>
            </div>
          </button>

          {currentUrl && (
            <button
              type="button"
              onClick={async () => {
                await onRemove();
                onOpenChange(false);
              }}
              className="flex w-full items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-left text-destructive transition active:scale-[0.98]"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-destructive/10">
                <Trash2 className="size-5" />
              </span>
              <div>
                <p className="text-sm font-medium">Retirer la photo</p>
                <p className="text-[11px] opacity-60">Revenir au dégradé par défaut</p>
              </div>
            </button>
          )}

          {!weddingId && (
            <p className="text-[11px] text-amber-600">
              Terminez d'abord votre profil pour uploader une photo.
            </p>
          )}
        </div>
      )}

      {step === "crop" && imageSrc && (
        <div className="space-y-3">
          <div className="relative mx-auto aspect-[2/3] w-full max-w-sm overflow-hidden rounded-2xl bg-black">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={ASPECT}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              objectFit="cover"
            />
          </div>

          <div>
            <label className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest opacity-60">
              <span>Zoom</span>
              <span>{zoom.toFixed(1)}×</span>
            </label>
            <input
              type="range"
              min={1}
              max={4}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 font-mono text-[10px] uppercase tracking-widest transition active:scale-[0.97]"
            >
              <RotateCw className="size-3.5" />
              Pivoter
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-xl border border-border bg-background px-3 py-2 font-mono text-[10px] uppercase tracking-widest transition active:scale-[0.97]"
            >
              Recommencer
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="ml-auto rounded-xl bg-foreground px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-background transition active:scale-[0.97]"
            >
              Confirmer
            </button>
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-[11px] text-destructive">
              {error}
            </p>
          )}
        </div>
      )}

      {step === "uploading" && (
        <div className="grid place-items-center gap-3 py-16">
          <Loader2 className="size-8 animate-spin opacity-50" />
          <p className="font-mono text-[10px] uppercase tracking-widest opacity-60">
            Envoi de la photo…
          </p>
        </div>
      )}
    </BottomSheet>
  );
}

/** Safe UUID that works even on browsers without crypto.randomUUID. */
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


/** Draw the cropped area at native resolution as JPEG blob. */
async function renderCroppedBlob(
  src: string,
  area: Area,
  rotation: number,
): Promise<Blob> {
  const image = await loadImage(src);
  const rad = (rotation * Math.PI) / 180;

  // Rotated bounding box
  const sin = Math.abs(Math.sin(rad));
  const cos = Math.abs(Math.cos(rad));
  const bBoxW = image.width * cos + image.height * sin;
  const bBoxH = image.width * sin + image.height * cos;

  const rotCanvas = document.createElement("canvas");
  rotCanvas.width = bBoxW;
  rotCanvas.height = bBoxH;
  const rotCtx = rotCanvas.getContext("2d");
  if (!rotCtx) throw new Error("Canvas indisponible");
  rotCtx.translate(bBoxW / 2, bBoxH / 2);
  rotCtx.rotate(rad);
  rotCtx.drawImage(image, -image.width / 2, -image.height / 2);

  const out = document.createElement("canvas");
  out.width = area.width;
  out.height = area.height;
  const ctx = out.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponible");
  ctx.drawImage(rotCanvas, area.x, area.y, area.width, area.height, 0, 0, area.width, area.height);

  return new Promise((resolve, reject) => {
    out.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Export blob impossible"))),
      "image/jpeg",
      0.92,
    );
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
