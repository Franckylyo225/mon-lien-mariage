import { useState } from "react";
import type { Ceremony } from "@/lib/wedding-store";
import {
  ceremonyMapsHref,
  ceremonyTimeStart,
  ceremonyVenue,
  programItemMapsHref,
} from "@/lib/wedding-store";

export type ProgramTabsVariant =
  | "terracotta"
  | "noir"
  | "gold"
  | "tropical"
  | "deco"
  | "bleu-nuit";

interface Props {
  ceremonies: Ceremony[];
  variant: ProgramTabsVariant;
  accent?: string;
}

export function CeremonyProgramTabs({ ceremonies, variant }: Props) {
  const [activeId, setActiveId] = useState(ceremonies[0]?.id);
  if (ceremonies.length === 0) return null;

  const active = ceremonies.find((ceremony) => ceremony.id === activeId) ?? ceremonies[0];
  const showTabs = ceremonies.length > 1;
  const ceremonyHref = ceremonyMapsHref(active);
  const hasProgram = Boolean(active.program?.length);

  return (
    <div className="w-full" data-program-variant={variant}>
      {showTabs ? (
        <div
          className="flex gap-5 overflow-x-auto border-b [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ borderColor: "var(--wedding-border)" }}
          role="tablist"
        >
          {ceremonies.map((ceremony) => {
            const selected = ceremony.id === active.id;
            return (
              <button
                key={ceremony.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveId(ceremony.id)}
                className="relative min-h-11 shrink-0 px-1 pb-3 pt-2 text-[10px] uppercase tracking-[0.22em] transition-opacity duration-200"
                style={{
                  color: selected ? "var(--wedding-text-primary)" : "var(--wedding-text-secondary)",
                  opacity: selected ? 1 : 0.64,
                  fontFamily: "var(--wedding-font-body)",
                }}
              >
                {ceremony.label}
                {selected ? (
                  <span className="absolute inset-x-0 bottom-0 h-0.5" style={{ background: "var(--wedding-accent)" }} aria-hidden />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="relative mt-7">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[9px] uppercase tracking-[0.28em]" style={{ color: "var(--wedding-accent)" }}>
              {active.label}
            </p>
            <h3
              className="mt-1 text-2xl leading-tight"
              style={{ color: "var(--wedding-text-primary)", fontFamily: "var(--wedding-font-heading)" }}
            >
              {active.name}
            </h3>
          </div>
          {ceremonyTimeStart(active) ? (
            <time
              className="shrink-0 border-b pb-1 text-sm font-semibold tracking-[0.12em]"
              style={{ color: "var(--wedding-accent)", borderColor: "var(--wedding-accent)" }}
            >
              {ceremonyTimeStart(active)}
            </time>
          ) : null}
        </div>

        {ceremonyVenue(active) ? (
          <div className="mt-4 flex items-start gap-2 text-sm" style={{ color: "var(--wedding-text-secondary)" }}>
            <MapPinIcon className="mt-0.5 size-4 shrink-0" />
            <span>{ceremonyVenue(active)}</span>
          </div>
        ) : null}

        {active.dressCode ? (
          <p
            className="mt-4 inline-flex border px-3 py-1.5 text-[9px] uppercase tracking-[0.2em]"
            style={{ color: "var(--wedding-accent)", borderColor: "var(--wedding-border)" }}
          >
            Tenue · {active.dressCode}
          </p>
        ) : null}

        {hasProgram ? (
          <ol className="relative mt-7 space-y-0 pl-7">
            <span
              className="absolute bottom-3 left-[7px] top-3 w-px"
              style={{ background: "var(--wedding-border)" }}
              aria-hidden
            />
            {active.program?.map((item) => {
              const href = programItemMapsHref(item);
              return (
                <li key={item.id} className="relative pb-7 last:pb-0">
                  <span
                    className="absolute -left-7 top-1 grid size-[15px] place-items-center rounded-full border"
                    style={{ borderColor: "var(--wedding-accent)", background: "var(--wedding-bg)" }}
                    aria-hidden
                  >
                    <span className="size-1 rounded-full" style={{ background: "var(--wedding-accent)" }} />
                  </span>
                  {item.time ? (
                    <time className="text-xs font-semibold tracking-[0.12em]" style={{ color: "var(--wedding-accent)" }}>
                      {item.time}
                    </time>
                  ) : null}
                  <h4
                    className="mt-0.5 text-lg leading-snug"
                    style={{ color: "var(--wedding-text-primary)", fontFamily: "var(--wedding-font-heading)" }}
                  >
                    {item.title}
                  </h4>
                  {item.description ? (
                    <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--wedding-text-secondary)" }}>
                      {item.description}
                    </p>
                  ) : null}
                  {href ? <MapsLink href={href} label={item.location?.trim() || "Itinéraire"} /> : null}
                </li>
              );
            })}
          </ol>
        ) : (
          <p
            className="mt-7 border-l-2 pl-4 text-sm italic"
            style={{ color: "var(--wedding-text-secondary)", borderColor: "var(--wedding-border)" }}
          >
            Le déroulé détaillé sera bientôt dévoilé.
          </p>
        )}

        {ceremonyHref && !active.program?.some((item) => programItemMapsHref(item)) ? (
          <MapsLink href={ceremonyHref} label="Itinéraire" />
        ) : null}
      </div>
    </div>
  );
}

function MapsLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="mt-2 inline-flex min-h-8 items-center gap-1.5 border-b text-[10px] uppercase tracking-[0.14em] transition-opacity hover:opacity-65"
      style={{ color: "var(--wedding-accent)", borderColor: "var(--wedding-border)" }}
    >
      <MapPinIcon className="size-3.5" />
      {label}
      <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
        <path d="M4 12 12 4M6 4h6v6" />
      </svg>
    </a>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
