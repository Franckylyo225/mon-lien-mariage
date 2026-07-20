import { useState } from "react";
import type { Ceremony } from "@/lib/wedding-store";

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

interface Skin {
  wrap: string;
  tabsBar: string;
  tab: (active: boolean) => string;
  card: string;
  title: string;
  time: string;
  meta: string;
  dress: string;
  divider: string;
  progTime: string;
  progTitle: string;
  progDesc: string;
}

const skins: Record<ProgramTabsVariant, Skin> = {
  terracotta: {
    wrap: "",
    tabsBar: "border-b border-[#4a2a20]/20",
    tab: (a) =>
      "shrink-0 border-b-2 px-3 pb-2 pt-1 font-mono text-[10px] uppercase tracking-widest transition " +
      (a
        ? "border-[#8f4b3a] text-[#4a2a20]"
        : "border-transparent text-[#4a2a20]/50 hover:text-[#4a2a20]"),
    card: "mt-5 rounded-2xl border border-[#4a2a20]/15 bg-white/60 p-5",
    title: "font-serif text-xl italic text-[#4a2a20]",
    time: "font-mono text-xs text-[#8f4b3a]",
    meta: "mt-1 text-sm text-[#4a2a20]/70",
    dress:
      "mt-3 inline-block rounded-full bg-[#e8c5b6] px-3 py-1 text-[10px] uppercase tracking-widest text-[#4a2a20]/80",
    divider: "mt-4 space-y-3 border-t border-dashed border-[#4a2a20]/25 pt-4",
    progTime: "w-14 shrink-0 font-mono text-[10px] uppercase tracking-wider text-[#8f4b3a]",
    progTitle: "font-serif text-sm italic text-[#4a2a20]",
    progDesc: "mt-0.5 text-[11px] text-[#4a2a20]/70",
  },
  noir: {
    wrap: "",
    tabsBar: "border-b border-[#f5f3ee]/15",
    tab: (a) =>
      "shrink-0 border-b-2 px-3 pb-2 pt-1 font-mono text-[10px] uppercase tracking-widest transition " +
      (a
        ? "border-[#f5f3ee] text-[#f5f3ee]"
        : "border-transparent text-[#f5f3ee]/40 hover:text-[#f5f3ee]/70"),
    card: "mt-5",
    title: "text-xl font-medium tracking-tight text-[#f5f3ee]",
    time: "font-mono text-xs uppercase tracking-widest text-[#f5f3ee]/60",
    meta: "mt-1 text-sm text-[#f5f3ee]/60",
    dress:
      "mt-3 font-mono text-[10px] uppercase tracking-widest text-[#f5f3ee]/50",
    divider: "mt-4 space-y-3 border-t border-[#f5f3ee]/10 pt-4",
    progTime: "w-16 shrink-0 font-mono text-[10px] uppercase tracking-widest text-[#f5f3ee]/50",
    progTitle: "text-sm text-[#f5f3ee]",
    progDesc: "mt-0.5 text-[11px] text-[#f5f3ee]/50",
  },
  gold: {
    wrap: "",
    tabsBar: "border-b border-[#c9a84c]/30",
    tab: (a) =>
      "shrink-0 border-b-2 px-3 pb-2 pt-1 font-mono text-[10px] uppercase tracking-widest transition " +
      (a
        ? "border-[#c9a84c] text-[#3a2f14]"
        : "border-transparent text-[#3a2f14]/50 hover:text-[#3a2f14]"),
    card: "mt-5 rounded-2xl border border-[#c9a84c]/30 bg-[#faf6ec] p-5",
    title: "font-serif text-xl italic text-[#3a2f14]",
    time: "font-mono text-xs text-[#c9a84c]",
    meta: "mt-1 text-sm text-[#3a2f14]/70",
    dress:
      "mt-3 font-mono text-[10px] uppercase tracking-widest text-[#3a2f14]/60",
    divider: "mt-4 space-y-3 border-t border-[#c9a84c]/30 pt-4",
    progTime: "w-14 shrink-0 font-mono text-[10px] uppercase tracking-widest text-[#c9a84c]",
    progTitle: "font-serif italic text-[#3a2f14]",
    progDesc: "mt-0.5 text-[11px] text-[#3a2f14]/70",
  },
  tropical: {
    wrap: "",
    tabsBar: "border-b border-[#e88b62]/40",
    tab: (a) =>
      "shrink-0 border-b-2 px-3 pb-2 pt-1 font-mono text-[10px] uppercase tracking-widest transition " +
      (a
        ? "border-[#e88b62] text-[#f4e4c1]"
        : "border-transparent text-[#f4e4c1]/50 hover:text-[#f4e4c1]"),
    card: "mt-5 rounded-2xl border border-[#f4e4c1]/15 bg-[#1a4d3d] p-5",
    title: "font-serif text-xl italic text-[#f4e4c1]",
    time: "font-mono text-xs text-[#e88b62]",
    meta: "mt-1 text-sm text-[#f4e4c1]/70",
    dress:
      "mt-3 inline-block rounded-full bg-[#e88b62]/20 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-[#e88b62]",
    divider: "mt-4 space-y-3 border-t border-[#f4e4c1]/15 pt-4",
    progTime: "w-14 shrink-0 font-mono text-[10px] uppercase tracking-widest text-[#e88b62]",
    progTitle: "font-serif italic text-[#f4e4c1]",
    progDesc: "mt-0.5 text-[11px] text-[#f4e4c1]/70",
  },
  deco: {
    wrap: "",
    tabsBar: "border-b border-[#c9a84c]/30",
    tab: (a) =>
      "shrink-0 border-b-2 px-3 pb-2 pt-1 font-mono text-[10px] uppercase tracking-[0.25em] transition " +
      (a
        ? "border-[#c9a84c] text-[#f0d78c]"
        : "border-transparent text-[#f0d78c]/40 hover:text-[#f0d78c]/80"),
    card: "relative mt-5 rounded-xl border border-[#c9a84c]/30 bg-[#1a0f1a]/60 p-5",
    title: "font-serif text-xl italic text-[#f0d78c]",
    time: "font-mono text-xs text-[#c9a84c]",
    meta: "mt-1 text-sm text-[#f0d78c]/70",
    dress:
      "mt-3 font-mono text-[10px] uppercase tracking-[0.3em] text-[#c9a84c]",
    divider: "mt-4 space-y-3 border-t border-[#c9a84c]/30 pt-4",
    progTime:
      "w-14 shrink-0 font-mono text-[10px] uppercase tracking-[0.25em] text-[#c9a84c]",
    progTitle: "font-serif italic text-[#f0d78c]",
    progDesc: "mt-0.5 text-[11px] text-[#f0d78c]/70",
  },
  "bleu-nuit": {
    wrap: "",
    tabsBar: "border-b border-[#c9b57b]/25",
    tab: (a) =>
      "shrink-0 border-b-2 px-3 pb-2 pt-1 font-mono text-[10px] uppercase tracking-[0.3em] transition " +
      (a
        ? "border-[#c9b57b] text-[#eae3d0]"
        : "border-transparent text-[#eae3d0]/45 hover:text-[#eae3d0]/80"),
    card: "relative mt-6 rounded-2xl border border-[#c9b57b]/25 bg-white/[0.04] p-6 backdrop-blur-sm shadow-[0_10px_40px_-20px_rgba(0,0,0,0.6)]",
    title: "text-2xl italic text-[#eae3d0]",
    time: "font-mono text-xs uppercase tracking-[0.25em] text-[#c9b57b]",
    meta: "mt-2 text-sm italic text-[#eae3d0]/75",
    dress:
      "mt-3 inline-flex items-center gap-2 rounded-full border border-[#c9b57b]/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.3em] text-[#c9b57b]",
    divider: "mt-5 space-y-4 border-t border-[#c9b57b]/20 pt-5",
    progTime:
      "w-16 shrink-0 font-mono text-[10px] uppercase tracking-[0.3em] text-[#c9b57b]",
    progTitle: "italic text-[#eae3d0]",
    progDesc: "mt-0.5 text-[11px] text-[#eae3d0]/60",
  },
};

export function CeremonyProgramTabs({ ceremonies, variant }: Props) {
  const [activeId, setActiveId] = useState(ceremonies[0]?.id);
  if (ceremonies.length === 0) return null;
  const skin = skins[variant];
  const active = ceremonies.find((c) => c.id === activeId) ?? ceremonies[0];

  const showTabs = ceremonies.length > 1;

  return (
    <div className={skin.wrap}>
      {showTabs ? (
        <div
          className={
            "flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden " +
            skin.tabsBar
          }
          role="tablist"
        >
          {ceremonies.map((c) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={c.id === active.id}
              onClick={() => setActiveId(c.id)}
              className={skin.tab(c.id === active.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className={skin.card}>
        {variant === "deco" ? (
          <div className="pointer-events-none absolute inset-1 rounded-lg border border-[#c9a84c]/15" />
        ) : null}
        <div className="relative">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className={skin.title}>{active.name}</h3>
            <span className={skin.time}>{active.timeStart}</span>
          </div>
          <p className={skin.meta}>
            {active.label} · {active.venue}
          </p>
          {active.dressCode ? (
            <p className={skin.dress}>
              {variant === "deco" ? "◆ " : variant === "noir" ? "Dress code — " : variant === "gold" ? "Tenue — " : ""}
              {active.dressCode}
            </p>
          ) : null}
          {active.program && active.program.length > 0 ? (
            <ul className={skin.divider}>
              {active.program.map((it) => (
                <li key={it.id} className="flex gap-3">
                  <span className={skin.progTime}>{it.time}</span>
                  <div className="min-w-0">
                    <p className={skin.progTitle}>{it.title}</p>
                    {it.description ? (
                      <p className={skin.progDesc}>{it.description}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-xs italic opacity-60">
              Programme détaillé à venir.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
