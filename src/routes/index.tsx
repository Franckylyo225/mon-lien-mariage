import { createFileRoute, Link } from "@tanstack/react-router";
import heroBouquet from "@/assets/hero-bouquet.jpg.asset.json";
import engagementRing from "@/assets/engagement-ring.jpg.asset.json";
import churchCouple from "@/assets/church-couple.jpg.asset.json";
import { ceremonyMeta, templateMeta, templateOrder } from "@/lib/ceremony-meta";
import type { CeremonyType } from "@/lib/wedding-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title:
          "MonMariage.ci — Invitations digitales & gestion de mariage en Côte d'Ivoire",
      },
      {
        name: "description",
        content:
          "Créez une page d'invitation stylée pour chaque cérémonie de mariage (dot, civil, religieux, dîner, anniversaire), collectez les RSVP et pilotez vos invités depuis un dashboard simple.",
      },
      {
        property: "og:title",
        content: "MonMariage.ci — Invitations & gestion de mariage",
      },
      {
        property: "og:description",
        content:
          "5 modèles d'invitation, RSVP par cérémonie, QR code, WhatsApp. Fait pour les mariages ivoiriens.",
      },
    ],
  }),
  component: MarketingHome,
});

const homeCeremonyTypes: CeremonyType[] = [
  "dot",
  "civil",
  "religieux",
  "traditionnel",
  "diner",
  "anniversaire",
];

const features = [
  {
    icon: "◈",
    title: "Une page par cérémonie",
    text: "Chaque étape (dot, civil, religieux, dîner) a son programme, son dress code, son plan d'accès.",
  },
  {
    icon: "❋",
    title: "RSVP indépendants",
    text: "Vos invités confirment séparément pour chaque cérémonie. Vous savez précisément qui vient à quoi.",
  },
  {
    icon: "✦",
    title: "QR code + WhatsApp",
    text: "Un lien à copier, un QR à imprimer sur vos cartons, et le partage WhatsApp en 1 clic.",
  },
  {
    icon: "❍",
    title: "Accompagnants gérés",
    text: "Autorisez un +1 pour certains, refusez pour d'autres. Chaque invité voit sa règle.",
  },
  {
    icon: "⌘",
    title: "Dashboard en direct",
    text: "Comptez les confirmés en temps réel, filtrez par cérémonie, exportez votre liste.",
  },
  {
    icon: "✿",
    title: "100 % mobile",
    text: "Tante Adjoua remplit son RSVP depuis son téléphone, même sur une petite connexion.",
  },
];

const faqs = [
  {
    q: "Mes invités ont-ils besoin d'un compte pour répondre ?",
    a: "Non. Ils cliquent sur le lien ou scannent le QR code, remplissent leur nom et confirment. C'est tout.",
  },
  {
    q: "Puis-je modifier ma page après l'avoir partagée ?",
    a: "Oui, en permanence. Le lien reste le même, seules les infos changent — même après envoi.",
  },
  {
    q: "Est-ce que ça marche sans internet chez l'invité ?",
    a: "L'invité a besoin d'internet pour ouvrir la page, mais elle est ultra légère et rapide même en 3G.",
  },
  {
    q: "Puis-je gérer plusieurs cérémonies avec un seul lien ?",
    a: "Oui. Ajoutez toutes vos cérémonies (dot, civil, religieux, dîner…), chacune avec ses propres invités.",
  },
  {
    q: "Combien coûte la plateforme ?",
    a: "Gratuit pour tester (1 cérémonie, 30 invités). 25 000 FCFA en paiement unique pour le pack complet.",
  },
  {
    q: "Puis-je récupérer la liste de mes invités ?",
    a: "Oui, en un clic depuis le dashboard : export CSV avec noms, téléphones et statuts.",
  },
];

function MarketingHome() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/15 font-serif text-sm italic text-primary">
              M
            </span>
            <span className="truncate font-serif text-lg italic">
              MonMariage<span className="text-primary">.ci</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#modeles" className="text-sm opacity-70 hover:opacity-100">
              Modèles
            </a>
            <a href="#ceremonies" className="text-sm opacity-70 hover:opacity-100">
              Cérémonies
            </a>
            <a href="#fonctionnalites" className="text-sm opacity-70 hover:opacity-100">
              Fonctionnalités
            </a>
            <a href="#tarifs" className="text-sm opacity-70 hover:opacity-100">
              Tarifs
            </a>
          </nav>
          <div className="flex shrink-0 items-center gap-2">
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
              <span className="text-primary">une page stylée</span>, zéro chaos.
            </h1>
            <p className="mt-5 max-w-lg text-pretty text-base leading-relaxed opacity-75">
              Choisissez un des 5 modèles d'invitation, ajoutez vos cérémonies
              (dot, civil, religieux, dîner…), partagez le lien et laissez vos
              invités confirmer un par un — depuis leur téléphone.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/dashboard/landing"
                className="rounded-full bg-primary px-6 py-4 font-mono text-[11px] uppercase tracking-[0.25em] text-primary-foreground shadow-lg shadow-primary/30 transition hover:opacity-90"
              >
                Créer ma page
              </Link>
              <a
                href="#modeles"
                className="rounded-full border border-foreground/20 px-6 py-4 font-mono text-[11px] uppercase tracking-[0.25em] transition hover:bg-accent/20"
              >
                Voir les 5 modèles
              </a>
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

          {/* Hero photo */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="relative rotate-2 overflow-hidden rounded-[2rem] shadow-2xl ring-1 ring-border">
              <img
                src={heroBouquet.url}
                alt="Mariée tenant un bouquet de roses pastel"
                className="aspect-[3/4] w-full object-cover"
                loading="eager"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-transparent"
              />
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

      {/* Trust bar */}
      <section className="border-y border-border/60 bg-accent/10 py-6">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-5 text-center sm:grid-cols-4 sm:px-8">
          {[
            { k: "120+", v: "couples" },
            { k: "6 500+", v: "RSVP collectés" },
            { k: "5", v: "modèles au choix" },
            { k: "4.9/5", v: "note moyenne" },
          ].map((s) => (
            <div key={s.v}>
              <p className="font-serif text-2xl italic text-primary">{s.k}</p>
              <p className="font-mono text-[10px] uppercase tracking-widest opacity-60">
                {s.v}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Templates gallery */}
      <section id="modeles" className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="mx-auto mb-4 block h-px w-10 bg-primary/50" />
          <h2 className="font-serif text-4xl italic">5 modèles, 1 style qui vous ressemble</h2>
          <p className="mt-4 opacity-70">
            Chaque modèle est optimisé mobile, imprimable en QR, et
            personnalisable en 2 minutes.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {templateOrder.map((t) => {
            const m = templateMeta[t];
            return (
              <a
                key={t}
                href="/invitation"
                target="_blank"
                rel="noopener noreferrer"
                className="group overflow-hidden rounded-3xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div
                  className="aspect-[4/5] w-full"
                  style={{
                    background: `linear-gradient(160deg, ${m.swatch[0]}, ${m.swatch[1]} 35%, ${m.swatch[2]} 70%, ${m.swatch[3]})`,
                  }}
                />
                <div className="flex items-center justify-between p-5">
                  <div>
                    <p className="font-serif text-xl italic">{m.label}</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest opacity-60">
                      {m.tagline}
                    </p>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-primary opacity-0 transition group-hover:opacity-100">
                    Aperçu ↗
                  </span>
                </div>
              </a>
            );
          })}
          <div className="flex flex-col justify-center rounded-3xl border border-dashed border-primary/30 bg-primary/5 p-8 text-center">
            <p className="font-serif text-2xl italic text-primary">+ Sur-mesure</p>
            <p className="mt-2 text-sm opacity-70">
              Besoin d'un modèle 100 % à votre image ? On le dessine avec vous.
            </p>
            <a
              href="#tarifs"
              className="mt-4 inline-block rounded-full border border-primary/40 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-primary transition hover:bg-primary/10"
            >
              Voir l'offre Prestige
            </a>
          </div>
        </div>
      </section>

      {/* Ceremony types */}
      <section id="ceremonies" className="border-y border-border bg-accent/10 py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="mx-auto mb-4 block h-px w-10 bg-primary/50" />
            <h2 className="font-serif text-4xl italic">
              Toutes vos cérémonies, sur une seule plateforme
            </h2>
            <p className="mt-4 opacity-70">
              De la dot à l'anniversaire de mariage, chaque étape a sa page,
              son programme et ses invités.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {homeCeremonyTypes.map((t) => {
              const m = ceremonyMeta[t];
              return (
                <div
                  key={t}
                  className="flex items-start gap-4 rounded-2xl bg-card p-5 ring-1 ring-border"
                >
                  <span
                    className="grid size-11 shrink-0 place-items-center rounded-xl font-serif text-xl italic text-background"
                    style={{ backgroundColor: m.color }}
                  >
                    {m.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="font-serif text-lg italic">{m.label}</p>
                    <p className="mt-1 text-sm opacity-70">{m.blurb}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="fonctionnalites"
        className="mx-auto max-w-6xl px-5 py-20 sm:px-8"
      >
        <div className="grid gap-12 md:grid-cols-[1fr_1.1fr] md:items-center">
          <div className="relative order-2 md:order-1">
            <div className="overflow-hidden rounded-[2rem] shadow-xl ring-1 ring-border">
              <img
                src={engagementRing.url}
                alt="Un homme passe la bague de fiançailles au doigt de sa fiancée"
                className="aspect-[4/5] w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 hidden rounded-2xl bg-background px-4 py-3 shadow-lg ring-1 ring-border sm:block">
              <p className="font-mono text-[9px] uppercase tracking-widest opacity-60">
                De la promesse
              </p>
              <p className="font-serif text-lg italic">au grand jour</p>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <span className="mb-4 block h-px w-10 bg-primary/50" />
            <h2 className="font-serif text-4xl italic">En 3 étapes, c'est prêt</h2>
            <div className="mt-10 space-y-8">
              {[
                {
                  n: "01",
                  t: "Choisissez un modèle",
                  d: "5 styles au choix, du Terracotta chaleureux au Noir Minimal éditorial. Vous pouvez changer à tout moment.",
                },
                {
                  n: "02",
                  t: "Ajoutez vos cérémonies",
                  d: "Dot, civil, religieux, dîner… avec pour chacune sa date, son lieu, son dress code et ses invités.",
                },
                {
                  n: "03",
                  t: "Partagez et suivez tout",
                  d: "Lien WhatsApp, QR code, dashboard temps réel avec les confirmés par cérémonie.",
                },
              ].map((s) => (
                <div key={s.n} className="flex gap-5">
                  <p className="font-serif text-5xl italic text-primary/40">{s.n}</p>
                  <div>
                    <h3 className="font-serif text-2xl italic">{s.t}</h3>
                    <p className="mt-2 text-sm leading-relaxed opacity-75">{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features grid */}
        <div className="mt-20 grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-3xl border border-border bg-card p-6 transition hover:border-primary/40 hover:shadow-lg"
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

      {/* Testimonials */}
      <section className="border-y border-border bg-accent/10 py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-8 md:grid-cols-[1.1fr_1fr] md:items-center">
          <div className="space-y-6">
            {[
              {
                n: "Aïcha & Stéphane",
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
          <div className="relative">
            <div className="overflow-hidden rounded-[2rem] shadow-xl ring-1 ring-border">
              <img
                src={churchCouple.url}
                alt="Mariés se tenant le bras à l'église, la mariée tenant un bouquet"
                className="aspect-[4/5] w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute -top-4 -left-4 hidden rounded-full bg-primary px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-primary-foreground shadow-lg sm:block">
              +120 couples heureux
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="tarifs" className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="text-center">
          <span className="mx-auto mb-4 block h-px w-10 bg-primary/50" />
          <h2 className="font-serif text-4xl italic">Un prix juste, une seule fois</h2>
          <p className="mt-3 opacity-70">
            Pas d'abonnement. Payez, mariez-vous, on efface.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <PlanCard
            name="Découverte"
            price="Gratuit"
            features={[
              "1 cérémonie",
              "Jusqu'à 30 invités",
              "1 modèle d'invitation",
              "Page publique + QR code",
              "Branding MonMariage.ci",
            ]}
            ctaLabel="Commencer"
          />
          <PlanCard
            name="Le Grand Jour"
            price="25 000 FCFA"
            highlight
            badge="Recommandé"
            features={[
              "Cérémonies illimitées",
              "Invités illimités",
              "Les 5 modèles",
              "Import CSV & partage WhatsApp",
              "Statistiques en direct",
              "Support prioritaire",
            ]}
            ctaLabel="Créer ma page"
          />
          <PlanCard
            name="Prestige"
            price="75 000 FCFA"
            features={[
              "Tout Le Grand Jour",
              "Sous-domaine personnalisé",
              "Retrait du branding",
              "Plusieurs mariages gérés",
              "Idéal wedding planners",
            ]}
            ctaLabel="Nous contacter"
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border bg-accent/10 py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <div className="text-center">
            <span className="mx-auto mb-4 block h-px w-10 bg-primary/50" />
            <h2 className="font-serif text-4xl italic">Questions fréquentes</h2>
          </div>
          <div className="mt-10 divide-y divide-border rounded-3xl bg-card ring-1 ring-border">
            {faqs.map((f) => (
              <details key={f.q} className="group px-6 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <span className="font-serif text-lg italic">{f.q}</span>
                  <span className="grid size-7 shrink-0 place-items-center rounded-full border border-border text-lg transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed opacity-75">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-4xl px-5 py-20 sm:px-8">
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

function PlanCard({
  name,
  price,
  features,
  ctaLabel,
  highlight,
  badge,
}: {
  name: string;
  price: string;
  features: string[];
  ctaLabel: string;
  highlight?: boolean;
  badge?: string;
}) {
  return (
    <div
      className={
        "relative rounded-3xl p-8 " +
        (highlight
          ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20"
          : "border border-border bg-card")
      }
    >
      {badge ? (
        <span className="absolute -top-3 right-6 rounded-full bg-foreground px-3 py-1 font-mono text-[9px] uppercase tracking-widest text-background">
          {badge}
        </span>
      ) : null}
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-70">
        {name}
      </p>
      <p className="mt-3 font-serif text-4xl italic">{price}</p>
      <ul className="mt-6 space-y-2 text-sm opacity-90">
        {features.map((f) => (
          <li key={f}>· {f}</li>
        ))}
      </ul>
      <Link
        to="/dashboard/landing"
        className={
          "mt-8 block rounded-full py-3 text-center font-mono text-[10px] uppercase tracking-widest transition " +
          (highlight
            ? "bg-background text-foreground hover:opacity-90"
            : "border border-foreground/20 hover:bg-accent/20")
        }
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
