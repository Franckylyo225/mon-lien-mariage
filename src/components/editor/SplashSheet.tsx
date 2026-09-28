import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import imageCompression from "browser-image-compression";
import { supabase } from "@/integrations/supabase/client";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Camera, Check, Eye, ImageIcon, Info, Loader2, RotateCcw, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ensureAuthOrMessage, friendlyUploadError } from "@/lib/upload-errors";
import { HexEditor } from "./HexEditor";
import { OpeningPage } from "@/components/public/opening/OpeningPage";
import {
  OPENING_EFFECTS,
  OPENING_MODELS,
  modelFieldsLabel,
  modelSupports,
  openingModelMeta,
  type OpeningEffect,
  type OpeningField,
  type OpeningModel,
} from "@/components/public/opening/types";
import {
  openingPatch,
  resolveOpening,
  type OpeningChange,
} from "@/components/public/opening/config";
import type { Couple } from "@/lib/wedding-store";
import type { ResolvedTheme } from "@/lib/wedding-theme";
import { OpeningModelThumbnail, previewPhotoFor } from "./OpeningModelThumbnail";

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
  const [previewModel, setPreviewModel] = useState<OpeningModel | null>(null);
  const [previewEffect, setPreviewEffect] = useState<OpeningEffect | null>(null);
  const [previewKey, setPreviewKey] = useState(0);
  const openPreview = (nextModel: OpeningModel = model, nextEffect: OpeningEffect = effect) => {
    setPreviewKey((k) => k + 1);
    setPreviewModel(nextModel);
    setPreviewEffect(nextEffect);
    setPreview(true);
  };
  // Never leave a stale preview overlay mounted when the sheet closes.
  useEffect(() => {
    if (!open) setPreview(false);
  }, [open]);

  const [editingModelColor, setEditingModelColor] = useState(false);
  const opening = resolveOpening(couple);
  const model = opening.model;
  const effect = opening.effect;
  const modelMeta = openingModelMeta(model);
  const has = (field: OpeningField) => modelSupports(modelMeta, field);
  const modelColor = opening.color || theme.accent;
  /** Every write goes through the shared patch builder (no stray side effects). */
  const patchOpening = (change: OpeningChange) => onPatch(openingPatch(couple, change));

  const enabled = opening.enabled;
  const bgMode = opening.bgMode;
  const bgColor = opening.bgColor ?? "#1f3a5f";
  const showDate = opening.showDate;

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
      patchOpening({ photoUrl: signed.signedUrl });
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
          <p className="flex items-start gap-2 rounded-xl border border-border bg-muted/50 px-3 py-2.5 text-[11px] leading-snug opacity-80">
            <Info className="mt-px size-3.5 shrink-0" />
            <span>
              Chaque invité la voit une fois par visite : en rechargeant la page, elle ne réapparaît
              pas. Utilisez « Voir l'aperçu » pour la revoir autant de fois que vous voulez.
            </span>
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
              onClick={() => patchOpening({ enabled: !enabled })}
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
              "space-y-5 transition-opacity " + (!enabled ? "pointer-events-none opacity-40" : "")
            }
          >
            {/* Étape 1 — modèle */}
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
                Modèle
              </p>
              <div className="grid grid-cols-2 gap-3">
                {OPENING_MODELS.map((m) => {
                  const active = model === m.id;
                  return (
                    <Button
                      key={m.id}
                      type="button"
                      variant="outline"
                      onClick={() => {
                        patchOpening({ model: m.id });
                        openPreview(m.id, m.defaultEffect);
                      }}
                      aria-pressed={active}
                      aria-label={`${m.label}${active ? ", sélectionné" : ""}`}
                      className={
                        "group relative h-auto min-w-0 flex-col gap-2 whitespace-normal rounded-lg border-2 bg-background p-1.5 pb-2 shadow-none transition " +
                        (active
                          ? "border-primary ring-2 ring-primary/15"
                          : "border-border hover:border-primary/50")
                      }
                    >
                      <OpeningModelThumbnail model={m.id} couple={couple} theme={theme} />
                      {active ? (
                        <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm">
                          <Check className="size-3.5" />
                        </span>
                      ) : null}
                      <span
                        className={
                          active ? "text-xs font-semibold text-primary" : "text-xs font-medium"
                        }
                      >
                        {m.label}
                      </span>
                    </Button>
                  );
                })}
              </div>
              <p className="mt-2.5 text-[11px] leading-snug opacity-70">
                {modelMeta.description}
                <br />
                <span className="opacity-80">
                  Réglages de ce modèle : {modelFieldsLabel(modelMeta)}.
                </span>
              </p>
            </div>

            {/* Étape 2 — effet d'ouverture */}
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
                Effet d'ouverture
              </p>
              <div className="grid grid-cols-3 gap-2">
                {OPENING_EFFECTS.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => patchOpening({ effect: e.id })}
                    className={
                      "rounded-xl border px-2 py-2 text-[11px] transition " +
                      (effect === e.id
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-background hover:border-foreground/40")
                    }
                  >
                    {e.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Couleur du modèle (modèles à fond coloré) */}
            {has("color") && (
              <div>
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
                  Couleur du modèle
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingModelColor((v) => !v)}
                    className="size-10 rounded-full shadow-sm ring-1 ring-black/10 transition active:scale-95"
                    style={{ backgroundColor: modelColor }}
                    aria-label="Choisir la couleur du modèle"
                  />
                  <span className="font-mono text-[12px] uppercase opacity-70">{modelColor}</span>
                </div>
                {editingModelColor && (
                  <HexEditor
                    value={modelColor}
                    onChange={(v) => patchOpening({ color: v })}
                    onClose={() => setEditingModelColor(false)}
                  />
                )}
              </div>
            )}

            {has("quote") || has("textTone") ? (
              <div className="space-y-4">
                <div>
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
                    Lisibilité du texte
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { id: "auto", label: "Auto" },
                        { id: "light", label: "Clair" },
                        { id: "dark", label: "Foncé" },
                      ] as const
                    ).map((tone) => (
                      <button
                        key={tone.id}
                        type="button"
                        onClick={() => patchOpening({ textTone: tone.id })}
                        className={
                          "rounded-xl border px-3 py-2 text-[12px] transition " +
                          ((couple.openingPageConfig?.textTone ?? "auto") === tone.id
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-background hover:border-foreground/40")
                        }
                      >
                        {tone.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
                    Citation facultative
                  </label>
                  <textarea
                    value={couple.openingPageConfig?.quote ?? ""}
                    maxLength={140}
                    rows={3}
                    placeholder="Notre plus belle histoire commence ici…"
                    onChange={(event) => patchOpening({ quote: event.target.value })}
                    className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <p className="mt-1 text-right text-[10px] opacity-50">
                    {(couple.openingPageConfig?.quote ?? "").length}/140
                  </p>
                </div>
              </div>
            ) : null}

            {/* Background mode */}
            {has("backgroundMode") ? (
              <div>
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
                  Arrière-plan
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: "theme", label: "Thème" },
                      { id: "color", label: "Couleur" },
                      { id: "image", label: "Image" },
                    ] as const
                  ).map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => patchOpening({ bgMode: o.id })}
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
            ) : null}

            {has("backgroundMode") && bgMode === "color" && (
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
                    onChange={(v) => patchOpening({ bgColor: v })}
                    onClose={() => setEditingColor(false)}
                  />
                )}
              </div>
            )}

            {has("photo") && (!has("backgroundMode") || bgMode === "image") && (
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
                      onClick={() => patchOpening({ photoUrl: null })}
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
            {has("kicker") ? (
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
                    patchOpening({ kicker: e.target.value });
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
                        patchOpening({ kicker: s });
                      }}
                      className="rounded-full border border-border bg-muted px-3 py-1.5 text-[11px] transition hover:bg-foreground hover:text-background"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {has("tapLabel") && effect === "tap" ? (
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
                    patchOpening({ tapLabel: e.target.value });
                  }}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            ) : null}

            <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3">
              <div>
                <p className="text-sm font-medium">Afficher la date et la ville</p>
                <p className="text-[11px] opacity-60">Sous vos prénoms.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={showDate}
                onClick={() => patchOpening({ showDate: !showDate })}
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

            <Button
              type="button"
              onClick={() => openPreview()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-[12px] text-background"
            >
              <Eye className="size-4" />
              Voir l'aperçu
            </Button>
          </div>

          {error && (
            <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-[12px]">
              {error}
            </p>
          )}
        </div>
      </BottomSheet>

      {/* Rendered in a portal on <body>: inside the sheet the overlay inherits
          the dialog's pointer-events/aria-hidden lock and stops responding
          after the first open. */}
      {preview && typeof document !== "undefined"
        ? createPortal(
            <div
              key={previewKey}
              style={{ pointerEvents: "auto" }}
              className="fixed inset-0 z-[9999]"
            >
              <OpeningPage
                opening={{
                  ...opening,
                  model: previewModel ?? model,
                  effect: previewEffect ?? effect,
                  // Une photo de démonstration quand le couple n'a pas encore
                  // la sienne, pour que l'aperçu ne soit jamais vide.
                  photoUrl: previewPhotoFor(previewModel ?? model, couple),
                }}
                brideName={couple.brideName}
                groomName={couple.groomName}
                weddingDate={couple.weddingDate}
                city={couple.city}
                theme={theme}
                onDone={() => setPreview(false)}
              />
              <div className="fixed right-4 top-4 z-[10000] flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setPreviewKey((k) => k + 1)}
                  className="h-10 gap-1.5 rounded-full bg-background/85 px-4 text-[12px] text-foreground shadow-lg backdrop-blur-sm transition active:scale-95"
                >
                  <RotateCcw className="size-4" />
                  Revoir
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={() => setPreview(false)}
                  aria-label="Fermer l'aperçu"
                  className="size-10 rounded-full bg-background/85 text-foreground shadow-lg backdrop-blur-sm transition active:scale-95"
                >
                  <X className="size-5" />
                </Button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
