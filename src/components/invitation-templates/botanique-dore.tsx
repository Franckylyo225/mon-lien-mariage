import { formatFrenchDate } from "@/lib/wedding-store";
import type { TemplateProps } from "./types";

export function BotaniqueDoreTemplate({ couple, ceremonies, rsvpSlot }: TemplateProps) {
  const published = ceremonies.filter((c) => c.status === "publiée");

  return (
    <main className="min-h-screen bg-[#f5f0e4] text-[#3d4a2d]">
      <article className="mx-auto max-w-lg px-5 pb-24 pt-10 sm:px-8">
        <div className="relative rounded-[2rem] border border-[#c9a84c]/40 bg-[#faf6ec] p-8 text-center shadow-sm">
          {/* Corners */}
          <Corner className="absolute left-3 top-3" />
          <Corner className="absolute right-3 top-3 rotate-90" />
          <Corner className="absolute bottom-3 left-3 -rotate-90" />
          <Corner className="absolute bottom-3 right-3 rotate-180" />

          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#c9a84c]">
            Faire — part
          </p>
          <p className="mt-8 font-serif text-lg italic opacity-70">
            Nous avons l'honneur de vous convier au mariage de
          </p>
          <h1 className="mt-6 font-serif text-5xl italic leading-tight">
            {couple.brideName}
            <span className="mx-3 text-[#c9a84c]">&</span>
            {couple.groomName}
          </h1>
          <div className="mx-auto my-6 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-[#c9a84c]" />
            <span className="text-[#c9a84c]">❦</span>
            <span className="h-px w-8 bg-[#c9a84c]" />
          </div>
          <p className="font-serif italic">{formatFrenchDate(couple.weddingDate)}</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest opacity-60">
            {couple.city}
          </p>
        </div>

        {couple.heroImageUrl ? (
          <img
            src={couple.heroImageUrl}
            alt=""
            className="mt-8 aspect-[4/5] w-full rounded-3xl object-cover ring-1 ring-[#c9a84c]/30"
          />
        ) : null}

        <p className="mt-10 text-center font-serif italic leading-relaxed opacity-80">
          {couple.introMessage}
        </p>

        <section className="mt-12">
          <div className="text-center">
            <span className="text-2xl text-[#c9a84c]">❦</span>
            <h2 className="mt-1 font-serif text-2xl italic">Le programme</h2>
          </div>
          <div className="mt-8 space-y-6">
            {published.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-[#c9a84c]/30 bg-[#faf6ec] p-5"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-serif text-xl italic">{c.name}</h3>
                  <p className="font-mono text-xs text-[#c9a84c]">{c.timeStart}</p>
                </div>
                <p className="mt-1 text-sm opacity-70">
                  {c.label} · {c.venue}
                </p>
                {c.dressCode ? (
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-widest opacity-60">
                    Tenue — {c.dressCode}
                  </p>
                ) : null}
                {c.program && c.program.length > 0 ? (
                  <ul className="mt-4 space-y-2 border-t border-[#c9a84c]/30 pt-3">
                    {c.program.map((it) => (
                      <li key={it.id} className="flex gap-3">
                        <span className="w-14 shrink-0 font-mono text-[10px] uppercase tracking-widest text-[#c9a84c]">
                          {it.time}
                        </span>
                        <div className="min-w-0">
                          <p className="font-serif italic">{it.title}</p>
                          {it.description ? (
                            <p className="mt-0.5 text-[11px] opacity-70">{it.description}</p>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        {rsvpSlot}

        <footer className="pt-12 text-center font-serif italic text-[#c9a84c]">
          ❦ {couple.hashtag ?? `${couple.brideName} & ${couple.groomName}`} ❦
        </footer>
      </article>
    </main>
  );
}

function Corner({ className }: { className: string }) {
  return (
    <svg
      className={"size-8 text-[#c9a84c] " + className}
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <path d="M2 20 Q2 2 20 2" />
      <path d="M8 20 Q8 8 20 8" opacity="0.5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}
