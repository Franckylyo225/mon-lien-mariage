import { createFileRoute, Link } from "@tanstack/react-router";
import { templateMeta, templateOrder } from "@/lib/ceremony-meta";
import { SiteHeader as SharedSiteHeader, SiteFooter as SharedSiteFooter } from "@/components/site/SiteChrome";
import heroCouple from "@/assets/home-couple.jpg";
import romanceImg from "@/assets/home-romance.jpg";
import tableImg from "@/assets/home-table.jpg";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MonMariage.ci — Invitations de mariage digitales, dessinées avec amour" },
      {
        name: "description",
        content:
          "Une invitation de mariage digitale élégante, prête en 10 minutes. RSVP, programme, invités, partage WhatsApp. Créée pour les mariés de Côte d'Ivoire.",
      },
      { property: "og:title", content: "MonMariage.ci — Célébrons votre union" },
      {
        property: "og:description",
        content:
          "20+ modèles romantiques, RSVP automatiques, tableau de bord privé. Un seul lien à partager. Sans engagement jusqu'au paiement.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { property: "og:site_name", content: "MonMariage.ci" },
      { property: "og:locale", content: "fr_FR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "MonMariage.ci — Célébrons votre union" },
      {
        name: "twitter:description",
        content:
          "Invitations digitales, RSVP en direct et tableau de bord — pensé pour les mariés ivoiriens.",
      },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Landing,
});


/* -------------------------------------------------------------------------- */
/*                                    PAGE                                    */
/* -------------------------------------------------------------------------- */

function Landing() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fdf7f3] text-[#2b1a14] font-[var(--font-sans)]">
      <SharedSiteHeader />

      <Hero />
      <ProofStrip />
      <FeatureCards />
      <IncludedChecklist />
      <TimeArgument />
      <StepsSection />
      <EditorialCouple />
      <PromiseBlock />
      <FaqBlock />
      <FinalCta />
      <SharedSiteFooter />
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   HEADER                                   */
/* -------------------------------------------------------------------------- */




/* -------------------------------------------------------------------------- */
/*                                    HERO                                    */
/* -------------------------------------------------------------------------- */

function Hero() {
  return (
    <section className="relative isolate">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(1200px 600px at 50% -10%, #f6d9cb 0%, #fdf7f3 55%, #fdf7f3 100%)",
        }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-60">
        <span className="absolute left-[8%] top-[18%] size-2 rounded-full bg-[#c17c74]/40" />
        <span className="absolute right-[12%] top-[10%] size-3 rounded-full bg-[#e8c5b6]/60" />
        <span className="absolute left-[20%] top-[38%] size-1.5 rounded-full bg-[#d97757]/50" />
        <span className="absolute right-[18%] top-[55%] size-2 rounded-full bg-[#c9a84c]/40" />
      </div>

      <div className="mx-auto max-w-5xl px-5 pt-10 text-center sm:pt-16">
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-[46px] leading-[1.02] sm:text-6xl md:text-[76px]">
          Votre invitation de mariage,{" "}
          <em className="italic text-[#c17c74]">rêvée puis dessinée.</em>
        </h1>
        <p className="mx-auto mt-4 font-[family-name:var(--font-display)] text-lg italic text-[#8a5a4a] sm:text-xl">
          Pensée pour les mariés d'Abidjan et d'ailleurs.
        </p>

        {/* Rating pill */}
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#e8c5b6]/70 bg-white/70 px-4 py-2 shadow-sm backdrop-blur-sm">
          <StarRow />
          <span className="text-[13px] text-[#6b4a3e]">
            <strong className="text-[#2b1a14]">4.9</strong> · Choisie par +500
            couples ivoiriens
          </span>
        </div>

        <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-[#6b4a3e] sm:text-base">
          Choisissez le style, on le fait vibrer autour de votre histoire.
          <br className="hidden sm:block" />
          Un seul lien élégant, prêt à envoyer sur WhatsApp.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/signup"
            className="inline-block w-full rounded-full bg-[#2b1a14] px-8 py-4 text-sm font-medium tracking-wide text-[#fdf7f3] shadow-lg shadow-[#c17c74]/20 transition hover:-translate-y-0.5 hover:shadow-xl sm:w-auto"
          >
            Créer notre invitation
          </Link>
          <p className="text-xs text-[#8a6a5e]">
            Aucune carte bancaire · Sans engagement jusqu'à la publication
          </p>
        </div>
      </div>

      <TemplateFan />
    </section>
  );
}

function StarRow() {
  return (
    <span className="flex items-center gap-0.5 text-[#c9a84c]">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" fill="currentColor" className="size-3.5">
          <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.9L10 14.9l-5.3 2.8 1-5.9L1.5 7.7l5.9-.9L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*                               PROOF STRIP                                  */
/* -------------------------------------------------------------------------- */

function ProofStrip() {
  const items = [
    ["10 min", "Pour créer votre page"],
    ["20+", "Modèles romantiques"],
    ["4 étapes", "Dot, civil, religieux, réception"],
    ["0 stress", "RSVP automatiques"],
  ];
  return (
    <section className="border-y border-[#e8c5b6]/40 bg-[#fbeee4]/60">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 px-5 py-8 text-center sm:grid-cols-4">
        {items.map(([n, l]) => (
          <div key={l}>
            <p className="font-[family-name:var(--font-display)] text-3xl italic text-[#c17c74] sm:text-4xl">
              {n}
            </p>
            <p className="mt-1 text-xs text-[#6b4a3e] sm:text-sm">{l}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                              FEATURE CARDS                                 */
/* -------------------------------------------------------------------------- */

function FeatureCards() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24">
      <div className="text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#c17c74]">
          Tout ce qu'il vous faut
        </p>
        <h2 className="mx-auto mt-4 max-w-2xl font-[family-name:var(--font-display)] text-4xl leading-[1.05] sm:text-5xl">
          Pour rendre votre invitation{" "}
          <em className="italic text-[#c17c74]">inoubliable.</em>
        </h2>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-6">
        {/* Card 1 — Enveloppe */}
        <FeatureCard
          className="md:col-span-3"
          tone="cream"
          eyebrow="Enveloppe personnalisée"
          title="Une enveloppe à vos initiales, avec sceau doré."
          desc="Vos invités ouvrent une vraie enveloppe animée — comme un pli reçu de vos mains."
        >
          <EnvelopeMock />
        </FeatureCard>

        {/* Card 2 — RSVP dashboard */}
        <FeatureCard
          className="md:col-span-3"
          tone="dark"
          eyebrow="RSVP & tableau de bord"
          title="Suivez chaque réponse, en direct sur votre téléphone."
          desc="Confirmations, régimes alimentaires, +1, chansons demandées — tout est là."
        >
          <RsvpMock />
        </FeatureCard>

        {/* Card 3 — Partage */}
        <FeatureCard
          className="md:col-span-2"
          tone="clay"
          eyebrow="Partage instantané"
          title="Un lien, WhatsApp, c'est parti."
          desc="Copiez, partagez, épinglez dans vos groupes. Aucune application à installer."
        >
          <ShareMock />
        </FeatureCard>

        {/* Card 4 — Programme */}
        <FeatureCard
          className="md:col-span-2"
          tone="sage"
          eyebrow="Programme des 4 jours"
          title="Dot, civil, religieux, réception."
          desc="Chaque étape a sa page, son horaire, sa carte et sa tenue conseillée."
        >
          <ProgramMock />
        </FeatureCard>

        {/* Card 5 — Multi-langue */}
        <FeatureCard
          className="md:col-span-2"
          tone="cream"
          eyebrow="Français · English"
          title="Une invitation qui parle à toute la famille."
          desc="Vos oncles à Paris, vos cousines à Atlanta — chacun lit dans sa langue."
        >
          <LangMock />
        </FeatureCard>
      </div>
    </section>
  );
}

/* ---------------------------- Mock components ----------------------------- */

function FeatureCard({
  children,
  eyebrow,
  title,
  desc,
  tone,
  className = "",
}: {
  children: React.ReactNode;
  eyebrow: string;
  title: string;
  desc: string;
  tone: "cream" | "dark" | "clay" | "sage";
  className?: string;
}) {
  const tones: Record<string, string> = {
    cream: "bg-[#fbeee4] text-[#2b1a14] border border-[#e8c5b6]/50",
    dark: "bg-[#2b1a14] text-[#fdf7f3]",
    clay: "bg-[#c17c74] text-[#fdf7f3]",
    sage: "bg-[#e5ded1] text-[#2b1a14] border border-[#d5c9b3]/60",
  };
  const eyebrowColor =
    tone === "dark" || tone === "clay" ? "text-[#e8c5b6]" : "text-[#c17c74]";
  const descColor =
    tone === "dark" || tone === "clay" ? "text-[#fdf7f3]/80" : "text-[#6b4a3e]";
  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-[28px] p-6 transition hover:-translate-y-1 hover:shadow-xl sm:p-8 ${tones[tone]} ${className}`}
    >
      <div className="flex min-h-[220px] flex-1 items-center justify-center py-6">
        {children}
      </div>
      <p className={`font-mono text-[10px] uppercase tracking-[0.28em] ${eyebrowColor}`}>
        {eyebrow}
      </p>
      <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl leading-tight sm:text-[26px]">
        {title}
      </h3>
      <p className={`mt-2 text-sm leading-relaxed ${descColor}`}>{desc}</p>
    </div>
  );
}

function EnvelopeMock() {
  return (
    <div className="relative h-40 w-64 -rotate-6 rounded-md bg-[#fdf7f3] shadow-[0_20px_40px_-15px_rgba(75,32,20,0.4)] ring-1 ring-[#c17c74]/20">
      <div className="absolute inset-x-0 top-0 h-20 origin-top rotate-x-[10deg] rounded-t-md border-b border-[#c17c74]/20 bg-[#fbeee4]" />
      <div className="absolute left-1/2 top-14 flex size-10 -translate-x-1/2 items-center justify-center rounded-full bg-[#c17c74] font-[family-name:var(--font-display)] text-sm italic text-[#fdf7f3] shadow-md">
        A&S
      </div>
      <div className="absolute inset-x-0 bottom-3 text-center font-[family-name:var(--font-display)] text-[11px] italic text-[#8a6a5e]">
        Aïcha & Loïc · 14.08.2027
      </div>
    </div>
  );
}

function RsvpMock() {
  return (
    <div className="w-56 rounded-2xl bg-[#fdf7f3] p-4 text-[#2b1a14] shadow-2xl">
      <p className="font-mono text-[9px] uppercase tracking-widest text-[#c17c74]">
        Tableau de bord
      </p>
      <p className="mt-1 font-[family-name:var(--font-display)] text-xl italic">
        142 <span className="text-sm not-italic text-[#8a6a5e]">présents</span>
      </p>
      <div className="mt-3 h-1.5 w-full rounded-full bg-[#e8c5b6]/60">
        <div className="h-full w-[78%] rounded-full bg-[#c17c74]" />
      </div>
      <ul className="mt-4 space-y-2 text-[11px]">
        <li className="flex items-center justify-between">
          <span>Fatou Koné</span>
          <span className="rounded-full bg-[#d4eadf] px-2 py-0.5 text-[9px] font-medium text-[#2f6b4a]">
            ✓ Oui
          </span>
        </li>
        <li className="flex items-center justify-between">
          <span>Kouassi B.</span>
          <span className="rounded-full bg-[#d4eadf] px-2 py-0.5 text-[9px] font-medium text-[#2f6b4a]">
            ✓ Oui +1
          </span>
        </li>
        <li className="flex items-center justify-between">
          <span>Marie D.</span>
          <span className="rounded-full bg-[#f6e0dc] px-2 py-0.5 text-[9px] font-medium text-[#a24545]">
            ✗ Empêchée
          </span>
        </li>
      </ul>
    </div>
  );
}

function ShareMock() {
  return (
    <div className="relative w-52 rounded-2xl bg-[#25D366]/10 p-3 ring-1 ring-[#25D366]/30">
      <div className="mb-2 flex items-center gap-2">
        <span className="size-6 rounded-full bg-[#25D366]" />
        <span className="text-[11px] font-medium text-[#2b1a14]">WhatsApp</span>
      </div>
      <div className="rounded-xl bg-white p-3 shadow-sm">
        <p className="text-[10px] text-[#6b4a3e]">
          Vous êtes conviés à notre mariage ✨
        </p>
        <div className="mt-2 rounded-md border border-[#e8c5b6] p-2">
          <p className="font-[family-name:var(--font-display)] text-xs italic text-[#c17c74]">
            monmariage.ci/aicha-loic
          </p>
          <p className="mt-0.5 text-[9px] text-[#8a6a5e]">
            Aïcha & Loïc · 14 août
          </p>
        </div>
      </div>
    </div>
  );
}

function ProgramMock() {
  const days = [
    ["12.08", "Dot"],
    ["13.08", "Civil"],
    ["14.08", "Religieux"],
    ["15.08", "Réception"],
  ];
  return (
    <div className="w-56 rounded-2xl bg-white/80 p-4 shadow-lg">
      <ul className="space-y-2">
        {days.map(([d, t]) => (
          <li key={t} className="flex items-center gap-3 rounded-lg bg-[#fdf7f3] px-3 py-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#c17c74]">
              {d}
            </span>
            <span className="font-[family-name:var(--font-display)] text-sm italic text-[#2b1a14]">
              {t}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LangMock() {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-2xl bg-white/80 px-4 py-3 shadow-md">
        <p className="font-mono text-[9px] uppercase tracking-widest text-[#c17c74]">FR</p>
        <p className="font-[family-name:var(--font-display)] text-base italic">
          Nous vous invitons…
        </p>
      </div>
      <span className="font-[family-name:var(--font-display)] text-2xl italic text-[#8a6a5e]">
        ⇄
      </span>
      <div className="rounded-2xl bg-white/80 px-4 py-3 shadow-md">
        <p className="font-mono text-[9px] uppercase tracking-widest text-[#c17c74]">EN</p>
        <p className="font-[family-name:var(--font-display)] text-base italic">
          You are invited…
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            INCLUDED CHECKLIST                              */
/* -------------------------------------------------------------------------- */

function IncludedChecklist() {
  const items = [
    "Enveloppe animée à vos initiales",
    "Galerie photos illimitée",
    "RSVP personnalisé",
    "Tableau de bord privé",
    "Messages des invités",
    "Régimes alimentaires",
    "Programme sur 4 jours",
    "Carte & itinéraire",
    "Bilingue FR / EN",
    "Export Excel",
    "Partage WhatsApp",
    "Lien à vie",
  ];
  return (
    <section className="border-y border-[#e8c5b6]/40 bg-[#2b1a14] py-16 text-[#fdf7f3]">
      <div className="mx-auto max-w-5xl px-5">
        <p className="text-center font-mono text-[11px] uppercase tracking-[0.3em] text-[#e8c5b6]">
          Inclus dans chaque invitation
        </p>
        <h3 className="mx-auto mt-4 max-w-2xl text-center font-[family-name:var(--font-display)] text-3xl italic sm:text-4xl">
          Tout est déjà là. Vous n'ajoutez que votre histoire.
        </h3>
        <div className="mt-10 flex flex-wrap justify-center gap-x-3 gap-y-3">
          {items.map((i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 rounded-full border border-[#e8c5b6]/25 px-4 py-2 text-sm text-[#fdf7f3]/90"
            >
              <span className="size-1 rounded-full bg-[#e8c5b6]" />
              {i}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                              TIME ARGUMENT                                 */
/* -------------------------------------------------------------------------- */

function TimeArgument() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-24">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div className="relative">
          <img
            src={romanceImg}
            alt="Roses et alliances dorées"
            width={1024}
            height={1024}
            loading="lazy"
            className="aspect-[4/5] w-full rounded-[2rem] object-cover shadow-xl shadow-[#c17c74]/15"
          />
          <div className="absolute -bottom-6 -right-4 hidden rounded-2xl bg-[#fdf7f3] p-4 shadow-lg sm:block">
            <p className="font-[family-name:var(--font-display)] text-sm italic text-[#6b4a3e]">
              « Prête en une soirée. »
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-[#c17c74]">
              Aïcha & Loïc
            </p>
          </div>
        </div>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#c17c74]">
            Pourquoi MonMariage.ci
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl leading-[1.05] sm:text-5xl">
            Le temps de dire{" "}
            <em className="italic text-[#c17c74]">« oui »</em>, et c'est prêt.
          </h2>
          <ul className="mt-8 space-y-6">
            {[
              {
                t: "10 minutes chrono, depuis votre téléphone",
                d: "Prénoms, date, lieu, quelques photos — votre page est en ligne. Pas de logiciel, pas d'imprimeur, pas de graphiste à briefer.",
              },
              {
                t: "Des modèles pensés pour l'Afrique",
                d: "Terracotta, wax doré, kente royal, sahel, botanique… des ambiances qui vous ressemblent, loin des clichés génériques.",
              },
              {
                t: "Vos invités RSVP en un seul clic",
                d: "Un lien à partager sur WhatsApp. Ils confirment, précisent leur régime, laissent un mot — vous suivez tout, en temps réel.",
              },
              {
                t: "Vos données restent vos données",
                d: "Aucune publicité, pas de revente, pas de compte à créer pour vos invités. Discret et respectueux.",
              },
            ].map((b) => (
              <li key={b.t} className="flex gap-4">
                <span className="mt-2 h-px w-8 shrink-0 bg-[#c17c74]" />
                <div>
                  <p className="font-[family-name:var(--font-display)] text-xl italic">
                    {b.t}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[#6b4a3e]">
                    {b.d}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   STEPS                                    */
/* -------------------------------------------------------------------------- */

function StepsSection() {
  const steps: Array<[string, string, string]> = [
    ["01", "Vos prénoms", "Vous et votre moitié, c'est tout ce qu'il faut pour démarrer."],
    ["02", "Vos dates", "Une seule étape ou toutes : dot, civil, religieux, réception."],
    ["03", "Votre ambiance", "Un modèle qui vous ressemble, personnalisable en quelques clics."],
    ["04", "Partagez", "Un lien élégant à envoyer sur WhatsApp. Les RSVP arrivent tout seuls."],
  ];
  return (
    <section className="border-t border-[#e8c5b6]/40 bg-[#fbeee4]/40 py-24">
      <div className="mx-auto max-w-5xl px-5">
        <div className="text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#c17c74]">
            4 étapes, c'est tout
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl italic sm:text-5xl">
            De l'idée à l'invitation
          </h2>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(([n, t, d]) => (
            <div
              key={n}
              className="rounded-3xl border border-[#e8c5b6]/60 bg-[#fdf7f3] p-6 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#c17c74]">
                Étape {n}
              </p>
              <p className="mt-3 font-[family-name:var(--font-display)] text-2xl italic">
                {t}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#6b4a3e]">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                            EDITORIAL COUPLE                                */
/* -------------------------------------------------------------------------- */

function EditorialCouple() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24">
      <div className="grid items-center gap-12 md:grid-cols-5">
        <div className="md:col-span-3">
          <img
            src={heroCouple}
            alt="Couple mariés à Abidjan"
            width={1024}
            height={1024}
            loading="lazy"
            className="aspect-[5/4] w-full rounded-[2rem] object-cover shadow-xl shadow-[#c17c74]/15"
          />
        </div>
        <div className="md:col-span-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#c17c74]">
            Pensé à Abidjan
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl italic leading-[1.05] sm:text-5xl">
            Chaque mariage <br />a sa propre histoire.
          </h2>
          <p className="mt-6 text-[15px] leading-relaxed text-[#6b4a3e]">
            MonMariage.ci comprend nos traditions. Que vous célébriez une dot
            intime, un mariage à l'église, ou trois jours de fête — chaque
            étape a sa page, son programme et son lieu.
          </p>
          <Link
            to="/signup"
            className="mt-8 inline-block rounded-full border border-[#2b1a14] px-6 py-3 text-sm font-medium text-[#2b1a14] transition hover:bg-[#2b1a14] hover:text-[#fdf7f3]"
          >
            Créer notre page →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                              PROMISE BLOCK                                 */
/* -------------------------------------------------------------------------- */

function PromiseBlock() {
  return (
    <section className="mx-auto max-w-4xl px-5 pb-8">
      <div className="relative overflow-hidden rounded-[2rem] border border-[#e8c5b6]/60 bg-[#fdf7f3] p-8 text-center shadow-lg sm:p-14">
        <div
          aria-hidden
          className="absolute -top-8 left-1/2 -translate-x-1/2 font-[family-name:var(--font-display)] text-[140px] italic text-[#c17c74]/10"
        >
          ♡
        </div>
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#c17c74]">
          Notre promesse
        </p>
        <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl italic leading-[1.15] sm:text-4xl">
          Vous ne partagerez votre invitation que <br />
          <em className="text-[#c17c74]">le jour où elle vous fera vibrer.</em>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-[#6b4a3e]">
          Vous avancez à votre rythme, révision après révision.
          Tant que chaque détail n'est pas exactement comme vous l'imaginiez,
          rien n'est publié — et rien n'est facturé.
        </p>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 FAQ BLOCK                                  */
/* -------------------------------------------------------------------------- */

function FaqBlock() {
  const faqs = [
    {
      q: "Combien de temps pour créer notre invitation ?",
      a: "En moyenne 10 minutes pour la version essentielle. Vous pouvez ensuite l'affiner sur plusieurs soirées — vos changements sont sauvegardés automatiquement.",
    },
    {
      q: "Nos invités doivent-ils créer un compte ?",
      a: "Non, jamais. Ils ouvrent le lien, lisent votre invitation, confirment leur présence en un clic. Ni téléchargement, ni inscription.",
    },
    {
      q: "Quand devons-nous payer ?",
      a: "Uniquement au moment de la publication, quand vous êtes prêts à partager. Vous pouvez tout construire, tout tester, tout modifier — gratuitement.",
    },
    {
      q: "Peut-on gérer les 4 cérémonies (dot, civil, religieux, réception) ?",
      a: "Oui, chaque cérémonie a sa propre page avec horaire, lieu, carte et tenue conseillée. Vos invités confirment étape par étape.",
    },
    {
      q: "Est-ce que ça fonctionne sur les vieux téléphones ?",
      a: "Oui. Notre page est légère, elle s'ouvre en quelques secondes même sur une connexion 3G — pensé pour l'Afrique.",
    },
  ];
  return (
    <section className="mx-auto max-w-3xl px-5 py-24">
      <div className="text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#c17c74]">
          Vos questions
        </p>
        <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl italic sm:text-5xl">
          Tout ce qu'on nous demande.
        </h2>
      </div>
      <div className="mt-12 divide-y divide-[#e8c5b6]/60 border-y border-[#e8c5b6]/60">
        {faqs.map((f) => (
          <details key={f.q} className="group py-5">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-6">
              <span className="font-[family-name:var(--font-display)] text-lg italic text-[#2b1a14] sm:text-xl">
                {f.q}
              </span>
              <span className="mt-1 shrink-0 font-mono text-lg text-[#c17c74] transition group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 pr-8 text-[15px] leading-relaxed text-[#6b4a3e]">
              {f.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                FINAL CTA                                   */
/* -------------------------------------------------------------------------- */

function FinalCta() {
  return (
    <section className="relative isolate overflow-hidden bg-[#2b1a14] text-[#fdf7f3]">
      <img
        src={tableImg}
        alt=""
        width={1024}
        height={1024}
        loading="lazy"
        aria-hidden
        className="absolute inset-0 -z-10 h-full w-full object-cover opacity-20"
      />
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#e8c5b6]">
          Il ne manque plus que vous
        </p>
        <h2 className="mt-6 font-[family-name:var(--font-display)] text-4xl italic leading-[1.05] sm:text-6xl">
          Faisons de votre{" "}
          <em className="text-[#e8c5b6]">« oui »</em> <br />
          un souvenir partagé.
        </h2>
        <Link
          to="/signup"
          className="mt-10 inline-block rounded-full bg-[#fdf7f3] px-10 py-4 text-sm font-medium tracking-wide text-[#2b1a14] shadow-xl transition hover:-translate-y-0.5"
        >
          Créer notre invitation
        </Link>
        <p className="mt-4 text-xs text-[#e8c5b6]/70">
          Créez votre page en 10 min · Payez uniquement à la publication
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
    { rot: -14, x: -220, y: 40, z: 1, scale: 0.82 },
    { rot: -7, x: -115, y: 18, z: 2, scale: 0.9 },
    { rot: 0, x: 0, y: 0, z: 3, scale: 1 },
    { rot: 7, x: 115, y: 18, z: 2, scale: 0.9 },
    { rot: 14, x: 220, y: 40, z: 1, scale: 0.82 },
  ];

  return (
    <div className="relative mx-auto mt-14 h-[380px] w-full max-w-5xl overflow-hidden sm:mt-20 sm:h-[520px]">
      <div className="absolute left-1/2 top-0 h-full w-full origin-top -translate-x-1/2 scale-[0.62] sm:scale-100">
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
        <span
          className="font-mono text-[8px] uppercase tracking-[0.25em]"
          style={{ color: ink, opacity: 0.6 }}
        >
          Save the date
        </span>
        <span
          className="size-1.5 rounded-full"
          style={{ backgroundColor: accent2 }}
        />
      </div>
      <div
        className="mx-4 mt-3 flex-1 rounded-md"
        style={{
          background: `linear-gradient(140deg, ${accent1} 0%, ${accent2} 55%, ${ink} 100%)`,
        }}
      />
      <div className="px-4 py-4 text-center">
        <p
          className="font-[family-name:var(--font-display)] text-[24px] italic leading-none sm:text-[28px]"
          style={{ color: ink }}
        >
          Aïcha
        </p>
        <p
          className="my-0.5 font-[family-name:var(--font-display)] text-xs italic"
          style={{ color: accent2 }}
        >
          &
        </p>
        <p
          className="font-[family-name:var(--font-display)] text-[24px] italic leading-none sm:text-[28px]"
          style={{ color: ink }}
        >
          Loïc
        </p>
        <div
          className="mx-auto my-3 h-px w-8"
          style={{ backgroundColor: accent2 }}
        />
        <p
          className="font-mono text-[8px] uppercase tracking-[0.3em]"
          style={{ color: ink, opacity: 0.7 }}
        >
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
