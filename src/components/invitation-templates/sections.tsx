import { useEffect, useState, useCallback } from "react";
import { MapPin, Phone, Mail, User, Shirt, Sparkles, Car, BedDouble, LifeBuoy, Gift, X, ChevronLeft, ChevronRight } from "lucide-react";
import type { Ceremony, Couple } from "@/lib/wedding-store";

function ImageLightbox({
  images,
  index,
  onClose,
  onChange,
}: {
  images: string[];
  index: number;
  onClose: () => void;
  onChange: (i: number) => void;
}) {
  const prev = useCallback(
    () => onChange((index - 1 + images.length) % images.length),
    [index, images.length, onChange],
  );
  const next = useCallback(
    () => onChange((index + 1) % images.length),
    [index, images.length, onChange],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, prev, next]);

  const multiple = images.length > 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 animate-fade-in"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Fermer"
        className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-10 flex size-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
      >
        <X className="size-5" />
      </button>

      {multiple && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            aria-label="Précédente"
            className="absolute left-3 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="Suivante"
            className="absolute right-3 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
          >
            <ChevronRight className="size-5" />
          </button>
        </>
      )}

      <img
        src={images[index]}
        alt=""
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] max-w-[94vw] select-none object-contain"
      />

      {multiple && (
        <div className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-white/80 backdrop-blur">
          {index + 1} / {images.length}
        </div>
      )}
    </div>
  );
}


// ---------- Countdown (D / H / M / S) ----------

function computeDelta(target: number) {
  const diff = Math.max(0, target - Date.now());
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return { days, hours, minutes, seconds };
}

export interface CountdownTone {
  cellBg: string;
  cellBorder: string;
  numberClass: string;
  labelClass: string;
  separatorClass: string;
}

const defaultTone: CountdownTone = {
  cellBg: "bg-white/60",
  cellBorder: "border border-black/10",
  numberClass: "text-3xl font-serif tracking-tight",
  labelClass: "font-mono text-[9px] uppercase tracking-[0.25em] opacity-60",
  separatorClass: "opacity-30",
};

export type CountdownUnit = "days" | "hours" | "minutes" | "seconds";

const UNIT_LABELS: Record<CountdownUnit, string> = {
  days: "jours",
  hours: "heures",
  minutes: "min",
  seconds: "sec",
};

const DEFAULT_UNITS: CountdownUnit[] = ["days", "hours", "minutes", "seconds"];

export type CountdownStyle = NonNullable<Couple["countdownStyle"]>;

// Full-tone overrides applied when the user picks a color scheme.
// null means "keep the template-provided tone".
function colorPresetTone(preset: CountdownStyle["color"]): CountdownTone | null {
  switch (preset) {
    case "ivoire":
      return {
        cellBg: "bg-white",
        cellBorder: "border border-black/10",
        numberClass: "text-3xl font-serif tracking-tight text-[#1a1a1a]",
        labelClass: "font-mono text-[9px] uppercase tracking-[0.25em] text-black/50",
        separatorClass: "opacity-30",
      };
    case "noir":
      return {
        cellBg: "bg-[#0d0d0d]",
        cellBorder: "border border-white/10",
        numberClass: "text-3xl font-serif tracking-tight text-white",
        labelClass: "font-mono text-[9px] uppercase tracking-[0.25em] text-white/50",
        separatorClass: "opacity-30",
      };
    default:
      return null;
  }
}


const SIZE_CLASSES: Record<NonNullable<CountdownStyle["size"]>, { number: string; label: string; pad: string }> = {
  sm: { number: "text-xl", label: "text-[8px]", pad: "px-2 py-2.5" },
  md: { number: "text-3xl", label: "text-[9px]", pad: "px-2 py-4" },
  lg: { number: "text-5xl", label: "text-[10px]", pad: "px-2 py-5" },
};

const FONT_CLASSES: Record<NonNullable<CountdownStyle["font"]>, string> = {
  serif: "font-serif italic",
  sans: "font-sans font-medium tracking-tight",
  mono: "font-mono tracking-tight",
};

function tickAnimationClass(animation?: CountdownStyle["animation"]): string {
  if (animation === "pulse") return "animate-scale-in";
  if (animation === "flip") return "animate-fade-in";
  return "";
}

export function Countdown({
  targetDate,
  units,
  tone = defaultTone,
  style,
  accent,
}: {
  targetDate: string;
  units?: CountdownUnit[];
  tone?: Partial<CountdownTone>;
  style?: CountdownStyle;
  accent?: string;
}) {
  void accent;
  const preset = colorPresetTone(style?.color);
  const t = preset ? { ...defaultTone, ...preset } : { ...defaultTone, ...tone };

  const size = SIZE_CLASSES[style?.size ?? "md"];
  const fontClass = style?.font ? FONT_CLASSES[style.font] : "";
  const anim = tickAnimationClass(style?.animation);

  const targetMs = targetDate ? new Date(targetDate + "T00:00:00").getTime() : 0;
  const [delta, setDelta] = useState(() => computeDelta(targetMs));
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!targetMs) return;
    const id = window.setInterval(() => {
      setDelta(computeDelta(targetMs));
      setNow(Date.now());
    }, 1000);
    return () => window.clearInterval(id);
  }, [targetMs]);

  if (!targetDate) return null;
  // Auto-hide when the wedding date is past.
  if (targetMs && now >= targetMs) return null;

  const activeUnits = (units && units.length > 0 ? units : DEFAULT_UNITS).filter(
    (u): u is CountdownUnit => u in UNIT_LABELS,
  );
  if (activeUnits.length === 0) return null;

  const valueMap: Record<CountdownUnit, number> = {
    days: delta.days,
    hours: delta.hours,
    minutes: delta.minutes,
    seconds: delta.seconds,
  };

  const gridColsClass =
    activeUnits.length === 1
      ? "grid-cols-1"
      : activeUnits.length === 2
        ? "grid-cols-2"
        : activeUnits.length === 3
          ? "grid-cols-3"
          : "grid-cols-4";

  // Replace font family classes in the template-provided numberClass when a
  // font override is chosen, to avoid two competing font utilities.
  const numberClass = fontClass
    ? `${t.numberClass.replace(/font-(serif|sans|mono)/g, "").replace(/italic/g, "")} ${fontClass}`
    : t.numberClass;

  return (
    <section aria-label="Compte à rebours" className={`grid ${gridColsClass} gap-2 sm:gap-3`}>
      {activeUnits.map((u, i) => {
        const v = valueMap[u];
        return (
          <div
            key={u}
            className={`${t.cellBg} ${t.cellBorder} rounded-2xl ${size.pad} text-center`}
          >
            <p
              key={anim ? v : undefined}
              className={`${numberClass.replace(/text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)/g, "")} ${size.number} ${anim}`}
            >
              {String(v).padStart(2, "0")}
            </p>
            <p className={`${t.labelClass.replace(/text-\[\d+px\]/g, "")} ${size.label}`}>
              {UNIT_LABELS[u]}
            </p>
            {i < activeUnits.length - 1 ? (
              <span className={`sr-only ${t.separatorClass}`}>:</span>
            ) : null}
          </div>
        );
      })}
    </section>
  );
}



// ---------- Section wrapper ----------

export function SectionTitle({
  eyebrow,
  title,
  accent,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  className?: string;
}) {
  return (
    <div className={`text-center ${className}`}>
      {eyebrow ? (
        <p
          className="font-mono text-[10px] uppercase tracking-[0.4em]"
          style={{ color: accent }}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-2 font-serif text-2xl italic">{title}</h2>
    </div>
  );
}

// ---------- Locations / Map ----------

export function LocationsSection({
  ceremonies,
  accent,
}: {
  ceremonies: Ceremony[];
  accent?: string;
}) {
  const withVenue = ceremonies.filter((c) => c.venue);
  if (withVenue.length === 0) return null;

  return (
    <section className="mt-14">
      <SectionTitle eyebrow="Se rendre" title="Lieux & itinéraires" accent={accent} />
      <ul className="mt-6 space-y-3">
        {withVenue.map((c) => {
          const mapsUrl =
            c.mapsUrl ??
            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.venue)}`;
          return (
            <li
              key={c.id}
              className="flex items-start gap-3 rounded-2xl border border-current/10 bg-white/5 p-4"
            >
              <span
                className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: (accent ?? "#999") + "22", color: accent }}
              >
                <MapPin className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-serif text-base italic">{c.label}</p>
                <p className="mt-0.5 text-sm opacity-80">{c.venue}</p>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block font-mono text-[10px] uppercase tracking-[0.25em] underline underline-offset-4"
                  style={{ color: accent }}
                >
                  Ouvrir dans Maps →
                </a>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// ---------- Contact ----------

export function ContactSection({
  couple,
  accent,
}: {
  couple: Couple;
  accent?: string;
}) {
  const { contactName, contactPhone, contactEmail } = couple;
  if (!contactName && !contactPhone && !contactEmail) return null;

  return (
    <section className="mt-14">
      <SectionTitle eyebrow="Besoin d'aide ?" title="Pour plus d'informations" accent={accent} />
      <div className="mt-6 rounded-2xl border border-current/10 bg-white/5 p-5 text-center">
        {contactName ? (
          <p className="flex items-center justify-center gap-2 font-serif text-lg italic">
            <User className="size-4 opacity-60" />
            {contactName}
          </p>
        ) : null}
        <div className="mt-3 flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-4">
          {contactPhone ? (
            <a
              href={`tel:${contactPhone.replace(/\s+/g, "")}`}
              className="inline-flex items-center gap-2 text-sm underline underline-offset-4"
              style={{ color: accent }}
            >
              <Phone className="size-4" />
              {contactPhone}
            </a>
          ) : null}
          {contactEmail ? (
            <a
              href={`mailto:${contactEmail}`}
              className="inline-flex items-center gap-2 text-sm underline underline-offset-4"
              style={{ color: accent }}
            >
              <Mail className="size-4" />
              {contactEmail}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}

// ---------- Dress code ----------

export function DressCodeSection({
  note,
  colors,
  accent,
}: {
  note?: string;
  colors?: string[];
  accent?: string;
}) {
  const swatches = (colors ?? []).filter((c) => c && c.trim().length > 0).slice(0, 3);
  if (!note && swatches.length === 0) return null;
  return (
    <section className="mt-14">
      <SectionTitle eyebrow="Tenue" title="Dress code" accent={accent} />
      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-current/10 bg-white/5 p-5">
        <Shirt className="mt-0.5 size-5 shrink-0" style={{ color: accent }} />
        <div className="min-w-0 flex-1 space-y-3">
          {note ? (
            <p className="text-sm italic leading-relaxed opacity-90">{note}</p>
          ) : null}
          {swatches.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {swatches.map((c, i) => (
                <span
                  key={`${c}-${i}`}
                  className="inline-flex items-center gap-2 rounded-full border border-current/15 bg-white/5 px-2.5 py-1"
                >
                  <span
                    className="size-4 rounded-full ring-1 ring-current/20"
                    style={{ backgroundColor: c }}
                    aria-hidden
                  />
                  <span className="font-mono text-[10px] uppercase tracking-widest opacity-70">
                    {c}
                  </span>
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

// ---------- Custom info ----------

export function CustomInfoSection({
  title,
  body,
  accent,
}: {
  title?: string;
  body?: string;
  accent?: string;
}) {
  if (!body) return null;
  return (
    <section className="mt-14">
      <SectionTitle
        eyebrow="À noter"
        title={title || "Information"}
        accent={accent}
      />
      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-current/10 bg-white/5 p-5">
        <Sparkles className="mt-0.5 size-5 shrink-0" style={{ color: accent }} />
        <p className="whitespace-pre-line text-sm leading-relaxed opacity-90">{body}</p>
      </div>
    </section>
  );
}

// ---------- Practical info (opt-in) ----------

export function PracticalInfoSection({
  couple,
  accent,
}: {
  couple: Couple;
  accent?: string;
}) {
  if (!couple.practicalInfoEnabled) return null;
  const parking = couple.practicalParking?.trim();
  const accommodation = couple.practicalAccommodation?.trim();
  const contactName = couple.practicalContactName?.trim();
  const contactPhone = couple.practicalContactPhone?.trim();
  const hasContact = !!(contactName || contactPhone);
  if (!parking && !accommodation && !hasContact) return null;

  return (
    <section className="mt-14">
      <SectionTitle eyebrow="Bon à savoir" title="Infos pratiques" accent={accent} />
      <ul className="mt-6 space-y-3">
        {parking ? (
          <li className="flex items-start gap-3 rounded-2xl border border-current/10 bg-white/5 p-4">
            <span
              className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: (accent ?? "#999") + "22", color: accent }}
            >
              <Car className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-60">
                Parking
              </p>
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed opacity-90">
                {parking}
              </p>
            </div>
          </li>
        ) : null}
        {accommodation ? (
          <li className="flex items-start gap-3 rounded-2xl border border-current/10 bg-white/5 p-4">
            <span
              className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: (accent ?? "#999") + "22", color: accent }}
            >
              <BedDouble className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-60">
                Hébergement
              </p>
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed opacity-90">
                {accommodation}
              </p>
            </div>
          </li>
        ) : null}
        {hasContact ? (
          <li className="flex items-start gap-3 rounded-2xl border border-current/10 bg-white/5 p-4">
            <span
              className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: (accent ?? "#999") + "22", color: accent }}
            >
              <LifeBuoy className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-60">
                Contact référent
              </p>
              {contactName ? (
                <p className="mt-1 font-serif text-base italic">{contactName}</p>
              ) : null}
              {contactPhone ? (
                <a
                  href={`tel:${contactPhone.replace(/\s+/g, "")}`}
                  className="mt-1 inline-flex items-center gap-2 text-sm underline underline-offset-4"
                  style={{ color: accent }}
                >
                  <Phone className="size-4" />
                  {contactPhone}
                </a>
              ) : null}
            </div>
          </li>
        ) : null}
      </ul>
    </section>
  );
}

// ---------- Combined bottom block ----------

export function RegistrySection({
  couple,
  accent,
}: {
  couple: Couple;
  accent?: string;
}) {
  if (!couple.registryEnabled) return null;
  const stores = (couple.registryStores ?? []).filter(
    (s) => s && s.name && s.name.trim().length > 0,
  );
  const note = couple.registryNote?.trim();
  if (stores.length === 0 && !note) return null;
  const title = couple.registryTitle?.trim() || "Liste de mariage";

  return (
    <section className="mt-14">
      <SectionTitle eyebrow="Vos cadeaux" title={title} accent={accent} />
      <div className="mt-6 rounded-2xl border border-current/10 bg-white/5 p-5">
        <div className="flex items-start gap-3">
          <span
            className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: (accent ?? "#999") + "22", color: accent }}
          >
            <Gift className="size-4" />
          </span>
          <div className="min-w-0 flex-1 space-y-3">
            {note ? (
              <p className="whitespace-pre-line text-sm italic leading-relaxed opacity-90">
                {note}
              </p>
            ) : null}
            {stores.length > 0 ? (
              <ul className="space-y-2">
                {stores.map((s, i) => {
                  const url = s.url?.trim();
                  return (
                    <li
                      key={i}
                      className="flex items-center justify-between gap-3 rounded-xl border border-current/10 bg-white/5 px-3 py-2"
                    >
                      <span className="min-w-0 flex-1 truncate font-serif text-base italic">
                        {s.name}
                      </span>
                      {url ? (
                        <a
                          href={/^https?:\/\//i.test(url) ? url : `https://${url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 font-mono text-[10px] uppercase tracking-[0.25em] underline underline-offset-4"
                          style={{ color: accent }}
                        >
                          Visiter →
                        </a>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export function TemplateBottomSections({
  couple,
  ceremonies,
  accent,
}: {
  couple: Couple;
  ceremonies: Ceremony[];
  accent?: string;
}) {
  return (
    <>
      <LocationsSection ceremonies={ceremonies} accent={accent} />
      <RegistrySection couple={couple} accent={accent} />
      <PracticalInfoSection couple={couple} accent={accent} />
      <ContactSection couple={couple} accent={accent} />
      <DressCodeSection note={couple.dressCodeNote} colors={couple.dressCodeColors} accent={accent} />
      <CustomInfoSection
        title={couple.customInfoTitle}
        body={couple.customInfoBody}
        accent={accent}
      />
    </>
  );
}

export function OurStorySection({
  couple,
  accent,
}: {
  couple: Couple;
  accent?: string;
}) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  if (couple.storyEnabled === false) return null;
  const title = couple.storyTitle?.trim() || "Notre Histoire";
  const body = couple.storyBody?.trim();
  const images = (couple.storyImages ?? []).filter((u) => u && u.trim().length > 0);
  if (!body && images.length === 0) return null;

  const style = couple.storyStyle ?? {};
  const font = style.font ?? "serif";
  const size = style.size ?? "md";
  const align = style.align ?? "center";

  const bodyFontClass = {
    serif: "font-serif italic",
    sans: "font-sans",
    script: "font-serif italic tracking-wide",
    mono: "font-mono uppercase tracking-[0.2em]",
    display: "font-serif tracking-tight",
  }[font];
  const bodySizeClass = {
    sm: "text-[13px]",
    md: "text-[15px]",
    lg: "text-lg sm:text-xl",
  }[size];
  const alignClass = align === "left" ? "text-left" : "text-center";
  const dividerAlign = align === "left" ? "ml-0" : "mx-auto";

  return (
    <section className="mt-14">
      <div className={"mb-6 " + alignClass}>
        <span
          className={"mb-3 block h-px w-10 " + dividerAlign}
          style={{ backgroundColor: (accent ?? "#999") + "80" }}
        />
        <h2 className="font-serif text-2xl italic">{title}</h2>
      </div>

      {images.length > 0 && (
        <div
          className={
            "mb-6 grid gap-3 " +
            (images.length === 1
              ? "grid-cols-1"
              : images.length === 2
                ? "grid-cols-2"
                : "grid-cols-2 sm:grid-cols-3")
          }
        >
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setLightbox(i)}
              aria-label={`Agrandir l'image ${i + 1}`}
              className="group relative overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5 transition active:scale-[0.98]"
            >
              <img
                src={src}
                alt=""
                loading="lazy"
                className={
                  "w-full object-cover transition group-hover:brightness-95 " +
                  (images.length === 1 ? "aspect-[4/3]" : "aspect-square")
                }
              />
            </button>
          ))}
        </div>
      )}

      {body && (
        <p
          className={
            "whitespace-pre-line text-pretty leading-relaxed opacity-80 " +
            bodyFontClass +
            " " +
            bodySizeClass +
            " " +
            alignClass
          }
        >
          {body}
        </p>
      )}

      {lightbox !== null && (
        <ImageLightbox
          images={images}
          index={lightbox}
          onClose={() => setLightbox(null)}
          onChange={setLightbox}
        />
      )}
    </section>
  );
}

export type GalleryLayout = "grid" | "masonry" | "mosaic" | "polaroid" | "frames";

export function GallerySection({
  couple,
  accent,
  layout = "grid",
}: {
  couple: Couple;
  accent?: string;
  layout?: GalleryLayout;
}) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  if (!couple.galleryEnabled) return null;
  const images = (couple.galleryImages ?? []).filter((u) => u && u.trim().length > 0);
  if (images.length === 0) return null;
  const title = couple.galleryTitle?.trim() || "Galerie";

  const open = (i: number) => setLightbox(i);
  const accentSoft = (accent ?? "#999") + "80";

  return (
    <section className="mt-14">
      <div className="mb-6 text-center">
        <span
          className="mx-auto mb-3 block h-px w-10"
          style={{ backgroundColor: accentSoft }}
        />
        <h2 className="font-serif text-2xl italic">{title}</h2>
      </div>

      {layout === "masonry" ? (
        <MasonryLayout images={images} onOpen={open} />
      ) : layout === "mosaic" ? (
        <MosaicLayout images={images} onOpen={open} accent={accent} />
      ) : layout === "polaroid" ? (
        <PolaroidLayout images={images} onOpen={open} accent={accent} />
      ) : layout === "frames" ? (
        <FramesLayout images={images} onOpen={open} accent={accent} />
      ) : (
        <GridLayout images={images} onOpen={open} />
      )}

      {lightbox !== null && (
        <ImageLightbox
          images={images}
          index={lightbox}
          onClose={() => setLightbox(null)}
          onChange={setLightbox}
        />
      )}
    </section>
  );
}

function galleryButton(extra = "") {
  return (
    "group relative block w-full overflow-hidden transition active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-current/40 " +
    extra
  );
}

function GridLayout({
  images,
  onOpen,
}: {
  images: string[];
  onOpen: (i: number) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {images.map((src, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onOpen(i)}
          aria-label={`Agrandir l'image ${i + 1}`}
          className={galleryButton("rounded-xl shadow-sm ring-1 ring-black/5")}
        >
          <img
            src={src}
            alt=""
            loading="lazy"
            className="aspect-square w-full object-cover transition group-hover:brightness-95"
          />
        </button>
      ))}
    </div>
  );
}

function MasonryLayout({
  images,
  onOpen,
}: {
  images: string[];
  onOpen: (i: number) => void;
}) {
  // Varied heights via a repeating pattern for a natural, hand-composed feel.
  const spans = ["aspect-[3/4]", "aspect-square", "aspect-[4/5]", "aspect-[3/5]"];
  return (
    <div className="columns-2 gap-2 sm:columns-3 [column-fill:_balance]">
      {images.map((src, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onOpen(i)}
          aria-label={`Agrandir l'image ${i + 1}`}
          className={galleryButton(
            "mb-2 break-inside-avoid rounded-2xl shadow-sm ring-1 ring-black/5",
          )}
        >
          <img
            src={src}
            alt=""
            loading="lazy"
            className={
              "w-full object-cover transition group-hover:brightness-95 " +
              spans[i % spans.length]
            }
          />
        </button>
      ))}
    </div>
  );
}

function MosaicLayout({
  images,
  onOpen,
  accent,
}: {
  images: string[];
  onOpen: (i: number) => void;
  accent?: string;
}) {
  const [hero, ...rest] = images;
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => onOpen(0)}
        aria-label="Agrandir l'image 1"
        className={galleryButton(
          "rounded-2xl shadow-md ring-1 ring-black/10",
        )}
        style={{ boxShadow: `0 10px 30px -18px ${(accent ?? "#000") + "55"}` }}
      >
        <img
          src={hero}
          alt=""
          loading="lazy"
          className="aspect-[16/10] w-full object-cover transition group-hover:brightness-95"
        />
      </button>
      {rest.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {rest.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onOpen(i + 1)}
              aria-label={`Agrandir l'image ${i + 2}`}
              className={galleryButton("rounded-xl shadow-sm ring-1 ring-black/5")}
            >
              <img
                src={src}
                alt=""
                loading="lazy"
                className="aspect-square w-full object-cover transition group-hover:brightness-95"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PolaroidLayout({
  images,
  onOpen,
  accent,
}: {
  images: string[];
  onOpen: (i: number) => void;
  accent?: string;
}) {
  // Slight alternating tilt for a scrapbook / polaroid vibe. Kept modest to
  // stay inside the mobile viewport width and never overflow.
  const tilts = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2"];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {images.map((src, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onOpen(i)}
          aria-label={`Agrandir l'image ${i + 1}`}
          className={galleryButton(
            "origin-center rounded-sm bg-white p-2 pb-6 shadow-md transition hover:rotate-0 " +
              tilts[i % tilts.length],
          )}
          style={{ boxShadow: `0 10px 24px -14px ${(accent ?? "#000") + "66"}` }}
        >
          <img
            src={src}
            alt=""
            loading="lazy"
            className="aspect-square w-full object-cover"
          />
        </button>
      ))}
    </div>
  );
}

function FramesLayout({
  images,
  onOpen,
  accent,
}: {
  images: string[];
  onOpen: (i: number) => void;
  accent?: string;
}) {
  // Ornate double-frame effect using accent color rings.
  const frameStyle = {
    boxShadow: `0 0 0 2px ${accent ?? "#c9a84c"}, 0 0 0 4px rgba(255,255,255,0.7), 0 0 0 6px ${(accent ?? "#c9a84c") + "88"}`,
  } as const;
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {images.map((src, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onOpen(i)}
          aria-label={`Agrandir l'image ${i + 1}`}
          className={galleryButton("rounded-sm")}
          style={frameStyle}
        >
          <img
            src={src}
            alt=""
            loading="lazy"
            className="aspect-[4/5] w-full object-cover transition group-hover:brightness-95"
          />
        </button>
      ))}
    </div>
  );
}




