import { useEffect, useState } from "react";
import { MapPin, Phone, Mail, User, Shirt, Sparkles, Car, BedDouble, LifeBuoy } from "lucide-react";
import type { Ceremony, Couple } from "@/lib/wedding-store";

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
  const preset = colorPresetTone(style?.color, accent);
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
  accent,
}: {
  note?: string;
  accent?: string;
}) {
  if (!note) return null;
  return (
    <section className="mt-14">
      <SectionTitle eyebrow="Tenue" title="Dress code" accent={accent} />
      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-current/10 bg-white/5 p-5">
        <Shirt className="mt-0.5 size-5 shrink-0" style={{ color: accent }} />
        <p className="text-sm italic leading-relaxed opacity-90">{note}</p>
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
      <PracticalInfoSection couple={couple} accent={accent} />
      <ContactSection couple={couple} accent={accent} />
      <DressCodeSection note={couple.dressCodeNote} accent={accent} />
      <CustomInfoSection
        title={couple.customInfoTitle}
        body={couple.customInfoBody}
        accent={accent}
      />
    </>
  );
}
