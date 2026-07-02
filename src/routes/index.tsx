import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MonMariage.ci — Invitations & gestion de mariage en Côte d'Ivoire" },
      {
        name: "description",
        content:
          "Créez votre page d'invitation, gérez vos cérémonies (dot, civil, réception), suivez les RSVP et envoyez vos invitations WhatsApp en quelques minutes.",
      },
      {
        property: "og:title",
        content: "MonMariage.ci — Invitations & gestion de mariage",
      },
      {
        property: "og:description",
        content:
          "La plateforme pensée pour les mariages ivoiriens. Une page, un QR code, tous vos invités.",
      },
    ],
  }),
  component: MarketingHome,
});

function MarketingHome() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-full bg-primary/15 font-serif text-sm italic text-primary">
              M
            </span>
            <span className="font-serif text-lg italic">
              MonMariage<span className="text-primary">.ci</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#avantages" className="text-sm opacity-70 hover:opacity-100">
              Avantages
            </a>
            <a href="#fonctionnalites" className="text-sm opacity-70 hover:opacity-100">
              Fonctionnalités
            </a>
            <a href="#tarifs" className="text-sm opacity-70 hover:opacity-100">
              Tarifs
            </a>
            <Link
              to="/invitation"
              className="text-sm opacity-70 hover:opacity-100"
            >
              Démo
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="hidden rounded-full border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] hover:bg-accent/20 sm:inline-block"
            >
              Espace mariés
            </Link>
            <Link
              to="/dashboard/landing"
              className="rounded-full bg-primary px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-primary-foreground shadow-md shadow-primary/20 hover:opacity-90"
            >
              Créer ma page
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-accent/30 via-background to-primary/10"
        />
        <div
          aria-hidden
          className="absolute -left-24 top-32 size-72 rounded-full bg-primary/20 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -right-16 -top-16 size-96 rounded-full bg-accent/40 blur-3xl"
        />

        <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-2 md:py-24">
          <div className="flex flex-col justify-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary">
              Fait à Abidjan · pour les mariages ivoiriens
            </p>
            <h1 className="mt-4 text-balance font-serif text-5xl leading-[1.05] italic sm:text-6xl">
              Votre mariage,{" "}
              <span className="text-primary">une seule page</span>, zéro chaos.
            </h1>
            <p className="mt-5 max-w-lg text-pretty text-base leading-relaxed opacity-75">
              De la dot à la réception, MonMariage.ci vous aide à envoyer vos
              invitations, suivre les confirmations et organiser vos cérémonies
              — depuis votre téléphone, sans imprimer un seul carton.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/dashboard/landing"
                className="rounded-full bg-primary px-6 py-4 font-mono text-[11px] uppercase tracking-[0.25em] text-primary-foreground shadow-lg shadow-primary/30 transition hover:opacity-90"
              >
                Créer ma page gratuitement
              </Link>
              <Link
                to="/invitation"
                className="rounded-full border border-foreground/20 px-6 py-4 font-mono text-[11px] uppercase tracking-[0.25em] transition hover:bg-accent/20"
              >
                Voir une invitation
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-4 text-xs opacity-70">
              <div className="flex -space-x-2">
                {["#c17c74", "#8b6f5e", "#d97757"].map((c) => (
                  <span
                    key={c}
                    className="size-7 rounded-full ring-2 ring-background"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <span>+120 couples ont déjà organisé leur mariage avec nous.</span>
            </div>
          </div>

          {/* Phone mockup */}
          <div className="relative mx-auto w-full max-w-sm">
            <div className="relative rotate-2 rounded-[2.5rem] border-8 border-foreground/90 bg-background p-3 shadow-2xl">
              <div className="overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-accent/40 via-primary/15 to-accent/60">
                <div className="flex aspect-[9/16] flex-col items-center justify-center p-6 text-center">
                  <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-primary">
                    Ils se disent oui
                  </p>
                  <p className="mt-6 font-serif text-5xl italic text-primary/70">
                    A
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-primary/60">
                    &
                  </p>
                  <p className="font-serif text-5xl italic text-primary/70">K</p>
                  <p className="mt-6 font-serif text-2xl italic">Aïcha & Kouassi</p>
                  <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.25em] opacity-70">
                    14 Février 2027 · Abidjan
                  </p>
                  <div className="mt-8 w-full space-y-2">
                    {[
                      { l: "Dot", t: "09:00" },
                      { l: "Civil", t: "11:30" },
                      { l: "Réception", t: "19:00" },
                    ].map((r) => (
                      <div
                        key={r.l}
                        className="flex items-center justify-between rounded-full bg-background/70 px-4 py-2 text-[11px]"
                      >
                        <span>{r.l}</span>
                        <span className="font-mono opacity-70">{r.t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 rounded-2xl bg-background p-3 shadow-xl ring-1 ring-border">
              <p className="font-mono text-[9px] uppercase tracking-widest opacity-60">
                Confirmés
              </p>
              <p className="font-serif text-3xl italic text-primary">184</p>
            </div>
            <div className="absolute -right-4 top-10 rounded-full bg-primary px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-primary-foreground shadow-lg">
              RSVP en temps réel
            </div>
          </div>
        </div>
      </section>

      {/* Pain points → Value */}
      <section id="avantages" className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="mx-auto mb-4 block h-px w-10 bg-primary/50" />
          <h2 className="font-serif text-4xl italic">
            Fini les cartons perdus et les listes WhatsApp interminables
          </h2>
          <p className="mt-4 opacity-70">
            Une plateforme pensée pour la réalité des mariages ivoiriens :
            plusieurs cérémonies, grande famille, invités à confirmer un par un.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: "✦",
              title: "Une page, tout est dit",
              text: "Programme, dress code, plan d'accès, mot des mariés. Vos invités trouvent tout au même endroit.",
            },
            {
              icon: "◈",
              title: "RSVP par cérémonie",
              text: "Chaque invité confirme séparément pour la dot, le civil et la réception. Vous savez qui vient à quoi.",
            },
            {
              icon: "❋",
              title: "WhatsApp & QR code",
              text: "Envoyez le lien en un clic sur WhatsApp, ou imprimez le QR code sur vos faire-part traditionnels.",
            },
            {
              icon: "⌘",
              title: "Compte des présents",
              text: "Suivez en direct combien de personnes ont confirmé pour chaque cérémonie. Plus de surprise chez le traiteur.",
            },
            {
              icon: "❍",
              title: "Gestion des accompagnants",
              text: "Autorisez un +1 pour certains invités, refusez pour d'autres. Chacun voit sa règle.",
            },
            {
              icon: "✿",
              title: "100% mobile",
              text: "Tante Adjoua remplit son RSVP depuis son téléphone, même sur une petite connexion.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="group rounded-3xl border border-border bg-card p-6 transition hover:border-primary/40 hover:shadow-lg"
            >
              <span className="inline-grid size-11 place-items-center rounded-2xl bg-primary/10 font-serif text-2xl italic text-primary">
                {f.icon}
              </span>
              <h3 className="mt-5 font-serif text-xl italic">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed opacity-70">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        id="fonctionnalites"
        className="border-y border-border bg-accent/10 py-20"
      >
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="mx-auto mb-4 block h-px w-10 bg-primary/50" />
            <h2 className="font-serif text-4xl italic">En 3 étapes, c'est prêt</h2>
          </div>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              {
                n: "01",
                t: "Personnalisez votre page",
                d: "Vos prénoms, la date, une photo, un mot pour vos invités. Choisissez vos cérémonies.",
              },
              {
                n: "02",
                t: "Partagez le lien ou le QR",
                d: "Envoyez sur WhatsApp, imprimez le QR sur vos cartons, publiez sur Instagram.",
              },
              {
                n: "03",
                t: "Suivez tout depuis votre dashboard",
                d: "Confirmations, déclinaisons, +1, messages — tout se met à jour automatiquement.",
              },
            ].map((s) => (
              <div key={s.n} className="relative">
                <p className="font-serif text-6xl italic text-primary/30">
                  {s.n}
                </p>
                <h3 className="mt-2 font-serif text-2xl italic">{s.t}</h3>
                <p className="mt-3 text-sm leading-relaxed opacity-75">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              n: "Aïcha & Kouassi",
              c: "Abidjan · Février 2027",
              q: "On a envoyé le lien sur WhatsApp le vendredi soir. Le dimanche, on avait déjà 140 confirmations. Une tranquillité incroyable.",
            },
            {
              n: "Fatou & Ismaël",
              c: "Yamoussoukro · Août 2026",
              q: "Trois cérémonies à organiser, trois listes différentes. Sans MonMariage.ci, je crois qu'on aurait perdu la tête.",
            },
          ].map((t) => (
            <figure
              key={t.n}
              className="rounded-3xl bg-card p-8 shadow-sm ring-1 ring-border"
            >
              <p className="font-serif text-3xl italic text-primary/40">“</p>
              <blockquote className="-mt-4 font-serif text-xl italic leading-relaxed">
                {t.q}
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-primary/15 font-serif italic text-primary">
                  {t.n[0]}
                </span>
                <div>
                  <p className="text-sm font-medium">{t.n}</p>
                  <p className="font-mono text-[10px] uppercase tracking-widest opacity-60">
                    {t.c}
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="tarifs" className="mx-auto max-w-4xl px-5 py-20 sm:px-8">
        <div className="text-center">
          <span className="mx-auto mb-4 block h-px w-10 bg-primary/50" />
          <h2 className="font-serif text-4xl italic">Un prix juste, une seule fois</h2>
          <p className="mt-3 opacity-70">Pas d'abonnement. Payez, mariez-vous, on efface.</p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-60">
              Découverte
            </p>
            <p className="mt-3 font-serif text-4xl italic">Gratuit</p>
            <ul className="mt-6 space-y-2 text-sm opacity-80">
              <li>· 1 cérémonie</li>
              <li>· Jusqu'à 30 invités</li>
              <li>· Page publique + QR code</li>
            </ul>
            <Link
              to="/dashboard/landing"
              className="mt-8 block rounded-full border border-foreground/20 py-3 text-center font-mono text-[10px] uppercase tracking-widest transition hover:bg-accent/20"
            >
              Commencer
            </Link>
          </div>
          <div className="relative rounded-3xl bg-primary p-8 text-primary-foreground shadow-xl shadow-primary/20">
            <span className="absolute -top-3 right-6 rounded-full bg-foreground px-3 py-1 font-mono text-[9px] uppercase tracking-widest text-background">
              Recommandé
            </span>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-80">
              Le Grand Jour
            </p>
            <p className="mt-3 font-serif text-4xl italic">
              25 000 <span className="text-xl">FCFA</span>
            </p>
            <ul className="mt-6 space-y-2 text-sm opacity-90">
              <li>· Cérémonies illimitées</li>
              <li>· Invités illimités</li>
              <li>· Import CSV & WhatsApp</li>
              <li>· Statistiques en direct</li>
              <li>· Support prioritaire</li>
            </ul>
            <Link
              to="/dashboard/landing"
              className="mt-8 block rounded-full bg-background py-3 text-center font-mono text-[10px] uppercase tracking-widest text-foreground transition hover:opacity-90"
            >
              Créer ma page
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-4xl px-5 pb-24 sm:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-foreground p-12 text-center text-background">
          <div
            aria-hidden
            className="absolute -right-10 -top-10 size-52 rounded-full bg-primary/40 blur-3xl"
          />
          <h2 className="relative font-serif text-4xl italic">
            Votre mariage mérite plus qu'un groupe WhatsApp.
          </h2>
          <p className="relative mx-auto mt-3 max-w-lg opacity-75">
            Créez votre page en 5 minutes. Testez tout gratuitement.
          </p>
          <Link
            to="/dashboard/landing"
            className="relative mt-8 inline-block rounded-full bg-primary px-8 py-4 font-mono text-[11px] uppercase tracking-[0.25em] text-primary-foreground shadow-lg shadow-primary/40 transition hover:opacity-90"
          >
            Créer ma page maintenant
          </Link>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row sm:px-8">
          <p className="font-serif text-sm italic">
            MonMariage<span className="text-primary">.ci</span>
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest opacity-50">
            © 2027 · Fait avec ♡ à Abidjan
          </p>
        </div>
      </footer>
    </main>
  );
}
