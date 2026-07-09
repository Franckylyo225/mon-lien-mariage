import { useEffect, useState } from "react";
import { MapPin, Phone, Mail, User, Shirt, Sparkles } from "lucide-react";
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

export function Countdown({
  targetDate,
  tone = defaultTone,
}: {
  targetDate: string;
  tone?: Partial<CountdownTone>;
}) {
  const t = { ...defaultTone, ...tone };
  const targetMs = targetDate ? new Date(targetDate + "T00:00:00").getTime() : 0;
  const [delta, setDelta] = useState(() => computeDelta(targetMs));

  useEffect(() => {
    if (!targetMs) return;
    const id = window.setInterval(() => setDelta(computeDelta(targetMs)), 1000);
    return () => window.clearInterval(id);
  }, [targetMs]);

  if (!targetDate) return null;

  const cells = [
    { v: delta.days, l: "jours" },
    { v: delta.hours, l: "heures" },
    { v: delta.minutes, l: "min" },
    { v: delta.seconds, l: "sec" },
  ];

  return (
    <section aria-label="Compte à rebours" className="grid grid-cols-4 gap-2 sm:gap-3">
      {cells.map((c, i) => (
        <div
          key={c.l}
          className={`${t.cellBg} ${t.cellBorder} rounded-2xl px-2 py-4 text-center`}
        >
          <p className={t.numberClass}>{String(c.v).padStart(2, "0")}</p>
          <p className={t.labelClass}>{c.l}</p>
          {i < 3 ? <span className={`sr-only ${t.separatorClass}`}>:</span> : null}
        </div>
      ))}
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
