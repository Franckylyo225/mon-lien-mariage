import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { templateMeta, templateOrder } from "@/lib/ceremony-meta";
import {
  SiteHeader,
  SiteFooter,
  MobileStickyCta,
} from "@/components/site/SiteChrome";
import ogImage from "@/assets/og-image.jpg.asset.json";
import logoHeart from "@/assets/logo-heart.png.asset.json";
import apercuInvitation from "@/assets/apercu-invitation.png.asset.json";
import apercuSplash from "@/assets/apercu-splash.png";

const OG_IMAGE_URL = `https://moninvit.com${ogImage.url}`;
const DEMO_URL = "https://www.moninvit.com/e/basile-et-armelle1";

const HOME_FAQS: { q: string; a: string }[] = [
  {
    q: "Combien de temps pour créer mon invitation ?",
    a: "Entre 10 et 30 minutes pour une première version complète. Tout est sauvegardé automatiquement, tu peux revenir l'affiner quand tu veux.",
  },
  {
    q: "Nos invités doivent-ils créer un compte ?",
    a: "Non, jamais. Ils ouvrent le lien, lisent l'invitation, confirment en un tap. Ni téléchargement, ni inscription.",
  },
  {
    q: "Quand dois-je payer ?",
    a: "Uniquement à la publication, quand tu es prêt à partager. Tu crées, testes et modifies gratuitement.",
  },
  {
    q: "Est-ce que ça fonctionne sur les vieux téléphones ?",
    a: "Oui. La page est légère et s'ouvre en quelques secondes, même en 3G — pensée pour la réalité africaine.",
  },
  {
    q: "Le livre d'or est-il inclus ?",
    a: "Le livre d'or est une option à 1 990 XOF, activable avant ou après la publication depuis ton tableau de bord.",
  },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "moninvit.com — Ton invitation de mariage en 10 minutes" },
      {
        name: "description",
        content:
          "Crée une invitation de mariage élégante avec RSVP, programme et musique. Partage-la sur WhatsApp — tes invités confirment en un tap.",
      },
      { property: "og:title", content: "moninvit.com — Ton invitation de mariage en 10 minutes" },
      {
        property: "og:description",
        content:
          "Crée une invitation de mariage élégante avec RSVP, programme et musique. Partage-la sur WhatsApp.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://moninvit.com/" },
      { property: "og:image", content: OG_IMAGE_URL },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "moninvit.com — Invitations de mariage digitales" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "moninvit.com — Ton invitation de mariage en 10 minutes" },
      {
        name: "twitter:description",
        content:
          "Crée une invitation de mariage élégante avec RSVP, programme et musique. Partage-la sur WhatsApp.",
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
          name: "moninvit.com",
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

function Landing() {
  return (
    <div className="min-h-dvh overflow-x-clip bg-white text-[#201A1C]">
      <SiteHeader />
      <main id="main">
        <Hero />
        <SocialProof />
        <ProblemSection />
        <Features />
        <LiveDemo />
        <HowItWorks />
        <TemplateGallery />
        <Pricing />
        <Testimonials />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
      <MobileStickyCta />
    </div>
  );
}

/* ------------------------------- primitives ------------------------------- */

function Kicker({ children }: { children: React.ReactNode }) {
  return <p className="kicker">{children}</p>;
}

function H2({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h2
      className={`font-[family-name:var(--font-brand-serif)] text-[34px] font-medium leading-[1.08] text-[#201A1C] sm:text-[46px] ${className}`}
    >
      {children}
    </h2>
  );
}

function Body({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`font-[family-name:var(--font-brand-body)] text-[15px] leading-[1.7] text-[#5A4F52] ${className}`}>
      {children}
    </p>
  );
}

function Stars({ size = "text-[13px]" }: { size?: string }) {
  return (
    <span aria-hidden className={`tracking-[0.12em] text-[#C6A15B] ${size}`}>
      ★★★★★
    </span>
  );
}

function PhoneMock({ height = 420, rotate = 0, className = "" }: { height?: number; rotate?: number; className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-[44px] border-[8px] border-[#201A1C] bg-[#201A1C] shadow-[0_30px_70px_-25px_rgba(32,26,28,0.45)] ${className}`}
      style={{ width: height * 0.49, height, transform: rotate ? `rotate(${rotate}deg)` : undefined }}
    >
      <iframe
        src={DEMO_URL}
        title="Aperçu d'une invitation moninvit"
        loading="lazy"
        tabIndex={-1}
        className="pointer-events-none h-full w-full rounded-[36px] bg-white"
      />
    </div>
  );
}

function HeroPreview() {
  return (
    <div className="relative mx-auto flex w-full max-w-[430px] justify-center pb-6 pr-4 lg:max-w-[460px]">
      {/* écran arrière — page invitation */}
      <img
        src={apercuInvitation.url}
        alt="Aperçu de la page d'invitation de Basile & Armelle"
        loading="lazy"
        className="absolute right-0 top-8 w-[52%] rounded-[26px] object-cover shadow-[0_24px_60px_-24px_rgba(32,26,28,0.4)] ring-1 ring-black/5 sm:top-12"
      />
      {/* écran avant — page d'ouverture */}
      <img
        src={apercuSplash.url}
        alt="Aperçu de l'écran d'ouverture de l'invitation"
        className="animate-floaty relative left-[-14%] w-[58%] rounded-[26px] object-cover shadow-[0_30px_70px_-25px_rgba(32,26,28,0.5)] ring-1 ring-black/5"
      />
    </div>
  );
}


/* ---------------------------------- hero ---------------------------------- */

function Hero() {
  return (
    <section
      className="border-b border-[#F4EFF0]"
      style={{ background: "linear-gradient(170deg, #FDF0F3 0%, #FFFFFF 55%)" }}
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-14 lg:grid-cols-[55fr_45fr] lg:pb-24 lg:pt-20">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#F1E3C6] bg-white px-4 py-2 font-[family-name:var(--font-brand-ui)] text-[13px] font-semibold text-[#5A4F52]">
            <span className="text-[#C6A15B]">★</span> 4.9 · Choisie par +500
            couples ivoiriens
          </span>

          <h1 className="mt-6 font-[family-name:var(--font-brand-serif)] text-[42px] font-medium leading-[1.02] text-[#201A1C] sm:text-[56px] lg:text-[66px]">
            Votre invitation de mariage, prête en moins de 10 minutes.
          </h1>

          <p className="mt-5 max-w-[460px] font-[family-name:var(--font-brand-body)] text-[18px] leading-[1.65] text-[#5A4F52]">
            Crée une page élégante avec RSVP, programme et musique. Partage-la
            sur WhatsApp. Tes invités confirment en un tap.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link to="/signup" className="btn-framboise px-[30px] py-4 text-[16px]">
              Créer gratuitement →
            </Link>
            <a
              href={DEMO_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="font-[family-name:var(--font-brand-ui)] text-[15px] font-semibold text-[#C81A45] hover:underline"
            >
              Voir la démo
            </a>
          </div>

          <p className="mt-4 font-[family-name:var(--font-brand-ui)] text-[13px] font-medium text-[#7A6D70]">
            Aucune carte bancaire · Tu paies uniquement à la publication
          </p>

          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-[#F1E3C6] pt-6">
            {[
              ["20+", "Modèles romantiques"],
              ["10 min", "Pour publier"],
              ["500+", "Couples conquis"],
            ].map(([n, l]) => (
              <div key={l}>
                <dt className="font-[family-name:var(--font-brand-serif)] text-[30px] font-medium text-[#E82050]">
                  {n}
                </dt>
                <dd className="mt-1 font-[family-name:var(--font-brand-ui)] text-[12.5px] font-semibold text-[#5A4F52]">
                  {l}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Aperçus superposés (sans cadre de téléphone) */}
        <HeroPreview />

      </div>
    </section>
  );
}

/* ------------------------------ social proof ------------------------------ */

const QUICK_PROOF = [
  {
    initial: "A",
    quote: "Nos invités ont cru qu'on avait payé un designer.",
    author: "Adjoua & Koffi · Mariage à Abidjan · Mars 2026",
  },
  {
    initial: "M",
    quote:
      "En 20 minutes, le lien était prêt. La réaction de ma belle-mère… inoubliable.",
    author: "Mariama & Seydou · Bouaké · Janvier 2026",
  },
];

function SocialProof() {
  return (
    <section className="border-y border-[#F4EFF0] bg-white py-10">
      <div className="mx-auto grid max-w-5xl gap-8 px-5 md:grid-cols-2 md:divide-x md:divide-[#F4EFF0]">
        {QUICK_PROOF.map((t, i) => (
          <div key={t.initial} className={i === 1 ? "md:pl-8" : ""}>
            <Stars />
            <blockquote className="mt-2 font-[family-name:var(--font-brand-serif)] text-[15px] italic leading-relaxed text-[#201A1C]">
              « {t.quote} »
            </blockquote>
            <div className="mt-3 flex items-center gap-3">
              <span className="grid size-[38px] shrink-0 place-items-center rounded-full bg-[#FBDDE5] font-[family-name:var(--font-brand-ui)] text-sm font-bold text-[#E82050]">
                {t.initial}
              </span>
              <p className="font-[family-name:var(--font-brand-ui)] text-[11px] font-medium text-[#7A6D70]">
                — {t.author}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------- problem --------------------------------- */

const PROBLEMS = [
  "Tu gères les confirmations à la main, dans un tableau ou dans ta tête.",
  "Tes cartons papier ont coûté une fortune et la moitié des invités les ont déjà perdus.",
  "Trois groupes WhatsApp selon les cérémonies, et tu as perdu le fil.",
  "Tes invités demandent encore : « C'est à quelle heure, la dot ? »",
];

function ProblemSection() {
  return (
    <section className="bg-[#FBF8F8] py-20">
      <div className="mx-auto max-w-5xl px-5">
        <Kicker>Tu connais cette situation ?</Kicker>
        <H2 className="mt-4 max-w-xl">C'est souvent comme ça que ça se passe.</H2>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {PROBLEMS.map((p) => (
            <div
              key={p}
              className="flex gap-4 rounded-2xl border border-[#F4EFF0] bg-white p-6"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#FFF0F0] text-sm text-[#D33A3A]">
                ✕
              </span>
              <Body className="text-sm!">{p}</Body>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center font-[family-name:var(--font-brand-serif)] text-[22px] italic text-[#E82050]">
          moninvit règle tout ça. En une page.
        </p>
      </div>
    </section>
  );
}

/* -------------------------------- features -------------------------------- */

const FEATURES = [
  ["💌", "Confirmations en un tap", "Tes invités répondent directement depuis leur téléphone. Tu vois tout en temps réel."],
  ["📅", "Dot, civil, réception — tout en un", "Chaque invité voit uniquement les cérémonies auxquelles tu le convies."],
  ["🎵", "Une ambiance dès l'ouverture", "26 musiques ou ta propre chanson. La mélodie commence dès l'ouverture."],
  ["📖", "Livre d'or numérique", "Tes invités te laissent un message. Tu télécharges un souvenir imprimable."],
  ["⏱", "Compte à rebours", "L'impatience de tes invités grandit à chaque seconde qui passe."],
  ["🔗", "Lien WhatsApp en un tap", "Un lien. Un message. Ta famille l'ouvre instantanément."],
];

function Features() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <Kicker>Tout ce qu'il te faut</Kicker>
            <H2 className="mt-4">Pour rendre ton invitation inoubliable.</H2>
          </div>
          <Body className="self-end md:max-w-md">
            Chaque détail a été pensé pour les mariages ivoiriens : plusieurs
            cérémonies, familles nombreuses, partage sur WhatsApp.
          </Body>
        </div>

        <div className="mt-12 grid border-t border-l border-[#E7DFE1] sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(([icon, title, desc]) => (
            <div key={title} className="border-b border-r border-[#E7DFE1] p-8">
              <span className="text-2xl" aria-hidden>{icon}</span>
              <h3 className="mt-4 font-[family-name:var(--font-brand-serif)] text-[22px] font-medium text-[#201A1C]">
                {title}
              </h3>
              <Body className="mt-2 text-sm!">{desc}</Body>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- live demo ------------------------------- */

function LiveDemo() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto grid max-w-5xl items-center gap-14 px-5 md:grid-cols-2">
        <div className="flex flex-col items-center">
          <PhoneMock height={480} />
          <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#201A1C] px-4 py-2 font-[family-name:var(--font-brand-ui)] text-xs font-semibold text-white">
            <span className="size-1.5 rounded-full bg-[#2E9E6B]" /> En ligne ·
            Basile & Armelle
          </span>
        </div>

        <div>
          <Kicker>Démonstration en direct</Kicker>
          <h2 className="mt-4 font-[family-name:var(--font-brand-serif)] text-[32px] font-medium leading-[1.1] text-[#201A1C] sm:text-[40px]">
            Voici ce que reçoivent tes invités.
          </h2>
          <Body className="mt-4">
            Une page élégante qui s'ouvre directement sur WhatsApp. Avec leur
            photo, leur musique, leur programme.
          </Body>
          <a
            href={DEMO_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-6 inline-block font-[family-name:var(--font-brand-ui)] text-[15px] font-semibold text-[#C81A45] hover:underline"
          >
            Voir la page de Basile & Armelle →
          </a>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ how it works ------------------------------ */

const STEPS = [
  ["Tes prénoms", "Les bases de ton invitation", "2 min"],
  ["Tes cérémonies", "Dot, civil, réception…", "5 min"],
  ["Ton modèle", "Parmi 20+ designs", "3 min"],
  ["Partage", "Lien WhatsApp en un tap", "Maintenant"],
];

function HowItWorks() {
  return (
    <section className="bg-[#FBF8F8] py-24">
      <div className="mx-auto max-w-5xl px-5 text-center">
        <Kicker>En 4 étapes</Kicker>
        <H2 className="mx-auto mt-4 max-w-2xl">
          Prêt à partager en moins de 10 minutes.
        </H2>

        <div className="relative mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div
            aria-hidden
            className="absolute left-[12%] right-[12%] top-[18px] hidden h-px bg-[#F1E3C6] lg:block"
          />
          {STEPS.map(([title, desc, dur], i) => (
            <div key={title} className="relative flex flex-col items-center">
              <span className="grid size-9 place-items-center rounded-full bg-[#E82050] font-[family-name:var(--font-brand-ui)] text-sm font-bold text-white">
                {i + 1}
              </span>
              <h3 className="mt-4 font-[family-name:var(--font-brand-ui)] text-[15px] font-bold text-[#201A1C]">
                {title}
              </h3>
              <Body className="mt-1 text-sm!">{desc}</Body>
              <span className="mt-3 rounded-full bg-[#F1E3C6] px-3 py-1 font-[family-name:var(--font-brand-ui)] text-[11px] font-semibold text-[#8a6a2c]">
                {dur}
              </span>
            </div>
          ))}
        </div>

        <Link to="/signup" className="btn-framboise mt-14 px-8 py-4 text-[15px]">
          Créer mon invitation gratuitement →
        </Link>
      </div>
    </section>
  );
}

/* ----------------------------- template gallery --------------------------- */

const GALLERY_NAMES = [
  "Basile & Armelle",
  "Adjoua & Koffi",
  "Mariama & Seydou",
  "Chloé & Ange",
  "Nadia & Yao",
];

function TemplateGallery() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-5 text-center">
        <Kicker>Nos modèles</Kicker>
        <H2 className="mt-4">20 modèles. Un seul qui te ressemble.</H2>
        <Body className="mx-auto mt-4 max-w-xl">
          Du classique élégant aux motifs ivoiriens — personnalise les couleurs
          et la typographie.
        </Body>

        <div className="mt-12 flex snap-x gap-5 overflow-x-auto pb-4">
          {templateOrder.map((id, i) => {
            const t = templateMeta[id];
            return (
              <figure key={id} className="w-[200px] shrink-0 snap-start text-left">
                <div
                  className="grid h-[280px] place-items-center overflow-hidden rounded-2xl px-4 text-center"
                  style={{ background: t.swatch[0], border: `1px solid ${t.swatch[1]}` }}
                >
                  <div>
                    <p
                      className="font-[family-name:var(--font-brand-serif)] text-[22px] italic"
                      style={{ color: t.swatch[3] }}
                    >
                      {GALLERY_NAMES[i % GALLERY_NAMES.length]}
                    </p>
                    <span
                      aria-hidden
                      className="mx-auto mt-3 block h-px w-10"
                      style={{ background: t.swatch[2] }}
                    />
                    <p
                      className="mt-3 font-[family-name:var(--font-brand-ui)] text-[10px] font-semibold uppercase tracking-[0.2em]"
                      style={{ color: t.swatch[2] }}
                    >
                      Save the date
                    </p>
                  </div>
                </div>
                <figcaption className="mt-3 font-[family-name:var(--font-brand-ui)] text-[13px] font-semibold text-[#201A1C]">
                  {t.label}
                  <span className="block font-medium text-[#7A6D70]">{t.tagline}</span>
                </figcaption>
              </figure>
            );
          })}
        </div>

        <Link
          to="/signup"
          className="inline-block font-[family-name:var(--font-brand-ui)] text-[15px] font-semibold text-[#C81A45] hover:underline"
        >
          Voir tous les modèles →
        </Link>
      </div>
    </section>
  );
}

/* --------------------------------- pricing -------------------------------- */

const INCLUDED = [
  "Page publique et partageable sur WhatsApp",
  "Lien personnalisé moninvit.com/e/vos-prénoms",
  "QR code à imprimer",
  "RSVP illimités · tableau de bord",
  "Toutes vos cérémonies (dot, civil…)",
  "Musique d'ambiance (26 titres)",
  "Compte à rebours automatique",
  "Accès à vie",
];

function Pricing() {
  return (
    <section id="tarifs" className="scroll-mt-24 bg-[#FBF8F8] py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="text-center">
          <Kicker>Tarification</Kicker>
          <H2 className="mt-4">Simple. Transparent. Sans surprise.</H2>
          <Body className="mx-auto mt-4 max-w-xl">
            Tu crées gratuitement. Tu paies uniquement quand tu publies.
          </Body>
        </div>

        <div className="mt-14 grid items-start gap-14 lg:grid-cols-2">
          <div className="hidden flex-col items-center lg:flex lg:sticky lg:top-[100px]">
            <PhoneMock height={480} />
            <a
              href={DEMO_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-6 font-[family-name:var(--font-brand-ui)] text-[14px] font-semibold text-[#C81A45] hover:underline"
            >
              Voir la page complète →
            </a>
          </div>

          <div>
            <div className="rounded-[20px] border border-[#F4EFF0] bg-white p-8 shadow-[0_20px_50px_-30px_rgba(32,26,28,0.35)]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="kicker">Formule unique</p>
                  <p className="mt-1 font-[family-name:var(--font-brand-body)] text-sm text-[#5A4F52]">
                    Publication complète
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-[family-name:var(--font-brand-serif)] text-[34px] font-medium text-[#201A1C]">
                    24 900 <span className="text-[18px]">XOF</span>
                  </p>
                  <p className="font-[family-name:var(--font-brand-ui)] text-[12px] font-medium text-[#7A6D70]">
                    Paiement unique
                  </p>
                </div>
              </div>

              <div aria-hidden className="my-6 h-px bg-[#F1E3C6]" />

              <ul className="flex flex-col gap-3">
                {INCLUDED.map((f) => (
                  <li key={f} className="flex gap-3">
                    <span className="text-[#2E9E6B]" aria-hidden>✓</span>
                    <span className="font-[family-name:var(--font-brand-body)] text-[14px] text-[#5A4F52]">
                      {f}
                    </span>
                  </li>
                ))}
                <li className="flex gap-3">
                  <span className="text-[#C6A15B]" aria-hidden>┄</span>
                  <span className="font-[family-name:var(--font-brand-body)] text-[14px] text-[#7A6D70]">
                    Livre d'or · + 1 990 XOF (option)
                  </span>
                </li>
              </ul>

              <Link to="/signup" className="btn-framboise mt-8 w-full px-6 py-4 text-[15px]">
                Créer mon invitation gratuitement →
              </Link>

              <p className="mt-4 text-center font-[family-name:var(--font-brand-ui)] text-[12px] font-medium text-[#7A6D70]">
                Wave · Orange Money · MTN · Moov · Carte
              </p>
            </div>

            <div className="mt-5 rounded-xl bg-[#FBF8F8] p-5 ring-1 ring-[#F4EFF0]">
              <p className="font-[family-name:var(--font-brand-ui)] text-[14px] font-semibold text-[#201A1C]">
                🔒 Tu ne paies que quand tu es prêt.
              </p>
              <Body className="mt-1 text-sm!">
                Crée, personnalise, prévisualise autant que tu veux.
              </Body>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- testimonials ----------------------------- */

const REVIEWS = [
  {
    initial: "A",
    quote:
      "On hésitait. Puis on a calculé les cartons papier : 200 invités × 1 500 XOF = 300 000 XOF. moninvit nous a fait économiser une fortune.",
    author: "A.K. · Mariage à Abidjan · Mars 2026",
  },
  {
    initial: "M",
    quote:
      "La dot, le civil, la réception. Tout sur une page. Nos familles avaient toujours la bonne info.",
    author: "M.S. · Bouaké · Janvier 2026",
  },
  {
    initial: "C",
    quote: "Ma belle-mère a pleuré en recevant le lien.",
    author: "C.A. · Abidjan · Avril 2026",
  },
];

export function ReviewCard({
  initial,
  quote,
  author,
}: {
  initial: string;
  quote: string;
  author: string;
}) {
  return (
    <figure className="flex flex-col rounded-2xl border border-[#F4EFF0] bg-white p-7 shadow-[0_16px_40px_-32px_rgba(32,26,28,0.5)]">
      <Stars />
      <blockquote className="mt-4 flex-1 font-[family-name:var(--font-brand-serif)] text-[16px] italic leading-[1.7] text-[#201A1C]">
        « {quote} »
      </blockquote>
      <div aria-hidden className="my-5 h-px bg-[#F4EFF0]" />
      <figcaption className="flex items-center gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#FBDDE5] font-[family-name:var(--font-brand-ui)] text-xs font-bold text-[#E82050]">
          {initial}
        </span>
        <span className="font-[family-name:var(--font-brand-ui)] text-[11px] font-medium text-[#7A6D70]">
          {author}
        </span>
      </figcaption>
    </figure>
  );
}

function Testimonials() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="text-center">
          <Kicker>Ils ont dit oui à moninvit</Kicker>
          <H2 className="mt-4">Des couples ivoiriens racontent.</H2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {REVIEWS.map((r) => (
            <ReviewCard key={r.author} {...r} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/temoignages"
            className="font-[family-name:var(--font-brand-ui)] text-[15px] font-semibold text-[#C81A45] hover:underline"
          >
            Lire tous les témoignages →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------- faq ---------------------------------- */

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="bg-[#FBF8F8] py-24">
      <div className="mx-auto max-w-3xl px-5">
        <div className="text-center">
          <Kicker>Questions fréquentes</Kicker>
          <H2 className="mt-4">Tout ce que tu te demandes.</H2>
        </div>

        <div className="mt-10 divide-y divide-[#F4EFF0] rounded-2xl border border-[#F4EFF0] bg-white px-6">
          {HOME_FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="py-5">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 text-left font-[family-name:var(--font-brand-ui)] text-[15px] font-semibold text-[#201A1C]"
                >
                  {f.q}
                  <span
                    className={`shrink-0 text-[#E82050] transition-transform ${isOpen ? "rotate-45" : ""}`}
                    aria-hidden
                  >
                    +
                  </span>
                </button>
                {isOpen ? <Body className="mt-3">{f.a}</Body> : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- final CTA ------------------------------- */

function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-[#E82050] py-24 text-center text-white">
      <img
        src={logoHeart.url}
        alt=""
        aria-hidden
        className="pointer-events-none absolute -bottom-10 -left-10 w-64 opacity-10 brightness-0 invert"
      />
      <div className="relative mx-auto max-w-3xl px-5">
        <p className="font-[family-name:var(--font-brand-ui)] text-xs font-semibold uppercase tracking-[0.24em] text-[#FBDDE5]">
          Il ne manque plus que toi
        </p>
        <h2 className="mx-auto mt-5 max-w-[760px] font-[family-name:var(--font-brand-serif)] text-[40px] font-medium leading-[1.06] sm:text-[60px]">
          Faisons de ton « oui » un souvenir partagé.
        </h2>
        <Link
          to="/signup"
          className="mt-9 inline-flex items-center gap-2 rounded-full bg-white px-[34px] py-4 font-[family-name:var(--font-brand-ui)] text-[15px] font-semibold text-[#C81A45] transition hover:-translate-y-0.5"
        >
          Commencer gratuitement →
        </Link>
        <p className="mt-5 font-[family-name:var(--font-brand-ui)] text-[13px] font-medium text-[#FBDDE5]">
          Crée ta page en 10 min · Paie uniquement à la publication
        </p>
      </div>
    </section>
  );
}
