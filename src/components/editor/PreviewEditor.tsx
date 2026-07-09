import { useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { useWedding, type Couple } from "@/lib/wedding-store";
import { useAutosaveContext } from "@/lib/autosave-context";
import { SaveIndicator } from "./SaveIndicator";
import { HeroPhotoSheet } from "./HeroPhotoSheet";
import { PhotoGridSheet } from "./PhotoGridSheet";
import { ThemeSheet } from "./ThemeSheet";
import {
  OpeningEffect,
  OPENING_EFFECT_LABELS,
  OPENING_EFFECT_SLUGS,
  type OpeningEffectSlug,
} from "@/components/opening-effects";
import {
  Lock,
  Type,
  Users,
  Calendar,
  X,
  ImageIcon,
  Timer,
  Info,
  BookHeart,
  Images,
  Gift,
  Palette,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

type CountdownUnit = "days" | "hours" | "minutes" | "seconds";
type Sheet =
  | null
  | "caption"
  | "names"
  | "date"
  | "hero"
  | "countdown"
  | "practical"
  | "registry"
  | "story"
  | "gallery"
  | "theme"
  | "opening";

const CAPTION_SUGGESTIONS = [
  "Ils se disent oui",
  "Save the date",
  "Nous nous marions",
  "Together forever",
];

interface EditorProps {
  mode: "preview" | "edit";
  /** Kept for API compatibility; the toggle now lives in the sticky action bar. */
  onToggle?: () => void;
}

export function PreviewEditor({ mode }: EditorProps) {
  const { couple, updateCouple, weddingId } = useWedding();
  const [sheet, setSheet] = useState<Sheet>(null);
  const { status, schedule } = useAutosaveContext();

  // Local drafts (updated live in UI, persisted debounced)
  const [caption, setCaption] = useState(couple.caption ?? "");
  const [bride, setBride] = useState(couple.brideName);
  const [groom, setGroom] = useState(couple.groomName);
  const [date, setDate] = useState(couple.weddingDate);
  const [city, setCity] = useState(couple.city);
  // Practical info drafts
  const [practicalParking, setPracticalParking] = useState(couple.practicalParking ?? "");
  const [practicalAccommodation, setPracticalAccommodation] = useState(
    couple.practicalAccommodation ?? "",
  );
  const [practicalContactName, setPracticalContactName] = useState(
    couple.practicalContactName ?? "",
  );
  const [practicalContactPhone, setPracticalContactPhone] = useState(
    couple.practicalContactPhone ?? "",
  );
  const [dressCodeNote, setDressCodeNote] = useState(couple.dressCodeNote ?? "");
  const initialColors = [
    couple.dressCodeColors?.[0] ?? "",
    couple.dressCodeColors?.[1] ?? "",
    couple.dressCodeColors?.[2] ?? "",
  ];
  const [dressColors, setDressColors] = useState<string[]>(initialColors);
  const setDressColor = (i: number, v: string) => {
    const next = [...dressColors];
    next[i] = v;
    setDressColors(next);
    const cleaned = next.map((c) => c.trim()).filter((c) => c.length > 0);
    persist({ dressCodeColors: cleaned });
  };

  // Registry (liste de mariage) drafts
  const registryEnabled = couple.registryEnabled ?? false;
  const [registryTitle, setRegistryTitle] = useState(couple.registryTitle ?? "");
  const [registryNote, setRegistryNote] = useState(couple.registryNote ?? "");
  const [registryStores, setRegistryStores] = useState<Array<{ name: string; url?: string }>>(
    couple.registryStores ?? [],
  );
  const updateStore = (i: number, patch: Partial<{ name: string; url: string }>) => {
    const next = registryStores.map((s, idx) => (idx === i ? { ...s, ...patch } : s));
    setRegistryStores(next);
    const cleaned = next
      .map((s) => ({ name: (s.name ?? "").trim(), url: (s.url ?? "").trim() }))
      .filter((s) => s.name.length > 0);
    persist({ registryStores: cleaned });
  };
  const addStore = () => {
    if (registryStores.length >= 6) return;
    const next = [...registryStores, { name: "", url: "" }];
    setRegistryStores(next);
  };
  const removeStore = (i: number) => {
    const next = registryStores.filter((_, idx) => idx !== i);
    setRegistryStores(next);
    const cleaned = next
      .map((s) => ({ name: (s.name ?? "").trim(), url: (s.url ?? "").trim() }))
      .filter((s) => s.name.length > 0);
    persist({ registryStores: cleaned });
  };
  const registryStoreCount = registryStores.filter((s) => (s.name ?? "").trim().length > 0).length;
  const practicalEnabled = couple.practicalInfoEnabled ?? false;
  const practicalFilledCount = [
    practicalParking,
    practicalAccommodation,
    practicalContactName || practicalContactPhone,
    dressCodeNote || dressColors.some((c) => c.trim().length > 0) ? "x" : "",
  ].filter((v) => v && v.trim().length > 0).length;
  const countdownEnabled = couple.countdownEnabled ?? true;
  const countdownUnits: CountdownUnit[] =
    couple.countdownUnits && couple.countdownUnits.length > 0
      ? couple.countdownUnits
      : ["days", "hours", "minutes", "seconds"];
  const countdownStyle = couple.countdownStyle ?? {};
  const styleColor = countdownStyle.color ?? "auto";
  const styleSize = countdownStyle.size ?? "md";
  const styleFont = countdownStyle.font ?? "serif";
  const styleAnimation = countdownStyle.animation ?? "none";

  const updateCountdownStyle = (
    patch: Partial<NonNullable<typeof couple.countdownStyle>>,
  ) => {
    persist({ countdownStyle: { ...countdownStyle, ...patch } });
  };

  // Detect if the wedding date is in the past (for auto-hide messaging)
  const weddingPast = (() => {
    if (!couple.weddingDate) return false;
    const ms = new Date(couple.weddingDate + "T00:00:00").getTime();
    return Number.isFinite(ms) && ms > 0 && Date.now() >= ms;
  })();

  const toggleUnit = (u: CountdownUnit) => {
    const next = countdownUnits.includes(u)
      ? countdownUnits.filter((x) => x !== u)
      : [...countdownUnits, u];
    // Keep canonical order
    const order: CountdownUnit[] = ["days", "hours", "minutes", "seconds"];
    const ordered = order.filter((o) => next.includes(o));
    persist({ countdownUnits: ordered });
  };

  const persist = (patch: Parameters<typeof updateCouple>[0]) => {
    schedule(async () => {
      await updateCouple(patch);
    });
  };

  return (
    <>



      {/* Bottom edit bar (edit mode only) */}
      {mode === "edit" && (
        <div className="fixed inset-x-0 bottom-4 z-30 mx-auto flex max-w-xl justify-center px-4">
          <div className="flex w-full items-center gap-2 overflow-x-auto rounded-2xl border border-background/20 bg-foreground/95 p-2 shadow-lg backdrop-blur">
            <EditChip
              icon={<Palette className="size-4" />}
              label="Thème & couleurs"
              value={themeChipValue(couple)}
              onClick={() => setSheet("theme")}
            />
            <EditChip
              icon={<ImageIcon className="size-4" />}
              label="Photo couverture"
              value={couple.heroImageUrl ? "Photo choisie" : "Ajouter"}
              onClick={() => setSheet("hero")}
            />
            <EditChip
              icon={<Type className="size-4" />}
              label="Petit texte"
              value={caption || "Ils se disent oui"}
              onClick={() => setSheet("caption")}
            />
            {!couple.isLocked && (
              <EditChip
                icon={<Users className="size-4" />}
                label="Prénoms"
                value={`${bride} & ${groom}`}
                onClick={() => setSheet("names")}
              />
            )}
            <EditChip
              icon={<Calendar className="size-4" />}
              label="Date & lieu"
              value={`${date || "—"} · ${city}`}
              onClick={() => setSheet("date")}
            />
            <EditChip
              icon={<Timer className="size-4" />}
              label="Compte à rebours"
              value={
                weddingPast
                  ? "Masqué (date passée)"
                  : !countdownEnabled
                    ? "Désactivé"
                    : countdownUnits
                        .map((u) => ({ days: "J", hours: "H", minutes: "M", seconds: "S" })[u])
                        .join(" · ")
              }
              onClick={() => setSheet("countdown")}
            />
            <EditChip
              icon={<BookHeart className="size-4" />}
              label="Notre histoire"
              value={
                couple.storyEnabled === false
                  ? "Désactivé"
                  : (couple.storyImages?.length ?? 0) === 0 && !couple.storyBody
                    ? "À compléter"
                    : `${couple.storyImages?.length ?? 0} photo${(couple.storyImages?.length ?? 0) > 1 ? "s" : ""}`
              }
              onClick={() => setSheet("story")}
            />
            <EditChip
              icon={<Images className="size-4" />}
              label="Galerie"
              value={
                !(couple.galleryEnabled ?? false)
                  ? "Désactivée"
                  : (couple.galleryImages?.length ?? 0) === 0
                    ? "À compléter"
                    : `${couple.galleryImages?.length ?? 0} photo${(couple.galleryImages?.length ?? 0) > 1 ? "s" : ""}`
              }
              onClick={() => setSheet("gallery")}
            />
            <EditChip
              icon={<Gift className="size-4" />}
              label="Liste de mariage"
              value={
                !registryEnabled
                  ? "Désactivée"
                  : registryStoreCount === 0
                    ? "À compléter"
                    : `${registryStoreCount} magasin${registryStoreCount > 1 ? "s" : ""}`
              }
              onClick={() => setSheet("registry")}
            />
            <EditChip
              icon={<Info className="size-4" />}
              label="Infos pratiques"
              value={
                !practicalEnabled
                  ? "Désactivé"
                  : practicalFilledCount === 0
                    ? "À compléter"
                    : `${practicalFilledCount} info${practicalFilledCount > 1 ? "s" : ""}`
              }
              onClick={() => setSheet("practical")}
            />

          </div>
        </div>
      )}

      <SaveIndicator status={status} />

      {/* Caption sheet */}
      <BottomSheet
        open={sheet === "caption"}
        onOpenChange={(o) => !o && setSheet(null)}
        title="Petit texte au-dessus des prénoms"
      >
        <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
          Texte affiché
        </label>
        <input
          type="text"
          value={caption}
          maxLength={40}
          placeholder="Ils se disent oui"
          onChange={(e) => {
            setCaption(e.target.value);
            persist({ caption: e.target.value });
          }}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/40"
        />
        <p className="mt-1 text-right text-[10px] opacity-40">{caption.length}/40</p>

        <p className="mt-6 mb-2 font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
          Suggestions
        </p>
        <div className="flex flex-wrap gap-2">
          {CAPTION_SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setCaption(s);
                persist({ caption: s });
              }}
              className="rounded-full border border-border bg-muted px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition hover:bg-foreground hover:text-background"
            >
              {s}
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* Names sheet */}
      <BottomSheet
        open={sheet === "names"}
        onOpenChange={(o) => !o && setSheet(null)}
        title="Vos prénoms"
      >
        {couple.isLocked ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
            <Lock className="mb-2 size-4" />
            Les prénoms ne peuvent plus être modifiés après publication.
          </div>
        ) : (
          <div className="space-y-4">
            <Field
              label="Prénom 1"
              value={bride}
              onChange={(v) => {
                setBride(v);
                persist({ brideName: v });
              }}
            />
            <Field
              label="Prénom 2"
              value={groom}
              onChange={(v) => {
                setGroom(v);
                persist({ groomName: v });
              }}
            />
          </div>
        )}
      </BottomSheet>

      {/* Date & lieu sheet */}
      <BottomSheet
        open={sheet === "date"}
        onOpenChange={(o) => !o && setSheet(null)}
        title="Date et lieu"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
              Date du mariage
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                persist({ weddingDate: e.target.value });
              }}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <Field
            label="Ville"
            value={city}
            onChange={(v) => {
              setCity(v);
              persist({ city: v });
            }}
          />
        </div>
      </BottomSheet>

      {/* Countdown sheet */}
      <BottomSheet
        open={sheet === "countdown"}
        onOpenChange={(o) => !o && setSheet(null)}
        title="Compte à rebours"
      >
        {weddingPast ? (
          <div className="rounded-xl border border-muted bg-muted/40 p-4 text-sm">
            <Timer className="mb-2 size-4" />
            La date du mariage est passée. Le compte à rebours est
            automatiquement masqué sur votre page.
          </div>
        ) : (
          <div className="space-y-5">
            {/* Toggle */}
            <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3">
              <div>
                <p className="text-sm font-medium">Afficher le compte à rebours</p>
                <p className="text-[11px] opacity-60">
                  Il s'affiche au-dessus de votre message d'accueil.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={countdownEnabled}
                onClick={() => persist({ countdownEnabled: !countdownEnabled })}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
                  countdownEnabled ? "bg-primary" : "bg-muted",
                )}
              >
                <span
                  className={cn(
                    "inline-block size-5 rounded-full bg-background shadow transition-transform",
                    countdownEnabled ? "translate-x-5" : "translate-x-0.5",
                  )}
                />
              </button>
            </label>

            {/* Units */}
            <div
              className={cn(
                "space-y-2 transition-opacity",
                !countdownEnabled && "pointer-events-none opacity-40",
              )}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
                Unités affichées
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { u: "days", label: "Jours" },
                    { u: "hours", label: "Heures" },
                    { u: "minutes", label: "Minutes" },
                    { u: "seconds", label: "Secondes" },
                  ] as { u: CountdownUnit; label: string }[]
                ).map(({ u, label }) => {
                  const active = countdownUnits.includes(u);
                  const isLast = active && countdownUnits.length === 1;
                  return (
                    <button
                      key={u}
                      type="button"
                      disabled={isLast}
                      onClick={() => toggleUnit(u)}
                      className={cn(
                        "flex items-center justify-between rounded-xl border px-3 py-3 text-left text-sm transition",
                        active
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-background",
                        isLast && "cursor-not-allowed opacity-70",
                      )}
                    >
                      <span>{label}</span>
                      <span
                        className={cn(
                          "grid size-5 place-items-center rounded-full border text-[10px]",
                          active
                            ? "border-background/30 bg-background/10"
                            : "border-border",
                        )}
                      >
                        {active ? "✓" : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
              {countdownUnits.length === 1 && (
                <p className="text-[11px] opacity-60">
                  Au moins une unité doit rester affichée.
                </p>
              )}
            </div>

            {/* Style controls */}
            <div
              className={cn(
                "space-y-4 rounded-xl border border-border p-3 transition-opacity",
                !countdownEnabled && "pointer-events-none opacity-40",
              )}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
                Style
              </p>

              <StyleRow label="Couleur">
                {(
                  [
                    { v: "auto", label: "Auto" },
                    { v: "ivoire", label: "Ivoire" },
                    { v: "noir", label: "Noir" },
                  ] as const
                ).map((o) => (
                  <StylePill
                    key={o.v}
                    active={styleColor === o.v}
                    onClick={() => updateCountdownStyle({ color: o.v })}
                  >
                    {o.label}
                  </StylePill>
                ))}
              </StyleRow>

              <StyleRow label="Taille">
                {(
                  [
                    { v: "sm", label: "S" },
                    { v: "md", label: "M" },
                    { v: "lg", label: "L" },
                  ] as const
                ).map((o) => (
                  <StylePill
                    key={o.v}
                    active={styleSize === o.v}
                    onClick={() => updateCountdownStyle({ size: o.v })}
                  >
                    {o.label}
                  </StylePill>
                ))}
              </StyleRow>

              <StyleRow label="Typographie">
                {(
                  [
                    { v: "serif", label: "Serif", cls: "font-serif italic" },
                    { v: "sans", label: "Sans", cls: "font-sans" },
                    { v: "mono", label: "Mono", cls: "font-mono" },
                  ] as const
                ).map((o) => (
                  <StylePill
                    key={o.v}
                    active={styleFont === o.v}
                    onClick={() => updateCountdownStyle({ font: o.v })}
                    className={o.cls}
                  >
                    {o.label}
                  </StylePill>
                ))}
              </StyleRow>

              <StyleRow label="Animation">
                {(
                  [
                    { v: "none", label: "Aucune" },
                    { v: "pulse", label: "Pulse" },
                    { v: "flip", label: "Flip" },
                  ] as const
                ).map((o) => (
                  <StylePill
                    key={o.v}
                    active={styleAnimation === o.v}
                    onClick={() => updateCountdownStyle({ animation: o.v })}
                  >
                    {o.label}
                  </StylePill>
                ))}
              </StyleRow>
            </div>

            <p className="text-[11px] opacity-60">
              Le compte à rebours disparaîtra automatiquement le jour du mariage.
            </p>
          </div>
        )}
      </BottomSheet>

      {/* Practical info sheet */}
      <BottomSheet
        open={sheet === "practical"}
        onOpenChange={(o) => !o && setSheet(null)}
        title="Infos pratiques"
      >
        <div className="space-y-5">
          <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3">
            <div>
              <p className="text-sm font-medium">Afficher cette section</p>
              <p className="text-[11px] opacity-60">
                Parking, hébergement et contact référent apparaissent en bas de votre page.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={practicalEnabled}
              onClick={() => persist({ practicalInfoEnabled: !practicalEnabled })}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
                practicalEnabled ? "bg-primary" : "bg-muted",
              )}
            >
              <span
                className={cn(
                  "inline-block size-5 rounded-full bg-background shadow transition-transform",
                  practicalEnabled ? "translate-x-5" : "translate-x-0.5",
                )}
              />
            </button>
          </label>

          <div
            className={cn(
              "space-y-4 transition-opacity",
              !practicalEnabled && "pointer-events-none opacity-40",
            )}
          >
            <div className="rounded-xl border border-dashed border-border p-3">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
                Dress code
              </p>
              <textarea
                value={dressCodeNote}
                rows={2}
                maxLength={200}
                placeholder="Ex : élégance Riviera — accents dorés et terracotta bienvenus."
                onChange={(e) => {
                  setDressCodeNote(e.target.value);
                  persist({ dressCodeNote: e.target.value });
                }}
                className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
              <p className="mt-3 mb-2 font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
                Couleurs (2 à 3)
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-lg border border-border bg-background px-2 py-1.5"
                  >
                    <input
                      type="color"
                      value={dressColors[i] || "#c9a96b"}
                      onChange={(e) => setDressColor(i, e.target.value)}
                      className="size-7 shrink-0 cursor-pointer rounded-md border border-border bg-transparent"
                      aria-label={`Couleur ${i + 1}`}
                    />
                    <input
                      type="text"
                      value={dressColors[i]}
                      placeholder={i < 2 ? "#c9a96b" : "opt."}
                      onChange={(e) => setDressColor(i, e.target.value)}
                      className="min-w-0 flex-1 bg-transparent font-mono text-[11px] uppercase tracking-wider outline-none"
                    />
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[10px] opacity-60">
                Laissez la 3ᵉ vide pour n'afficher que 2 couleurs.
              </p>
            </div>

            <div>
              <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
                Parking
              </label>
              <textarea
                value={practicalParking}
                rows={2}
                maxLength={280}
                placeholder="Ex : parking gratuit à côté de l'hôtel, voiturier disponible dès 18h."
                onChange={(e) => {
                  setPracticalParking(e.target.value);
                  persist({ practicalParking: e.target.value });
                }}
                className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
                Hébergement
              </label>
              <textarea
                value={practicalAccommodation}
                rows={2}
                maxLength={280}
                placeholder="Ex : hôtel partenaire à 5 min, tarif préférentiel avec le code MARIAGE2027."
                onChange={(e) => {
                  setPracticalAccommodation(e.target.value);
                  persist({ practicalAccommodation: e.target.value });
                }}
                className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div className="rounded-xl border border-dashed border-border p-3">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
                Contact référent
              </p>
              <div className="space-y-3">
                <Field
                  label="Nom"
                  value={practicalContactName}
                  onChange={(v) => {
                    setPracticalContactName(v);
                    persist({ practicalContactName: v });
                  }}
                />
                <Field
                  label="Téléphone"
                  value={practicalContactPhone}
                  onChange={(v) => {
                    setPracticalContactPhone(v);
                    persist({ practicalContactPhone: v });
                  }}
                />
              </div>
            </div>

            <p className="text-[11px] opacity-60">
              Les champs vides ne s'affichent pas sur la page.
            </p>
          </div>
        </div>
      </BottomSheet>

      {/* Registry sheet */}
      <BottomSheet
        open={sheet === "registry"}
        onOpenChange={(o) => !o && setSheet(null)}
        title="Liste de mariage"
      >
        <div className="space-y-5">
          <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3">
            <div>
              <p className="text-sm font-medium">Afficher cette section</p>
              <p className="text-[11px] opacity-60">
                Indiquez le ou les magasins où vos invités peuvent consulter votre liste.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={registryEnabled}
              onClick={() => persist({ registryEnabled: !registryEnabled })}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
                registryEnabled ? "bg-primary" : "bg-muted",
              )}
            >
              <span
                className={cn(
                  "inline-block size-5 rounded-full bg-background shadow transition-transform",
                  registryEnabled ? "translate-x-5" : "translate-x-0.5",
                )}
              />
            </button>
          </label>

          <div
            className={cn(
              "space-y-4 transition-opacity",
              !registryEnabled && "pointer-events-none opacity-40",
            )}
          >
            <Field
              label="Titre du bloc"
              value={registryTitle}
              onChange={(v) => {
                setRegistryTitle(v);
                persist({ registryTitle: v });
              }}
            />

            <div>
              <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
                Message (facultatif)
              </label>
              <textarea
                value={registryNote}
                rows={2}
                maxLength={280}
                placeholder="Ex : votre présence est notre plus beau cadeau. Pour ceux qui souhaitent, notre liste est disponible chez :"
                onChange={(e) => {
                  setRegistryNote(e.target.value);
                  persist({ registryNote: e.target.value });
                }}
                className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div className="space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
                Magasins
              </p>
              {registryStores.length === 0 ? (
                <p className="text-[11px] opacity-60">
                  Ajoutez un premier magasin ci-dessous.
                </p>
              ) : (
                registryStores.map((s, i) => (
                  <div
                    key={i}
                    className="space-y-2 rounded-xl border border-dashed border-border p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
                        Magasin {i + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeStore(i)}
                        className="rounded-full p-1 text-xs opacity-60 transition hover:bg-muted hover:opacity-100"
                        aria-label="Supprimer ce magasin"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={s.name ?? ""}
                      placeholder="Nom (ex : Galeries Lafayette)"
                      maxLength={80}
                      onChange={(e) => updateStore(i, { name: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                    />
                    <input
                      type="url"
                      value={s.url ?? ""}
                      placeholder="Lien (facultatif) — https://…"
                      maxLength={300}
                      onChange={(e) => updateStore(i, { url: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 font-mono text-[12px] outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                ))
              )}

              <button
                type="button"
                onClick={addStore}
                disabled={registryStores.length >= 6}
                className={cn(
                  "w-full rounded-xl border border-dashed border-border bg-background px-4 py-3 text-sm transition",
                  registryStores.length >= 6
                    ? "cursor-not-allowed opacity-50"
                    : "hover:border-foreground/40 hover:bg-muted",
                )}
              >
                + Ajouter un magasin
              </button>
              <p className="text-[11px] opacity-60">
                Jusqu'à 6 magasins. Les entrées sans nom ne sont pas affichées.
              </p>
            </div>
          </div>
        </div>
      </BottomSheet>



      <PhotoGridSheet
        open={sheet === "story"}
        onOpenChange={(o) => !o && setSheet(null)}
        title="Notre histoire"
        intro="Racontez votre rencontre en quelques mots et ajoutez vos plus belles photos."
        weddingId={weddingId}
        folder="story"
        enabled={couple.storyEnabled ?? true}
        onEnabledChange={(v) => persist({ storyEnabled: v })}
        titleField={{
          label: "Titre du bloc",
          value: couple.storyTitle ?? "",
          placeholder: "Notre Histoire",
          onChange: (v) => persist({ storyTitle: v }),
        }}
        bodyField={{
          label: "Texte",
          value: couple.storyBody ?? "",
          placeholder: "Notre première rencontre, notre demande…",
          onChange: (v) => persist({ storyBody: v }),
        }}
        images={couple.storyImages ?? []}
        onImagesChange={(next) => persist({ storyImages: next })}
        maxImages={8}
        extraControls={
          <StoryStyleControls
            style={couple.storyStyle ?? {}}
            onChange={(patch) =>
              persist({ storyStyle: { ...(couple.storyStyle ?? {}), ...patch } })
            }
          />
        }
      />


      <PhotoGridSheet
        open={sheet === "gallery"}
        onOpenChange={(o) => !o && setSheet(null)}
        title="Galerie photos"
        intro="Une grille de photos affichée après le RSVP."
        weddingId={weddingId}
        folder="gallery"
        enabled={couple.galleryEnabled ?? false}
        onEnabledChange={(v) => persist({ galleryEnabled: v })}
        titleField={{
          label: "Titre du bloc",
          value: couple.galleryTitle ?? "",
          placeholder: "Galerie",
          onChange: (v) => persist({ galleryTitle: v }),
        }}
        images={couple.galleryImages ?? []}
        onImagesChange={(next) => persist({ galleryImages: next })}
        maxImages={20}
      />

      <HeroPhotoSheet
        open={sheet === "hero"}
        onOpenChange={(o) => !o && setSheet(null)}
        weddingId={weddingId}
        currentUrl={couple.heroImageUrl}
        onUploaded={(url) => updateCouple({ heroImageUrl: url })}
        onRemove={() => updateCouple({ heroImageUrl: "" })}
      />

      <ThemeSheet
        open={sheet === "theme"}
        onOpenChange={(o) => !o && setSheet(null)}
        couple={couple}
        onPatch={(patch) => persist(patch)}
      />
    </>
  );
}

function themeChipValue(couple: Couple): string {
  const theme = couple.theme ?? "rose-elegance";
  const themeName = ({
    "rose-elegance": "Rose Élégance",
    "ivoire-epure": "Ivoire Épuré",
    "wax-dore": "Wax Doré",
    "vert-sauge": "Vert Sauge",
    "bleu-nuit": "Bleu Nuit",
    "or-antique": "Or Antique",
  } as Record<string, string>)[theme] ?? "Personnalisé";
  const custom = couple.accentColor || couple.backgroundBase ? " ●" : "";
  return `${themeName}${custom}`;
}

type StoryStyle = NonNullable<Couple["storyStyle"]>;

function StoryStyleControls({
  style,
  onChange,
}: {
  style: StoryStyle;
  onChange: (patch: Partial<StoryStyle>) => void;
}) {
  const font = style.font ?? "serif";
  const size = style.size ?? "md";
  const align = style.align ?? "center";

  return (
    <div className="space-y-3 rounded-xl border border-border p-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
        Style du texte
      </p>

      <StyleRow label="Police">
        {(
          [
            { v: "serif", label: "Serif", cls: "font-serif italic" },
            { v: "display", label: "Display", cls: "font-serif tracking-tight" },
            { v: "sans", label: "Sans", cls: "font-sans" },
            { v: "mono", label: "Mono", cls: "font-mono uppercase tracking-widest text-[10px]" },
            { v: "script", label: "Script", cls: "font-serif italic tracking-wide" },
          ] as const
        ).map((o) => (
          <StylePill
            key={o.v}
            active={font === o.v}
            onClick={() => onChange({ font: o.v })}
            className={o.cls}
          >
            {o.label}
          </StylePill>
        ))}
      </StyleRow>

      <StyleRow label="Taille">
        {(
          [
            { v: "sm", label: "S" },
            { v: "md", label: "M" },
            { v: "lg", label: "L" },
          ] as const
        ).map((o) => (
          <StylePill
            key={o.v}
            active={size === o.v}
            onClick={() => onChange({ size: o.v })}
          >
            {o.label}
          </StylePill>
        ))}
      </StyleRow>

      <StyleRow label="Alignement">
        {(
          [
            { v: "center", label: "Centré" },
            { v: "left", label: "Gauche" },
          ] as const
        ).map((o) => (
          <StylePill
            key={o.v}
            active={align === o.v}
            onClick={() => onChange({ align: o.v })}
          >
            {o.label}
          </StylePill>
        ))}
      </StyleRow>
    </div>
  );
}



function EditChip({
  icon,
  label,
  value,
  onClick,
  locked,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onClick: () => void;
  locked?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-w-[9rem] shrink-0 flex-col items-start gap-0.5 rounded-xl border border-dashed border-background/20 bg-foreground px-3 py-2 text-left text-background transition active:scale-[0.97]"
    >
      <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] opacity-60">
        {icon}
        {label}
        {locked && <Lock className="size-3" />}
      </span>
      <span className="line-clamp-1 w-full text-xs">{value}</span>
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
      />
    </div>
  );
}

function StyleRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
        {label}
      </span>
      <div className="flex flex-wrap items-center justify-end gap-1.5">{children}</div>
    </div>
  );
}

function StylePill({
  active,
  onClick,
  className,
  children,
}: {
  active: boolean;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs transition",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-background hover:border-foreground/40",
        className,
      )}
    >
      {children}
    </button>
  );
}
