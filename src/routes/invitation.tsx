import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  useWedding,
  daysUntil,
  formatFrenchDate,
  nextCeremony,
  type RSVPStatus,
} from "@/lib/wedding-store";

export const Route = createFileRoute("/invitation")({
  component: InvitationPage,
});

function InvitationPage() {
  const { couple, ceremonies } = useWedding();
  const published = ceremonies.filter((c) => c.status === "publiée");
  const days = daysUntil(couple.weddingDate);
  const upcoming = nextCeremony(published);

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Top nav (subtle) */}
      <div className="absolute top-0 right-0 z-10 p-4 sm:p-6">
        <Link
          to="/dashboard"
          className="rounded-full border border-border bg-background/70 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] backdrop-blur transition hover:bg-accent/20"
        >
          Espace mariés
        </Link>
      </div>

      <article className="mx-auto max-w-lg animate-reveal px-5 pb-24 sm:px-8">
        {/* Hero */}
        <header className="relative mt-6 overflow-hidden rounded-[2rem] shadow-xl ring-1 ring-black/5">
          <div
            className="aspect-[3/4] w-full bg-gradient-to-br from-accent/40 via-primary/20 to-accent/60"
            aria-label="Portrait du couple"
          >
            <div className="flex h-full w-full items-center justify-center">
              <div className="text-center">
                <p className="font-serif text-6xl italic text-primary/60">A</p>
                <p className="-mt-3 font-mono text-[10px] uppercase tracking-[0.4em] text-primary/50">
                  &
                </p>
                <p className="-mt-3 font-serif text-6xl italic text-primary/60">K</p>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
          <div className="absolute bottom-8 left-0 right-0 px-6 text-center">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
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

        {/* Countdown */}
        <section className="mt-10 flex items-center justify-center gap-6 text-center">
          <div>
            <p className="font-serif text-4xl italic text-primary">{days}</p>
            <p className="font-mono text-[9px] uppercase tracking-[0.25em] opacity-60">
              jours
            </p>
          </div>
          <div className="h-10 w-px bg-border" />
          <div>
            <p className="font-serif text-4xl italic">{published.length}</p>
            <p className="font-mono text-[9px] uppercase tracking-[0.25em] opacity-60">
              cérémonies
            </p>
          </div>
          {upcoming ? (
            <>
              <div className="h-10 w-px bg-border" />
              <div>
                <p className="font-serif text-4xl italic">{upcoming.timeStart}</p>
                <p className="font-mono text-[9px] uppercase tracking-[0.25em] opacity-60">
                  {upcoming.label}
                </p>
              </div>
            </>
          ) : null}
        </section>

        {/* Intro */}
        <p className="mt-12 text-pretty text-center text-sm italic leading-relaxed opacity-80">
          {couple.introMessage}
        </p>

        {/* Timeline */}
        <section className="mt-14">
          <div className="mb-8 text-center">
            <span className="mx-auto mb-3 block h-px w-10 bg-primary/40" />
            <h2 className="font-serif text-2xl italic">Le Programme</h2>
          </div>
          <ol className="relative space-y-8">
            <div className="absolute left-[7px] top-2 bottom-2 w-px border-l border-dashed border-primary/30" />
            {published.map((c) => (
              <li key={c.id} className="relative pl-8">
                <span
                  className="absolute left-0 top-1.5 size-3 rounded-full ring-4 ring-background"
                  style={{ backgroundColor: c.color }}
                />
                <p className="font-mono text-[9px] uppercase tracking-wider text-primary">
                  {c.timeStart} — {c.venue}
                </p>
                <h3 className="mt-1 font-serif text-xl">{c.name}</h3>
                <p className="mt-1 text-xs opacity-70">{c.label}</p>
                {c.dressCode ? (
                  <p className="mt-2 inline-block rounded-full bg-accent/20 px-3 py-1 text-[10px] uppercase tracking-widest opacity-80">
                    {c.dressCode}
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
        </section>

        {/* RSVP */}
        <RsvpForm />

        <footer className="pt-16 text-center font-mono text-[9px] uppercase tracking-[0.3em] opacity-40">
          MonMariage — {couple.brideName[0]}&{couple.groomName[0]}
        </footer>
      </article>
    </main>
  );
}

function RsvpForm() {
  const { ceremonies } = useWedding();
  const published = ceremonies.filter((c) => c.status === "publiée");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [plusOnes, setPlusOnes] = useState(1);
  const [message, setMessage] = useState("");
  const [choices, setChoices] = useState<Record<string, RSVPStatus>>({});
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = useMemo(
    () => name.trim().length > 1 && Object.keys(choices).length === published.length,
    [name, choices, published.length],
  );

  if (submitted) {
    return (
      <section className="mt-14 rounded-3xl bg-primary/10 p-8 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
          Merci {name.split(" ")[0]}
        </p>
        <h3 className="mt-3 font-serif text-2xl italic">Votre réponse est enregistrée</h3>
        <p className="mx-auto mt-3 max-w-sm text-sm opacity-70">
          Nous avons hâte de vous retrouver. Un rappel vous sera envoyé quelques jours avant.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setName("");
            setChoices({});
            setMessage("");
          }}
          className="mt-6 rounded-full border border-primary/30 px-5 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-primary transition hover:bg-primary/10"
        >
          Modifier ma réponse
        </button>
      </section>
    );
  }

  return (
    <section className="mt-14 rounded-3xl bg-accent/10 p-6 sm:p-8">
      <h4 className="text-center font-serif text-xl italic">Votre Présence</h4>
      <p className="mt-1 text-center text-xs opacity-60">
        Répondez pour chaque cérémonie à laquelle vous êtes convié·e.
      </p>

      <div className="mt-6 space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Votre nom complet"
          className="w-full rounded-full border border-input bg-background px-4 py-3 text-sm placeholder:opacity-40 focus:border-primary focus:outline-none"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Téléphone WhatsApp (optionnel)"
          className="w-full rounded-full border border-input bg-background px-4 py-3 text-sm placeholder:opacity-40 focus:border-primary focus:outline-none"
        />
      </div>

      <div className="mt-6 space-y-3">
        {published.map((c) => (
          <div key={c.id} className="rounded-2xl border border-primary/10 bg-background p-4">
            <div className="flex items-center gap-3">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: c.color }}
              />
              <div className="flex-1">
                <p className="text-sm font-medium">{c.name}</p>
                <p className="font-mono text-[9px] uppercase tracking-wider opacity-60">
                  {c.timeStart} · {c.label}
                </p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              {(["confirmé", "décliné"] as const).map((s) => {
                const active = choices[c.id] === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setChoices((prev) => ({ ...prev, [c.id]: s }))}
                    className={
                      "flex-1 rounded-full px-3 py-2 font-mono text-[10px] uppercase tracking-widest transition " +
                      (active
                        ? s === "confirmé"
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                          : "bg-foreground text-background"
                        : "border border-primary/20 text-foreground/80 hover:bg-accent/20")
                    }
                  >
                    {s === "confirmé" ? "Je viens" : "Je décline"}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-primary/10 bg-background p-4">
        <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest opacity-60">
          Accompagnants
        </label>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setPlusOnes((v) => Math.max(0, v - 1))}
            className="grid size-8 place-items-center rounded-full border border-border text-lg"
          >
            −
          </button>
          <span className="font-mono text-lg">
            {plusOnes.toString().padStart(2, "0")}
          </span>
          <button
            type="button"
            onClick={() => setPlusOnes((v) => Math.min(9, v + 1))}
            className="grid size-8 place-items-center rounded-full border border-border text-lg"
          >
            +
          </button>
        </div>
      </div>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Un mot pour les mariés (optionnel)"
        rows={3}
        className="mt-4 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm placeholder:opacity-40 focus:border-primary focus:outline-none"
      />

      <button
        disabled={!canSubmit}
        onClick={() => setSubmitted(true)}
        className="mt-6 w-full rounded-full bg-primary py-4 font-mono text-[11px] uppercase tracking-[0.25em] text-primary-foreground shadow-md shadow-primary/20 transition disabled:cursor-not-allowed disabled:opacity-40"
      >
        Envoyer ma réponse
      </button>
    </section>
  );
}
