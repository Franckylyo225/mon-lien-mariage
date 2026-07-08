import { daysUntil, formatFrenchDate, nextCeremony } from "@/lib/wedding-store";
import type { TemplateProps } from "./types";

export function TerracottaTemplate({ couple, ceremonies, rsvpSlot }: TemplateProps) {
  const published = ceremonies.filter((c) => c.status === "publiée");
  const days = daysUntil(couple.weddingDate);
  const upcoming = nextCeremony(published);
  const accent = couple.accent ?? "#d97757";

  return (
    <main className="min-h-screen bg-[#faf6f1] text-[#4a2a20]">
      <article className="mx-auto max-w-lg px-5 pb-24 pt-6 sm:px-8">
        <header className="relative overflow-hidden rounded-[2rem] shadow-xl ring-1 ring-black/5">
          {couple.heroImageUrl ? (
            <img
              src={couple.heroImageUrl}
              alt=""
              className="aspect-[3/4] w-full object-cover"
            />
          ) : (
            <div
              className="aspect-[3/4] w-full"
              style={{
                background: `linear-gradient(135deg, #f4e2d4, ${accent}55, #e8c5b6)`,
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#faf6f1] via-[#faf6f1]/10 to-transparent" />
          <div className="absolute bottom-8 left-0 right-0 px-6 text-center">
            <p
              className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em]"
              style={{ color: accent }}
            >
              Ils se disent oui
            </p>
            <h1 className="text-balance font-serif text-[2.5rem] italic leading-none">
              {couple.brideName} & {couple.groomName}
            </h1>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.25em] opacity-70">
              {formatFrenchDate(couple.weddingDate)} · {couple.city}
            </p>
          </div>
        </header>

        <section className="mt-10 flex items-center justify-center gap-6 text-center">
          <div>
            <p className="font-serif text-4xl italic" style={{ color: accent }}>
              {days}
            </p>
            <p className="font-mono text-[9px] uppercase tracking-[0.25em] opacity-60">
              jours
            </p>
          </div>
          <div className="h-10 w-px bg-[#4a2a20]/15" />
          <div>
            <p className="font-serif text-4xl italic">{published.length}</p>
            <p className="font-mono text-[9px] uppercase tracking-[0.25em] opacity-60">
              cérémonies
            </p>
          </div>
          {upcoming ? (
            <>
              <div className="h-10 w-px bg-[#4a2a20]/15" />
              <div>
                <p className="font-serif text-4xl italic">{upcoming.timeStart}</p>
                <p className="font-mono text-[9px] uppercase tracking-[0.25em] opacity-60">
                  {upcoming.label}
                </p>
              </div>
            </>
          ) : null}
        </section>

        <p className="mt-12 text-pretty text-center text-sm italic leading-relaxed opacity-80">
          {couple.introMessage}
        </p>

        <section className="mt-14">
          <div className="mb-8 text-center">
            <span
              className="mx-auto mb-3 block h-px w-10"
              style={{ backgroundColor: accent + "80" }}
            />
            <h2 className="font-serif text-2xl italic">Le Programme</h2>
          </div>
          <ol className="relative space-y-8">
            <div className="absolute left-[7px] top-2 bottom-2 w-px border-l border-dashed border-[#4a2a20]/25" />
            {published.map((c) => (
              <li key={c.id} className="relative pl-8">
                <span
                  className="absolute left-0 top-1.5 size-3 rounded-full ring-4 ring-[#faf6f1]"
                  style={{ backgroundColor: c.color }}
                />
                <p
                  className="font-mono text-[9px] uppercase tracking-wider"
                  style={{ color: accent }}
                >
                  {c.timeStart} — {c.venue}
                </p>
                <h3 className="mt-1 font-serif text-xl">{c.name}</h3>
                <p className="mt-1 text-xs opacity-70">{c.label}</p>
                {c.dressCode ? (
                  <p className="mt-2 inline-block rounded-full bg-[#e8c5b6] px-3 py-1 text-[10px] uppercase tracking-widest opacity-80">
                    {c.dressCode}
                  </p>
                ) : null}
                {c.program && c.program.length > 0 ? (
                  <ul className="mt-3 space-y-2 border-l border-dashed border-[#4a2a20]/25 pl-4">
                    {c.program.map((it) => (
                      <li key={it.id}>
                        <p className="font-mono text-[9px] uppercase tracking-wider" style={{ color: accent }}>
                          {it.time}
                        </p>
                        <p className="font-serif text-sm italic">{it.title}</p>
                        {it.description ? (
                          <p className="mt-0.5 text-[11px] opacity-70">{it.description}</p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ol>
        </section>

        {rsvpSlot}

        <footer className="pt-16 text-center font-mono text-[9px] uppercase tracking-[0.3em] opacity-40">
          {couple.hashtag ?? `MonMariage — ${couple.brideName[0]}&${couple.groomName[0]}`}
        </footer>
      </article>
    </main>
  );
}
