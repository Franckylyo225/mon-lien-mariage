import { createFileRoute, Link } from "@tanstack/react-router";
import { templateMeta, templateOrder } from "@/lib/ceremony-meta";
import { SiteHeader as SharedSiteHeader, SiteFooter as SharedSiteFooter } from "@/components/site/SiteChrome";
import heroCouple from "@/assets/home-couple.jpg";
import ogImage from "@/assets/og-image.jpg.asset.json";

const OG_IMAGE_URL = `https://moninvit.com${ogImage.url}`;

const HOME_FAQS: { q: string; a: string }[] = [
  {
    q: "Combien de temps faut-il pour créer mon invitation ?",
    a: "Entre 15 et 30 minutes pour une première version complète. Vous pouvez ensuite modifier à tout moment avant de publier.",
  },
  {
    q: "Dois-je créer un compte pour commencer ?",
    a: "Oui, mais en 30 secondes avec votre email. Aucune information de paiement requise à l'inscription.",
  },
  {
    q: "Peut-on gérer plusieurs cérémonies (dot, civil, religieux) ?",
    a: "Absolument. Chaque cérémonie a sa propre date, son lieu, son dress code. Vos invités voient uniquement les étapes auxquelles vous les avez conviés.",
  },
  {
    q: "Comment mes invités confirment-ils leur présence ?",
    a: "Ils reçoivent votre lien sur WhatsApp, ouvrent la page et confirment en un tap. Vous voyez les confirmations en temps réel dans votre tableau de bord.",
  },
  {
    q: "Est-ce que ça fonctionne sur téléphone ?",
    a: "La page est conçue pour mobile en priorité. Vos invités l'ouvriront depuis WhatsApp — elle est parfaite sur tous les écrans.",
  },
  {
    q: "Que se passe-t-il après le mariage ?",
    a: "Votre page se transforme en livre d'or. Vos invités peuvent y déposer photos et messages. Vous téléchargez un PDF souvenir de tout.",
  },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MonInvit — Invitations de mariage digitales" },
      {
        name: "description",
        content:
          "Créez en 30 minutes une invitation de mariage digitale élégante — RSVP, programme et partage WhatsApp intégrés. Pensée pour l'Afrique de l'Ouest.",
      },
      { property: "og:title", content: "MonInvit — Invitations de mariage digitales" },
      {
        property: "og:description",
        content:
          "Créez en 30 minutes une invitation de mariage digitale élégante — RSVP, programme et partage WhatsApp intégrés.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://moninvit.com/" },
      { property: "og:image", content: OG_IMAGE_URL },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "MonInvit.com — Invitations de mariage digitales pour l'Afrique de l'Ouest" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "MonInvit — Invitations de mariage digitales" },
      {
        name: "twitter:description",
        content:
          "Créez en 30 minutes une invitation de mariage digitale élégante — RSVP, programme et partage WhatsApp intégrés.",
      },
      { name: "twitter:image", content: OG_IMAGE_URL },
    ],
    links: [{ rel: "canonical", href: "https://moninvit.com/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "MonInvit.com",
          url: "https://moninvit.com",
          inLanguage: "fr",
          description:
            "Invitations de mariage digitales pour l'Afrique de l'Ouest — RSVP en direct, partage WhatsApp, tableau de bord privé.",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          serviceType: "Invitations de mariage digitales",
          provider: { "@type": "Organization", name: "MonInvit.com", url: "https://moninvit.com" },
          areaServed: [
            "Côte d'Ivoire", "Sénégal", "Bénin", "Togo", "Mali",
            "Burkina Faso", "Guinée", "Niger",
          ],
          offers: {
            "@type": "Offer",
            priceCurrency: "XOF",
            price: "19900",
            availability: "https://schema.org/InStock",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: HOME_FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: Landing,
});

/* -------------------------------------------------------------------------- */
/*                                    PAGE                                    */
/* -------------------------------------------------------------------------- */

function Landing() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#faf8f5] text-[#1a1a1a] font-[var(--font-sans)]">
      <SharedSiteHeader />
      <Hero />
      <StatsStrip />
      <Testimonials />
      <Features />
      <Steps />
      <ThemesPreview />
      <EditorialCouple />
      <Pricing />
      <Guarantee />
      <Faq />
      <FinalCta />
      <SharedSiteFooter />
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    HERO                                    */
/* -------------------------------------------------------------------------- */

function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(1200px 600px at 50% -10%, #f6d9cb 0%, #faf8f5 60%, #faf8f5 100%)",
        }}
      />
      <div className="mx-auto grid max-w-6xl gap-10 px-5 pt-12 pb-6 md:grid-cols-2 md:items-center md:pt-20 md:pb-12">
        <div className="text-center md:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#e8c5b6]/70 bg-[#fbeaf0]/80 px-4 py-1.5 text-[12px] font-medium text-[#7a2440] shadow-sm backdrop-blur-sm">
            <span aria-hidden>✦</span> Déjà +400 couples en Côte d'Ivoire
          </span>

          <h1 className="mt-5 font-[family-name:var(--font-display)] text-[36px] leading-[1.05] text-[#1a1a1a] sm:text-5xl md:text-[52px]">
            Votre mariage mérite{" "}
            <em className="italic text-[#993556]">une invitation à la hauteur.</em>
          </h1>

          <p className="mx-auto mt-5 max-w-[520px] text-[16px] leading-relaxed text-[#6b6b6b] md:mx-0 md:text-[18px]">
            Créez en 30 minutes une page d'invitation personnalisée que vos invités
            recevront sur WhatsApp — avec RSVP, programme et compte à rebours intégrés.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 md:items-start">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center rounded-full bg-[#4b1528] px-7 py-3.5 text-[15px] font-medium text-[#fbeaf0] shadow-lg shadow-[#4b1528]/20 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Créer mon invitation gratuitement →
            </Link>
            <p className="text-xs text-[#8a6a5e]">
              ✓ Aucune carte bancaire requise · Publication à partir de 19 900 FCFA
            </p>
          </div>
        </div>

        <div className="relative">
          <TemplateFan />
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                STATS STRIP                                 */
/* -------------------------------------------------------------------------- */

function StatsStrip() {
  const items = [
    ["30 min", "Pour créer votre page"],
    ["15", "Thèmes élégants"],
    ["4 étapes", "Dot, civil, religieux, réception"],
    ["0 stress", "RSVP automatiques"],
  ];
  return (
    <section className="border-y border-[#e5e5e5] bg-white">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 px-5 py-10 text-center sm:grid-cols-4">
        {items.map(([n, l]) => (
          <div key={l}>
            <p className="font-[family-name:var(--font-display)] text-3xl italic text-[#993556] sm:text-4xl">
              {n}
            </p>
            <p className="mt-1 text-xs text-[#6b6b6b] sm:text-sm">{l}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                TESTIMONIALS                                */
/* -------------------------------------------------------------------------- */

const TESTIMONIALS = [
  {
    initials: "A&K",
    quote:
      "Nos invités ont adoré recevoir le lien sur WhatsApp. La page était tellement belle qu'ils ont tous pensé qu'on avait payé un designer.",
    author: "Adjoua & Koffi",
    context: "Mariage à Abidjan · Mars 2026",
  },
  {
    initials: "M&S",
    quote:
      "En 20 minutes, notre page était prête. On a partagé le lien pour la dot ET la réception, avec deux programmes différents. Incroyable.",
    author: "Mariama & Seydou",
    context: "Mariage à Bouaké · Janvier 2026",
  },
  {
    initials: "C&A",
    quote:
      "Le compte à rebours sur la page rendait nos invités impatients. Plusieurs nous ont dit que c'était l'invitation la plus élégante qu'ils avaient vue.",
    author: "Christelle & Arnaud",
    context: "Mariage à Abidjan · Avril 2026",
  },
];

function Testimonials() {
  return (
    <section className="bg-[#faf8f5] py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#993556]">
            Témoignages
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl italic sm:text-5xl">
            Ils ont dit oui à <em className="text-[#993556]">MonInvit.</em>
          </h2>
        </div>

        <div className="mt-12 -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0">
          {TESTIMONIALS.map((t) => (
            <article
              key={t.author}
              className="flex min-w-[85%] shrink-0 snap-center flex-col rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-sm md:min-w-0"
            >
              <div className="flex items-center gap-1 text-[#c9a84c]" aria-label="5 étoiles sur 5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} viewBox="0 0 20 20" fill="currentColor" className="size-3.5">
                    <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.9L10 14.9l-5.3 2.8 1-5.9L1.5 7.7l5.9-.9L10 1.5z" />
                  </svg>
                ))}
              </div>
              <p className="mt-4 flex-1 font-[family-name:var(--font-display)] text-[17px] italic leading-relaxed text-[#1a1a1a]">
                « {t.quote} »
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-[#e5e5e5] pt-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#fbeaf0] font-[family-name:var(--font-display)] text-sm italic text-[#993556]">
                  {t.initials}
                </span>
                <div>
                  <p className="text-sm font-medium text-[#1a1a1a]">— {t.author}</p>
                  <p className="text-xs text-[#6b6b6b]">{t.context}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-8 text-center text-[13px] text-[#6b6b6b]">
          Rejoignez +400 couples qui ont choisi MonInvit
        </p>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  FEATURES                                  */
/* -------------------------------------------------------------------------- */

const FEATURES = [
  {
    icon: "♪",
    eyebrow: "Musique d'ambiance",
    title: "Une ambiance qui se ressent dès l'ouverture",
    desc: "Choisissez parmi 26 musiques de mariage soigneusement composées. Dès que vos invités ouvrent votre page, la mélodie les plonge dans l'émotion du moment.",
  },
  {
    icon: "✓",
    eyebrow: "RSVP en temps réel",
    title: "Fini les appels pour confirmer",
    desc: "Chaque invité confirme en un tap. Vous voyez en direct combien viendront à la dot, au civil, à la réception — séparément.",
  },
  {
    icon: "◈",
    eyebrow: "WhatsApp natif",
    title: "Partagé là où tout le monde est déjà",
    desc: "Un lien, un message pré-rempli. Votre famille reçoit l'invitation sur WhatsApp comme un message ordinaire — et clique immédiatement.",
  },
  {
    icon: "✦",
    eyebrow: "Multi-cérémonies",
    title: "Dot, civil, réception — tout en un",
    desc: "Ajoutez chaque étape avec ses détails, son lieu, son dress code. Chaque invité voit uniquement les cérémonies auxquelles il est convié.",
  },
];

function Features() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#993556]">
            Tout ce qu'il vous faut
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl font-[family-name:var(--font-display)] text-4xl leading-[1.05] sm:text-5xl">
            Pour rendre votre invitation{" "}
            <em className="italic text-[#993556]">inoubliable.</em>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] text-[#6b6b6b]">
            Tout ce dont vous avez besoin, sans rien de superflu.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <article
              key={f.title}
              className="group rounded-2xl border border-[#e5e5e5] bg-[#faf8f5] p-6 transition hover:-translate-y-1 hover:shadow-lg sm:p-8"
            >
              <span className="grid size-11 place-items-center rounded-full bg-[#fbeaf0] font-[family-name:var(--font-display)] text-xl italic text-[#993556]">
                {f.icon}
              </span>
              <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.28em] text-[#993556]">
                {f.eyebrow}
              </p>
              <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl italic leading-tight text-[#1a1a1a]">
                {f.title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-[#6b6b6b]">
                {f.desc}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   STEPS                                    */
/* -------------------------------------------------------------------------- */

const STEPS = [
  { n: "1", t: "Vos prénoms", d: "Entrez vos infos en 2 minutes." },
  { n: "2", t: "Vos dates", d: "Mariage, dot, civil, réception." },
  { n: "3", t: "Votre ambiance", d: "Choisissez parmi 15 thèmes élégants." },
  { n: "4", t: "Partagez", d: "Lien WhatsApp en un tap." },
];

function Steps() {
  return (
    <section className="bg-[#faf8f5] py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#993556]">
            Comment ça marche
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl italic sm:text-5xl">
            Prêt à partager en <em className="text-[#993556]">4 étapes.</em>
          </h2>
        </div>

        <div className="relative mt-14">
          <div
            aria-hidden
            className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-[#e5c5b6] to-transparent md:block"
          />
          <ol className="relative grid gap-8 sm:grid-cols-2 md:grid-cols-4 md:gap-6">
            {STEPS.map((s) => (
              <li key={s.n} className="text-center">
                <div className="mx-auto grid size-12 place-items-center rounded-full border border-[#993556] bg-white font-[family-name:var(--font-display)] text-lg italic text-[#993556] shadow-sm">
                  {s.n}
                </div>
                <p className="mt-4 font-[family-name:var(--font-display)] text-xl italic text-[#1a1a1a]">
                  {s.t}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[#6b6b6b]">
                  {s.d}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/signup"
            className="inline-flex items-center justify-center rounded-full bg-[#4b1528] px-7 py-3.5 text-[15px] font-medium text-[#fbeaf0] shadow-lg shadow-[#4b1528]/20 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            Commencer maintenant — c'est gratuit →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                              THEMES PREVIEW                                */
/* -------------------------------------------------------------------------- */

function ThemesPreview() {
  const themes = templateOrder.slice(0, 6).map((id) => ({ id, ...templateMeta[id] }));
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#993556]">
            Choix des thèmes
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl italic sm:text-5xl">
            15 thèmes. Un seul qui est <em className="text-[#993556]">le vôtre.</em>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] text-[#6b6b6b]">
            Du classique élégant aux motifs wax ivoiriens — personnalisez les couleurs
            selon votre mariage.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3">
          {themes.map((t) => (
            <div key={t.id} className="text-center">
              <div className="mx-auto aspect-[3/4] w-full overflow-hidden rounded-xl border border-[#e5e5e5] shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <MiniTemplateCard meta={t} />
              </div>
              <p className="mt-3 font-[family-name:var(--font-display)] text-base italic text-[#1a1a1a]">
                {t.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/signup"
            className="inline-flex items-center gap-1 text-sm font-medium text-[#993556] hover:underline"
          >
            Voir tous les thèmes →
          </Link>
        </div>
      </div>
    </section>
  );
}

function MiniTemplateCard({
  meta,
}: {
  meta: { label: string; swatch: string[] };
}) {
  const [bg, accent1, accent2, ink] = meta.swatch;
  return (
    <div className="flex h-full w-full flex-col" style={{ backgroundColor: bg, color: ink }}>
      <div className="flex items-center justify-between px-3 pt-3">
        <span className="font-mono text-[7px] uppercase tracking-[0.25em]" style={{ color: ink, opacity: 0.6 }}>
          Save the date
        </span>
        <span className="size-1 rounded-full" style={{ backgroundColor: accent2 }} />
      </div>
      <div
        className="mx-3 mt-2 flex-1 rounded-sm"
        style={{ background: `linear-gradient(140deg, ${accent1} 0%, ${accent2} 55%, ${ink} 100%)` }}
      />
      <div className="px-3 py-3 text-center">
        <p className="font-[family-name:var(--font-display)] text-[16px] italic leading-none" style={{ color: ink }}>
          Aïcha
        </p>
        <p className="my-0.5 font-[family-name:var(--font-display)] text-[9px] italic" style={{ color: accent2 }}>
          &
        </p>
        <p className="font-[family-name:var(--font-display)] text-[16px] italic leading-none" style={{ color: ink }}>
          Loïc
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            EDITORIAL COUPLE                                */
/* -------------------------------------------------------------------------- */

function EditorialCouple() {
  return (
    <section className="bg-[#faf8f5] py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid items-center gap-12 md:grid-cols-5">
          <div className="md:col-span-3">
            <img
              src={heroCouple}
              alt="Couple mariés à Abidjan"
              width={1024}
              height={1024}
              loading="lazy"
              className="aspect-[5/4] w-full rounded-[2rem] object-cover shadow-xl shadow-[#993556]/15"
            />
          </div>
          <div className="md:col-span-2">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#993556]">
              Chaque couple est unique
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl italic leading-[1.05] sm:text-[36px]">
              Chaque mariage <br />
              a sa propre <em className="text-[#993556]">histoire.</em>
            </h2>
            <p className="mt-6 text-[15px] leading-relaxed text-[#6b6b6b]">
              MonInvit comprend vos besoins. Que vous célébriez une dot intime ou une
              réception à l'église, le civil en mairie ou le dîner de gala — votre
              programme, votre page, vos invités. Tout en un.
            </p>
            <Link
              to="/signup"
              className="mt-8 inline-flex items-center rounded-full bg-[#4b1528] px-7 py-3.5 text-[15px] font-medium text-[#fbeaf0] shadow-lg shadow-[#4b1528]/20 transition hover:-translate-y-0.5"
            >
              Créer ma page →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  PRICING                                   */
/* -------------------------------------------------------------------------- */

function Pricing() {
  const includes = [
    "Page d'invitation publique",
    "Lien personnalisé + QR code",
    "RSVP illimités",
    "Toutes vos étapes (dot, civil, religieux, réception)",
    "Musique d'ambiance (26 titres)",
    "Compte à rebours automatique",
    "Livre d'or après le mariage",
    "Accès à vie",
  ];
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-4xl px-5">
        <div className="text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#993556]">
            Tarif
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl italic sm:text-5xl">
            Simple. Transparent. <em className="text-[#993556]">Sans surprise.</em>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] text-[#6b6b6b]">
            Vous créez gratuitement. Vous payez uniquement quand vous publiez.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-2xl overflow-hidden rounded-3xl border border-[#e5c5b6] bg-[#faf8f5] shadow-xl shadow-[#993556]/10">
          <div className="border-b border-[#e5e5e5] bg-white px-8 py-8 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#993556]">
              Formule unique
            </p>
            <p className="mt-4 font-[family-name:var(--font-display)] text-6xl italic text-[#1a1a1a]">
              19 900 <span className="text-3xl not-italic">XOF</span>
            </p>
            <p className="mt-2 text-sm text-[#6b6b6b]">
              Paiement unique à la publication
            </p>
          </div>

          <ul className="grid gap-3 px-8 py-8 sm:grid-cols-2">
            {includes.map((i) => (
              <li key={i} className="flex items-start gap-3 text-[14px] text-[#1a1a1a]">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#fbeaf0] text-[11px] font-bold text-[#993556]">
                  ✓
                </span>
                {i}
              </li>
            ))}
          </ul>

          <div className="border-t border-[#e5e5e5] bg-white px-8 py-8 text-center">
            <Link
              to="/signup"
              className="inline-flex w-full items-center justify-center rounded-full bg-[#4b1528] px-7 py-3.5 text-[15px] font-medium text-[#fbeaf0] shadow-lg shadow-[#4b1528]/20 transition hover:-translate-y-0.5 sm:w-auto"
            >
              Commencer gratuitement →
            </Link>
            <p className="mt-4 text-xs text-[#6b6b6b]">
              Payé par Wave, Orange Money, MTN, Moov ou carte bancaire
            </p>
          </div>
        </div>

        <p className="mx-auto mt-6 max-w-xl text-center text-[13px] italic text-[#6b6b6b]">
          Vous créez, vous prévisualisez, vous partagez — vous ne payez que quand vous êtes prêt.
        </p>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 GUARANTEE                                  */
/* -------------------------------------------------------------------------- */

function Guarantee() {
  return (
    <section className="bg-[#faf8f5] py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-5">
        <div className="relative overflow-hidden rounded-[2rem] border border-[#e5c5b6]/60 bg-white p-8 text-center shadow-sm sm:p-14">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 font-[family-name:var(--font-display)] text-[140px] italic text-[#993556]/10"
          >
            ♡
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#993556]">
            Notre promesse
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl italic leading-[1.15] sm:text-4xl">
            Vous ne partagerez votre invitation que{" "}
            <em className="text-[#993556]">le jour où elle vous libère.</em>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-[#6b6b6b]">
            Pas de précipitation, pas de deadline artificielle. Prenez le temps de
            tout peaufiner, de choisir votre thème, d'ajuster vos listes. Tout est
            sauvegardé automatiquement. Vous ne publiez — et ne payez — que lorsque
            vous êtes pleinement satisfait.
          </p>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    FAQ                                     */
/* -------------------------------------------------------------------------- */

function Faq() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-5">
        <div className="text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#993556]">
            Vos questions
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl italic sm:text-5xl">
            Tout ce qu'on nous <em className="text-[#993556]">demande.</em>
          </h2>
        </div>
        <div className="mt-12 divide-y divide-[#e5e5e5] border-y border-[#e5e5e5]">
          {HOME_FAQS.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6">
                <span className="font-[family-name:var(--font-display)] text-lg italic text-[#1a1a1a] sm:text-xl">
                  {f.q}
                </span>
                <span className="mt-1 shrink-0 font-mono text-lg text-[#993556] transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 pr-8 text-[15px] leading-relaxed text-[#6b6b6b]">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 FINAL CTA                                  */
/* -------------------------------------------------------------------------- */

function FinalCta() {
  return (
    <section className="relative isolate overflow-hidden bg-[#2d0d16] text-[#fbeaf0]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-70"
        style={{
          background:
            "radial-gradient(600px 300px at 15% 0%, rgba(153,53,86,0.35) 0%, transparent 60%), radial-gradient(700px 350px at 90% 100%, rgba(251,234,240,0.08) 0%, transparent 65%)",
        }}
      />
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <h2 className="font-[family-name:var(--font-display)] text-4xl italic leading-[1.05] text-white sm:text-5xl md:text-[40px]">
          Faisons de votre <em className="text-[#e8a89e]">« oui »</em>
          <br />
          un souvenir partagé.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-[16px] leading-relaxed text-white/70">
          Rejoignez les centaines de couples qui ont fait confiance à MonInvit pour
          leur plus beau jour.
        </p>
        <Link
          to="/signup"
          className="mt-10 inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-[15px] font-medium text-[#4b1528] shadow-xl transition hover:-translate-y-0.5"
        >
          Créer mon invitation gratuitement →
        </Link>
        <p className="mt-4 text-xs text-white/60">
          ✓ Gratuit jusqu'à la publication · ✓ Aucune carte requise
        </p>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                              TEMPLATE FAN                                  */
/* -------------------------------------------------------------------------- */

function TemplateFan() {
  const cards = templateOrder.map((id) => ({ id, ...templateMeta[id] }));
  const arranged = [cards[1], cards[3], cards[0], cards[2], cards[4]];
  const layout = [
    { rot: -14, x: -180, y: 40, z: 1, scale: 0.78 },
    { rot: -7, x: -90, y: 18, z: 2, scale: 0.88 },
    { rot: 0, x: 0, y: 0, z: 3, scale: 1 },
    { rot: 7, x: 90, y: 18, z: 2, scale: 0.88 },
    { rot: 14, x: 180, y: 40, z: 1, scale: 0.78 },
  ];

  return (
    <div className="relative mx-auto h-[360px] w-full max-w-xl overflow-hidden sm:h-[460px]">
      <div className="absolute left-1/2 top-0 h-full w-full origin-top -translate-x-1/2 scale-[0.6] sm:scale-90">
        {arranged.map((c, i) => {
          const l = layout[i];
          return (
            <div
              key={c.id}
              className="absolute left-1/2 top-1/2 origin-bottom transition-transform duration-500 hover:-translate-y-2"
              style={{
                zIndex: l.z,
                transform: `translate(-50%, -50%) translate(${l.x}px, ${l.y}px) rotate(${l.rot}deg) scale(${l.scale})`,
              }}
            >
              <TemplateCard meta={c} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TemplateCard({
  meta,
}: {
  meta: { label: string; tagline: string; swatch: string[] };
}) {
  const [bg, accent1, accent2, ink] = meta.swatch;
  return (
    <div
      className="relative flex h-[340px] w-[210px] flex-col overflow-hidden rounded-[18px] shadow-[0_20px_60px_-20px_rgba(75,32,20,0.35)] ring-1 ring-black/5 sm:h-[420px] sm:w-[260px]"
      style={{ backgroundColor: bg, color: ink }}
    >
      <div className="flex items-center justify-between px-4 pt-4">
        <span className="font-mono text-[8px] uppercase tracking-[0.25em]" style={{ color: ink, opacity: 0.6 }}>
          Save the date
        </span>
        <span className="size-1.5 rounded-full" style={{ backgroundColor: accent2 }} />
      </div>
      <div
        className="mx-4 mt-3 flex-1 rounded-md"
        style={{ background: `linear-gradient(140deg, ${accent1} 0%, ${accent2} 55%, ${ink} 100%)` }}
      />
      <div className="px-4 py-4 text-center">
        <p className="font-[family-name:var(--font-display)] text-[24px] italic leading-none sm:text-[28px]" style={{ color: ink }}>
          Aïcha
        </p>
        <p className="my-0.5 font-[family-name:var(--font-display)] text-xs italic" style={{ color: accent2 }}>
          &
        </p>
        <p className="font-[family-name:var(--font-display)] text-[24px] italic leading-none sm:text-[28px]" style={{ color: ink }}>
          Loïc
        </p>
        <div className="mx-auto my-3 h-px w-8" style={{ backgroundColor: accent2 }} />
        <p className="font-mono text-[8px] uppercase tracking-[0.3em]" style={{ color: ink, opacity: 0.7 }}>
          14 · 08 · 2027 · Abidjan
        </p>
      </div>
      <div
        className="border-t px-4 py-2 text-center font-mono text-[8px] uppercase tracking-[0.25em]"
        style={{ borderColor: `${ink}22`, color: ink, opacity: 0.6 }}
      >
        {meta.label}
      </div>
    </div>
  );
}
