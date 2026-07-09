import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MonMariage.ci — Créez la page de votre mariage" },
      {
        name: "description",
        content:
          "Créez votre page d'invitation de mariage en 4 étapes. Gratuit jusqu'à la publication. Pensé pour les mariages en Côte d'Ivoire.",
      },
      { property: "og:title", content: "MonMariage.ci — Célébrons votre union" },
      {
        property: "og:description",
        content:
          "Une page d'invitation stylée pour chaque étape : dot, civil, religieux, réception.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
          <Link to="/" className="font-serif text-lg italic">
            MonMariage<span className="text-primary">.ci</span>
          </Link>
          <Link
            to="/login"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Se connecter
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-5 pt-20 pb-24 text-center sm:pt-28">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary">
          Côte d'Ivoire
        </p>
        <h1 className="mt-6 font-serif text-5xl leading-[1.05] italic sm:text-6xl">
          Célébrons <br />
          <span className="text-primary">votre union.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
          Créez la page de votre mariage en 4 étapes. Ajoutez vos étapes,
          invitez vos proches, recevez leurs confirmations — sans stress.
        </p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/signup"
            className="inline-block w-full rounded-lg bg-primary px-8 py-4 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 sm:w-auto"
          >
            Commencer gratuitement
          </Link>
          <p className="text-xs text-muted-foreground">
            Gratuit jusqu'à la publication.
          </p>
        </div>
      </section>

      {/* Bénéfices */}
      <section className="border-t border-border/60 bg-secondary/40 py-20">
        <div className="mx-auto max-w-4xl px-5">
          <h2 className="text-center font-serif text-3xl italic">
            Une plateforme, tout votre mariage
          </h2>
          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {[
              {
                t: "Plusieurs étapes",
                d: "Dot, civil, religieux, réception — chaque étape a sa page, son programme et son lieu.",
              },
              {
                t: "Invités par catégorie",
                d: "Famille, amis, collègues — organisez sans confondre, avec les accompagnants autorisés.",
              },
              {
                t: "Une page qui vous ressemble",
                d: "3 ambiances élégantes, personnalisables. Vos prénoms mis en valeur, à partager en un lien.",
              },
            ].map((b) => (
              <div key={b.t}>
                <div className="h-px w-8 bg-primary" />
                <h3 className="mt-4 font-serif text-xl italic">{b.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {b.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-3xl px-5 py-20 text-center">
        <h2 className="font-serif text-3xl italic">
          Prêts à préparer votre grand jour ?
        </h2>
        <Link
          to="/signup"
          className="mt-8 inline-block rounded-lg bg-primary px-8 py-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          Créer mon compte
        </Link>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        © 2027 MonMariage.ci — Fait avec ♡ à Abidjan
      </footer>
    </main>
  );
}
