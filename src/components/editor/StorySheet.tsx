import { useEffect, useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { supabase } from "@/integrations/supabase/client";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Loader2, Plus, Trash2, ImageIcon, ChevronUp, ChevronDown } from "lucide-react";
import { ensureAuthOrMessage, friendlyUploadError } from "@/lib/upload-errors";
import type { Couple } from "@/lib/wedding-store";
import {
  STORY_LAYOUTS,
  STORY_PHOTO_SHAPES,
  type StoryLayout,
  type StoryPhotoShape,
  type StoryStep,
} from "@/components/public/StoryTimeline";

const SIGNED_URL_EXPIRY = 60 * 60 * 24 * 365 * 10;

function safeUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

interface StorySheetProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  weddingId: string | null;
  couple: Couple;
  persist: (patch: Partial<Couple>) => void;
}

export function StorySheet({
  open,
  onOpenChange,
  weddingId,
  couple,
  persist,
}: StorySheetProps) {
  const { updateCouple } = useWedding();
  const enabled = couple.storyEnabled ?? true;
  const steps = couple.storySteps ?? [];
  const layout: StoryLayout = couple.storyLayout ?? "left";
  const shape: StoryPhotoShape = couple.storyPhotoShape ?? "rounded";

  const [titleDraft, setTitleDraft] = useState(couple.storyTitle ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const targetStep = useRef<string | null>(null);
  // Always mirror the freshest steps so rapid keystrokes never write stale arrays.
  const stepsRef = useRef<StoryStep[]>(steps);
  stepsRef.current = steps;

  useEffect(() => {
    if (open) setTitleDraft(couple.storyTitle ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Steps live in their own table: update local state immediately (not debounced).
  const setSteps = (next: StoryStep[]) => {
    stepsRef.current = next;
    void updateCouple({ storySteps: next });
  };

  const addStep = async () => {
    if (!weddingId) {
      setError("Terminez d'abord votre profil pour ajouter une étape.");
      return;
    }
    setError(null);
    const { data, error: err } = await supabase
      .from("wedding_story_steps")
      .insert({
        wedding_id: weddingId,
        title: "",
        sort_order: steps.length,
      } as never)
      .select("id")
      .single();
    if (err || !data) {
      setError("Impossible d'ajouter l'étape.");
      return;
    }
    setSteps([
      ...stepsRef.current,
      { id: (data as { id: string }).id, year: "", title: "", text: "", photoUrl: null },
    ]);
  };

  const updateStep = (id: string, patch: Partial<StoryStep>) => {
    setSteps(stepsRef.current.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    const row: Record<string, unknown> = {};
    if (patch.year !== undefined) row.year = patch.year || null;
    if (patch.title !== undefined) row.title = patch.title ?? "";
    if (patch.text !== undefined) row.text = patch.text || null;
    if (patch.photoUrl !== undefined) row.photo_url = patch.photoUrl || null;
    if (Object.keys(row).length === 0) return;
    void (async () => {
      const { error: err } = await supabase
        .from("wedding_story_steps")
        .update(row as never)
        .eq("id", id);
      if (err) setError("Enregistrement de l'étape impossible. Vérifiez votre connexion.");
      else setError(null);
    })();
  };

  const deleteStep = async (id: string) => {
    setSteps(stepsRef.current.filter((s) => s.id !== id));
    await supabase.from("wedding_story_steps").delete().eq("id", id);
  };

  const moveStep = async (index: number, dir: -1 | 1) => {
    const next = [...stepsRef.current];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setSteps(next);
    await Promise.all(
      next.map((s, i) =>
        supabase.from("wedding_story_steps").update({ sort_order: i } as never).eq("id", s.id),
      ),
    );
  };

  const pickPhoto = (stepId: string) => {
    targetStep.current = stepId;
    fileRef.current?.click();
  };

  const handleFile = async (file: File) => {
    const stepId = targetStep.current;
    if (!stepId || !weddingId) return;
    setError(null);
    const authMsg = await ensureAuthOrMessage();
    if (authMsg) {
      setError(authMsg);
      return;
    }
    setBusyId(stepId);
    try {
      let payload: Blob = file;
      try {
        payload = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1400,
          useWebWorker: true,
          fileType: "image/jpeg",
        });
      } catch {
        /* upload original */
      }
      const path = `${weddingId}/story-steps/${safeUuid()}.jpg`;
      const { error: upErr } = await supabase.storage
        .from("wedding-photos")
        .upload(path, payload, { contentType: "image/jpeg", upsert: false });
      if (upErr) throw upErr;
      const { data: signed, error: sErr } = await supabase.storage
        .from("wedding-photos")
        .createSignedUrl(path, SIGNED_URL_EXPIRY);
      if (sErr || !signed?.signedUrl) throw sErr ?? new Error("URL introuvable");
      updateStep(stepId, { photoUrl: signed.signedUrl });
    } catch (err) {
      setError(friendlyUploadError(err));
    } finally {
      setBusyId(null);
      targetStep.current = null;
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="Notre histoire">
      <div className="space-y-5">
        <p className="text-[12px] opacity-70">
          Racontez votre histoire étape par étape : une année, un titre, quelques mots et une
          photo.
        </p>

        <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3">
          <div>
            <p className="text-sm font-medium">Afficher ce bloc</p>
            <p className="text-[11px] opacity-60">Visible par vos invités sur votre page.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => persist({ storyEnabled: !enabled })}
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
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium opacity-70">Titre du bloc</label>
            <input
              value={titleDraft}
              placeholder="Notre Histoire"
              onChange={(e) => {
                setTitleDraft(e.target.value);
                persist({ storyTitle: e.target.value });
              }}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-base"
            />
          </div>

          <div className="space-y-2">
            <p className="text-[12px] font-medium opacity-70">Disposition</p>
            <div className="grid grid-cols-3 gap-2">
              {STORY_LAYOUTS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => persist({ storyLayout: l.id })}
                  className={
                    "rounded-xl border p-2 text-left transition " +
                    (layout === l.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background")
                  }
                >
                  <LayoutIcon id={l.id} />
                  <p className="mt-1.5 text-[11px] font-medium leading-tight">{l.label}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[12px] font-medium opacity-70">Forme des photos</p>
            <div className="grid grid-cols-3 gap-2">
              {STORY_PHOTO_SHAPES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => persist({ storyPhotoShape: s.id })}
                  className={
                    "flex flex-col items-center gap-1.5 rounded-xl border p-2.5 transition " +
                    (shape === s.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background")
                  }
                >
                  <span
                    className="block bg-foreground/25"
                    style={
                      s.id === "rounded"
                        ? { width: 18, height: 24, borderRadius: 999 }
                        : s.id === "circle"
                          ? { width: 22, height: 22, borderRadius: "50%" }
                          : { width: 22, height: 22, borderRadius: 3 }
                    }
                  />
                  <span className="text-[11px] font-medium">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-medium opacity-70">Étapes ({steps.length})</p>
              <button
                type="button"
                onClick={addStep}
                className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground"
              >
                <Plus className="size-3.5" /> Ajouter
              </button>
            </div>

            {steps.length === 0 && (
              <p className="rounded-xl border border-dashed border-border p-4 text-center text-[12px] opacity-60">
                Aucune étape pour l'instant.
              </p>
            )}

            {steps.map((step, i) => (
              <div key={step.id} className="space-y-2 rounded-xl border border-border bg-muted/30 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium opacity-60">Étape {i + 1}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label="Monter"
                      onClick={() => moveStep(i, -1)}
                      disabled={i === 0}
                      className="rounded-md p-1 disabled:opacity-30"
                    >
                      <ChevronUp className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Descendre"
                      onClick={() => moveStep(i, 1)}
                      disabled={i === steps.length - 1}
                      className="rounded-md p-1 disabled:opacity-30"
                    >
                      <ChevronDown className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Supprimer"
                      onClick={() => deleteStep(step.id)}
                      className="rounded-md p-1 text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => pickPhoto(step.id)}
                    className="relative flex size-[76px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-background"
                  >
                    {busyId === step.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : step.photoUrl ? (
                      <img src={step.photoUrl} alt="" className="size-full object-cover" />
                    ) : (
                      <ImageIcon className="size-5 opacity-50" />
                    )}
                  </button>

                  <div className="flex-1 space-y-2">
                    <input
                      defaultValue={step.year ?? ""}
                      placeholder="Année (ex : 2018)"
                      onChange={(e) => updateStep(step.id, { year: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-base"
                    />
                    <input
                      defaultValue={step.title ?? ""}
                      placeholder="Titre *"
                      onChange={(e) => updateStep(step.id, { title: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-base"
                    />
                  </div>
                </div>

                <textarea
                  defaultValue={step.text ?? ""}
                  placeholder="Description (optionnel)"
                  rows={2}
                  onChange={(e) => updateStep(step.id, { text: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-base"
                />

                {step.photoUrl && (
                  <button
                    type="button"
                    onClick={() => updateStep(step.id, { photoUrl: null })}
                    className="text-[11px] text-destructive"
                  >
                    Retirer la photo
                  </button>
                )}
              </div>
            ))}
          </div>

          {error && <p className="text-[12px] text-destructive">{error}</p>}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
          }}
        />
      </div>
    </BottomSheet>
  );
}

function LayoutIcon({ id }: { id: StoryLayout }) {
  if (id === "center") {
    return (
      <span className="flex h-8 w-full items-center justify-center gap-1">
        <span className="h-1.5 w-4 rounded-full bg-foreground/25" />
        <span className="h-6 w-px bg-foreground/40" />
        <span className="h-1.5 w-4 rounded-full bg-foreground/15" />
      </span>
    );
  }
  if (id === "cards") {
    return (
      <span className="flex h-8 w-full flex-col justify-center gap-1">
        <span className="h-2.5 w-full rounded bg-foreground/20" />
        <span className="h-2.5 w-full rounded bg-foreground/20" />
      </span>
    );
  }
  return (
    <span className="flex h-8 w-full items-center gap-1.5">
      <span className="h-6 w-px bg-foreground/40" />
      <span className="flex flex-1 flex-col gap-1">
        <span className="h-1.5 w-full rounded-full bg-foreground/25" />
        <span className="h-1.5 w-3/4 rounded-full bg-foreground/15" />
      </span>
    </span>
  );
}
