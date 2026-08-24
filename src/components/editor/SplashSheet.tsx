import { useEffect, useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { supabase } from "@/integrations/supabase/client";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Camera, Eye, ImageIcon, Loader2, Trash2 } from "lucide-react";
import { ensureAuthOrMessage, friendlyUploadError } from "@/lib/upload-errors";
import { HexEditor } from "./HexEditor";
import { InvitationSplash } from "@/components/public/InvitationSplash";
import type { Couple } from "@/lib/wedding-store";
import type { ResolvedTheme } from "@/lib/wedding-theme";

const SIGNED_URL_EXPIRY = 60 * 60 * 24 * 365 * 10;

const KICKER_SUGGESTIONS = [
  "Vous êtes invité(e)",
  "Save the date",
  "Nous nous marions",
  "Avec joie, nous vous convions",
];

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  weddingId: string | null;
  couple: Couple;
  theme: ResolvedTheme;
  onPatch: (patch: Partial<Couple>) => void;
}

function safeUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
}

export function SplashSheet({ open, onOpenChange, weddingId, couple, theme, onPatch }: Props) {
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingColor, setEditingColor] = useState(false);
  const [preview, setPreview] = useState(false);

  const enabled = couple.splashEnabled !== false;
  const bgMode = couple.splashBgMode ?? "theme";
  const bgColor = couple.splashBgColor ?? "#1f3a5f";
  const showDate = couple.splashShowDate !== false;

  const [kicker, setKicker] = useState(couple.splashKicker ?? "");
  const [tapLabel, setTapLabel] = useState(couple.splashTapLabel ?? "");

  useEffect(() => {
    if (open) {
      setKicker(couple.splashKicker ?? "");
      setTapLabel(couple.splashTapLabel ?? "");
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleFile = async (file: File) => {
    if (!weddingId) {
      setError("Terminez d'abord votre profil pour ajouter une image.");
      return;
    }
    setError(null);
    const authMsg = await ensureAuthOrMessage();
    if (authMsg) {
      setError(authMsg);
      return;
    }
    const nameLower = file.name.toLowerCase();
    if (
      /image\/hei[cf]/i.test(file.type) ||
      nameLower.endsWith(".heic") ||
      nameLower.endsWith(".heif")
    ) {
      setError(
        "Ce format (HEIC) n'est pas lisible par votre navigateur. Choisissez « JPEG » dans les réglages de votre appareil photo.",
      );
      return;
    }
    setUploading(true);
    try {
      let payload: Blob = file;
      try {
        payload = await imageCompression(file, {
          maxSizeMB: 1.2,
          maxWidthOrHeight: 1800,
          useWebWorker: true,
          fileType: "image/jpeg",
        });
      } catch (compErr) {
        console.warn("[splash] compression failed, uploading original", compErr);
      }
      const path = `${weddingId}/splash/${safeUuid()}.jpg`;
      const { error: upErr } = await supabase.storage
        .from("wedding-photos")
        .upload(path, payload, { contentType: "image/jpeg", upsert: false });
      if (upErr) throw upErr;
      const { data: signed, error: sErr } = await supabase.storage
        .from("wedding-photos")
        .createSignedUrl(path, SIGNED_URL_EXPIRY);
      if (sErr || !signed?.signedUrl) throw sErr ?? new Error("URL introuvable");
      onPatch({ splashBgImageUrl: signed.signedUrl, splashBgMode: "image" });
    } catch (err) {
      console.error("[splash upload]", err);
      setError(friendlyUploadError(err));
    } finally {
      setUploading(false);
      if (galleryInputRef.current) galleryInputRef.current.value = "";
      if (cameraInputRef.current) cameraInputRef.current.value = "";
    }
  };

  return (
    <>
      <BottomSheet open={open} onOpenChange={onOpenChange} title="Page d'ouverture">
        <div className="space-y-5">
          <p className="text-[12px] opacity-70">
            L'écran affiché avant votre invitation. Vos invités tapent pour l'ouvrir.
          </p>

          <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3">
            <div>
              <p className="text-sm font-medium">Afficher la page d'ouverture</p>
              <p className="text-[11px] opacity-60">Sinon, l'invitation s'affiche directement.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              onClick={() => onPatch({ splashEnabled: !enabled })}
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

          <div className={"space-y-5 transition-opacity " + (!enabled ? "pointer-events-none opacity-40" : "")}>
            {/* Background mode */}
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
                Arrière-plan
              </p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { id: "theme", label: "Thème" },
                  { id: "color", label: "Couleur" },
                  { id: "image", label: "Image" },
                ] as const).map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => onPatch({ splashBgMode: o.id })}
                    className={
                      "rounded-xl border px-3 py-2 text-[12px] transition " +
                      (bgMode === o.id
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-background hover:border-foreground/40")
                    }
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {bgMode === "color" && (
              <div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingColor((v) => !v)}
                    className="size-10 rounded-full shadow-sm ring-1 ring-black/10 transition active:scale-95"
                    style={{ backgroundColor: bgColor }}
                    aria-label="Choisir la couleur de fond"
                  />
                  <span className="font-mono text-[12px] uppercase opacity-70">{bgColor}</span>
                </div>
                {editingColor && (
                  <HexEditor
                    value={bgColor}
                    onChange={(v) => onPatch({ splashBgColor: v })}
                    onClose={() => setEditingColor(false)}
                  />
                )}
              </div>
            )}

            {bgMode === "image" && (
              <div className="space-y-3">
                {couple.splashBgImageUrl ? (
                  <div className="relative overflow-hidden rounded-xl border border-border">
                    <img
                      src={couple.splashBgImageUrl}
                      alt="Fond de la page d'ouverture"
                      className="h-44 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => onPatch({ splashBgImageUrl: null })}
                      className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-background/90 shadow"
                      aria-label="Retirer l'image"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ) : (
                  <p className="text-[12px] opacity-60">
                    Ajoutez une photo verticale : elle remplira tout l'écran d'ouverture.
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => galleryInputRef.current?.click()}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-[12px] disabled:opacity-50"
                  >
                    {uploading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <ImageIcon className="size-4" />
                    )}
                    Galerie
                  </button>
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-[12px] disabled:opacity-50"
                  >
                    <Camera className="size-4" />
                    Photo
                  </button>
                </div>
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </div>
            )}

            {/* Texts */}
            <div>
              <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
                Petite phrase
              </label>
              <input
                type="text"
                value={kicker}
                maxLength={40}
                placeholder="Vous êtes invité(e)"
                onChange={(e) => {
                  setKicker(e.target.value);
                  onPatch({ splashKicker: e.target.value });
                }}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {KICKER_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setKicker(s);
                      onPatch({ splashKicker: s });
                    }}
                    className="rounded-full border border-border bg-muted px-3 py-1.5 text-[11px] transition hover:bg-foreground hover:text-background"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
                Texte du bouton d'ouverture
              </label>
              <input
                type="text"
                value={tapLabel}
                maxLength={30}
                placeholder="Tapez pour ouvrir"
                onChange={(e) => {
                  setTapLabel(e.target.value);
                  onPatch({ splashTapLabel: e.target.value });
                }}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3">
              <div>
                <p className="text-sm font-medium">Afficher la date et la ville</p>
                <p className="text-[11px] opacity-60">Sous vos prénoms.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={showDate}
                onClick={() => onPatch({ splashShowDate: !showDate })}
                className={
                  "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors " +
                  (showDate ? "bg-primary" : "bg-muted")
                }
              >
                <span
                  className={
                    "inline-block size-5 rounded-full bg-background shadow transition-transform " +
                    (showDate ? "translate-x-5" : "translate-x-0.5")
                  }
                />
              </button>
            </label>

            <button
              type="button"
              onClick={() => setPreview(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-[12px] text-background"
            >
              <Eye className="size-4" />
              Voir l'aperçu
            </button>
          </div>

          {error && (
            <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-[12px]">
              {error}
            </p>
          )}
        </div>
      </BottomSheet>

      {preview && (
        <>
          <InvitationSplash
            brideName={couple.brideName}
            groomName={couple.groomName}
            weddingDate={couple.weddingDate}
            city={couple.city}
            theme={theme}
            bgMode={bgMode}
            bgColor={couple.splashBgColor}
            bgImageUrl={couple.splashBgImageUrl}
            kicker={couple.splashKicker}
            tapLabel={couple.splashTapLabel}
            showDate={showDate}
            onDone={() => setPreview(false)}
          />
          <button
            type="button"
            onClick={() => setPreview(false)}
            aria-label="Fermer l'aperçu"
            className="fixed right-4 top-4 z-[10000] grid size-10 place-items-center rounded-full bg-black/60 text-white backdrop-blur-sm transition active:scale-95"
          >
            <X className="size-5" />
          </button>
        </>
      )}
    </>
  );
}
