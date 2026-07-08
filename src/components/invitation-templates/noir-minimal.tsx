import { formatFrenchDate, daysUntil } from "@/lib/wedding-store";
import type { TemplateProps } from "./types";

export function NoirMinimalTemplate({ couple, ceremonies, rsvpSlot }: TemplateProps) {
  const published = ceremonies.filter((c) => c.status === "publiée");
  const days = daysUntil(couple.weddingDate);

  return (
    <main className="min-h-screen bg-[#0d0d0d] text-[#f5f3ee]">
      <article className="mx-auto max-w-2xl px-6 pb-24 pt-16 sm:px-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-[#f5f3ee]/50">
          Save — the — date
        </p>
        <div className="mt-12 border-y border-[#f5f3ee]/15 py-16">
          <h1 className="text-center text-6xl font-medium leading-[0.9] tracking-tight sm:text-8xl">
            <span className="block">{couple.brideName}</span>
            <span className="my-2 block font-serif text-4xl italic text-[#f5f3ee]/50 sm:text-5xl">
              &
            </span>
            <span className="block">{couple.groomName}</span>
          </h1>
        </div>

        <div className="mt-10 grid grid-cols-3 gap-4 text-center">
          <Kpi label="Jour J − " value={days} />
          <Kpi label="Cérémonies" value={published.length} />
          <Kpi label="Ville" value={couple.city} />
        </div>

        <p className="mt-12 text-center text-sm leading-relaxed text-[#f5f3ee]/70">
          {couple.introMessage}
        </p>

        {couple.heroImageUrl ? (
          <img
            src={couple.heroImageUrl}
            alt=""
            className="mt-14 aspect-[16/10] w-full object-cover grayscale"
          />
        ) : null}

        <section className="mt-16">
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#f5f3ee]/50">
            Programme
          </p>
          <div className="mt-6 divide-y divide-[#f5f3ee]/15">
            {published.map((c) => (
              <div
                key={c.id}
                className="grid grid-cols-[80px_1fr] gap-6 py-6 sm:grid-cols-[100px_1fr]"
              >
                <div className="font-mono text-xs uppercase tracking-widest text-[#f5f3ee]/60">
                  {c.timeStart}
                </div>
                <div>
                  <h3 className="text-xl font-medium tracking-tight">{c.name}</h3>
                  <p className="mt-1 text-sm text-[#f5f3ee]/60">
                    {c.label} · {c.venue}
                  </p>
                  {c.dressCode ? (
                    <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-[#f5f3ee]/40">
                      Dress code — {c.dressCode}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>

        {rsvpSlot}

        <footer className="mt-16 border-t border-[#f5f3ee]/15 pt-8 text-center font-mono text-[10px] uppercase tracking-[0.4em] text-[#f5f3ee]/40">
          {formatFrenchDate(couple.weddingDate)}
        </footer>
      </article>
    </main>
  );
}

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-[#f5f3ee]/40">
        {label}
      </p>
      <p className="mt-2 text-3xl font-medium tracking-tight">{value}</p>
    </div>
  );
}
