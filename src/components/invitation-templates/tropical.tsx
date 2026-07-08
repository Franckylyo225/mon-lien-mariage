import { daysUntil, formatFrenchDate } from "@/lib/wedding-store";
import type { TemplateProps } from "./types";

export function TropicalTemplate({ couple, ceremonies, rsvpSlot }: TemplateProps) {
  const published = ceremonies.filter((c) => c.status === "publiée");
  const days = daysUntil(couple.weddingDate);

  return (
    <main className="min-h-screen bg-[#0d3b2e] text-[#f4e4c1]">
      <article className="mx-auto max-w-lg px-5 pb-24 pt-6 sm:px-8">
        <header className="relative overflow-hidden rounded-[2rem]">
          {couple.heroImageUrl ? (
            <img
              src={couple.heroImageUrl}
              alt=""
              className="aspect-[3/4] w-full object-cover"
            />
          ) : (
            <div className="aspect-[3/4] w-full bg-gradient-to-br from-[#1a6b52] via-[#0d3b2e] to-[#e88b62]/50" />
          )}
          {/* Palm leaf svg overlay */}
          <svg
            aria-hidden
            viewBox="0 0 200 200"
            className="absolute -left-6 -top-6 size-52 text-[#e88b62]/40"
            fill="currentColor"
          >
            <path d="M100 20 C 60 60, 40 100, 30 180 L 40 180 C 55 110, 80 70, 105 40 Z" />
            <path d="M100 20 C 140 60, 160 100, 170 180 L 160 180 C 145 110, 120 70, 95 40 Z" />
          </svg>
          <svg
            aria-hidden
            viewBox="0 0 200 200"
            className="absolute -bottom-6 -right-8 size-56 rotate-180 text-[#e88b62]/40"
            fill="currentColor"
          >
            <path d="M100 20 C 60 60, 40 100, 30 180 L 40 180 C 55 110, 80 70, 105 40 Z" />
            <path d="M100 20 C 140 60, 160 100, 170 180 L 160 180 C 145 110, 120 70, 95 40 Z" />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d3b2e] via-[#0d3b2e]/40 to-transparent" />
          <div className="absolute bottom-8 left-0 right-0 px-6 text-center">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-[#e88b62]">
              Un mariage sous les tropiques
            </p>
            <h1 className="font-serif text-5xl italic leading-none">
              {couple.brideName}
              <span className="mx-2 text-[#e88b62]">&</span>
              {couple.groomName}
            </h1>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.25em] opacity-80">
              {formatFrenchDate(couple.weddingDate)} · {couple.city}
            </p>
          </div>
        </header>

        <section className="mt-10 rounded-3xl bg-[#e88b62] p-6 text-center text-[#0d3b2e]">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-70">
            Plus que
          </p>
          <p className="font-serif text-6xl italic leading-none">{days}</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-70">
            jours au paradis
          </p>
        </section>

        <p className="mt-10 text-center font-serif italic leading-relaxed text-[#f4e4c1]/90">
          {couple.introMessage}
        </p>

        <section className="mt-14">
          <div className="mb-8 flex items-center gap-3">
            <span className="text-2xl text-[#e88b62]">🌴</span>
            <h2 className="font-serif text-2xl italic">Programme</h2>
            <span className="ml-auto h-px flex-1 bg-[#e88b62]/40" />
          </div>
          <div className="space-y-4">
            {published.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-[#f4e4c1]/15 bg-[#1a4d3d] p-5"
              >
                <div className="flex items-baseline justify-between">
                  <h3 className="font-serif text-xl italic text-[#f4e4c1]">
                    {c.name}
                  </h3>
                  <p className="font-mono text-xs text-[#e88b62]">{c.timeStart}</p>
                </div>
                <p className="mt-1 text-sm text-[#f4e4c1]/70">
                  {c.label} · {c.venue}
                </p>
                {c.dressCode ? (
                  <p className="mt-3 inline-block rounded-full bg-[#e88b62]/20 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-[#e88b62]">
                    {c.dressCode}
                  </p>
                ) : null}
                {c.program && c.program.length > 0 ? (
                  <ul className="mt-4 space-y-2 border-t border-[#f4e4c1]/15 pt-3">
                    {c.program.map((it) => (
                      <li key={it.id} className="flex gap-3">
                        <span className="w-14 shrink-0 font-mono text-[10px] uppercase tracking-widest text-[#e88b62]">
                          {it.time}
                        </span>
                        <div className="min-w-0">
                          <p className="font-serif italic text-[#f4e4c1]">{it.title}</p>
                          {it.description ? (
                            <p className="mt-0.5 text-[11px] text-[#f4e4c1]/70">
                              {it.description}
                            </p>
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

        <footer className="pt-16 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-[#e88b62]/70">
          {couple.hashtag ?? `${couple.brideName} & ${couple.groomName}`}
        </footer>
      </article>
    </main>
  );
}
