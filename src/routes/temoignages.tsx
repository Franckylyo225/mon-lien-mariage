import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/site/SiteChrome";

export const Route = createFileRoute("/temoignages")({
  head: () => ({
    meta: [
      { title: "Témoignages — Ils ont choisi MonInvit.com" },
      {
        name: "description",
        content:
          "Plus de 500 couples ivoiriens racontent leur expérience MonInvit.com : création de l'invitation, suivi des RSVP et jour J.",
      },
      { property: "og:title", content: "Témoignages — MonInvit.com" },
      {
        property: "og:description",
        content:
          "Plus de 500 couples nous font confiance pour leur invitation digitale.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/temoignages" },
      { property: "og:site_name", content: "MonInvit.com" },
      { property: "og:locale", content: "fr_FR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Témoignages — MonInvit.com" },
      {
        name: "twitter:description",
        content: "Les mariés racontent leur expérience MonInvit.com.",
      },
    ],
    links: [{ rel: "canonical", href: "/temoignages" }],
  }),
  component: Testimonials,
});


const REVIEWS = [
  {
    couple: "Aïcha & Loïc",
    city: "Abidjan · Cocody",
    initials: "A&L",
    date: "Mariés en août 2027",
    quote:
      "On a créé notre page en une soirée. Les invités ont adoré l'enveloppe animée, et les RSVP arrivaient en direct sur nos téléphones — c'était magique.",
    tone: "cream",
  },
  {
    couple: "Fatou & Kouassi",
    city: "Grand-Bassam",
    initials: "F&K",
    date: "Mariés en mai 2027",
    quote:
      "Avoir une page par étape (dot, civil, religieux, réception) a vraiment simplifié la vie de nos familles. Chacun savait où aller et à quelle heure.",
    tone: "clay",
  },
  {
    couple: "Sarah & Yao",
    city: "Yamoussoukro",
    initials: "S&Y",
    date: "Mariés en février 2027",
    quote:
      "Le tableau de bord est génial : régimes alimentaires, +1, messages… on a pu tout anticiper pour le traiteur sans stress.",
    tone: "sage",
  },
  {
    couple: "Marina & Éric",
    city: "Abidjan · Marcory",
    initials: "M&É",
    date: "Mariés en novembre 2026",
    quote:
      "Nos proches à Paris et à Montréal ont reçu la même invitation, en français et en anglais. Élégant, pratique, à notre image.",
    tone: "cream",
  },
  {
    couple: "Awa & Sekou",
    city: "Bouaké",
    initials: "A&S",
    date: "Mariés en septembre 2026",
    quote:
      "Le service client répond vite et gentiment. On s'est sentis accompagnés du début à la fin.",
    tone: "sage",
  },
  {
    couple: "Nadia & Christian",
    city: "Abidjan · Riviera",
    initials: "N&C",
    date: "Mariés en juillet 2026",
    quote:
      "Notre photographe a demandé le lien de la page pour préparer la journée — tout y était : programme, adresses, contacts. Un vrai gain de temps.",
    tone: "clay",
  },
];

const TONES: Record<string, { bg: string; ink: string; sub: string; badge: string }> = {
  cream: {
    bg: "bg-[#FDF0F3] border border-[#F1E3C6]/50",
    ink: "text-[#201A1C]",
    sub: "text-[#5A4F52]",
    badge: "bg-[#E82050] text-[#FBF8F8]",
  },
  clay: {
    bg: "bg-[#E82050]",
    ink: "text-[#FBF8F8]",
    sub: "text-[#FBF8F8]/80",
    badge: "bg-[#FBF8F8] text-[#E82050]",
  },
  sage: {
    bg: "bg-[#F1E3C6] border border-[#C6A15B]/60",
    ink: "text-[#201A1C]",
    sub: "text-[#5A4F52]",
    badge: "bg-[#201A1C] text-[#FBF8F8]",
  },
};

function Stars() {
  return (
    <span className="flex items-center gap-0.5 text-[#C6A15B]">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" fill="currentColor" className="size-3.5">
          <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.9L10 14.9l-5.3 2.8 1-5.9L1.5 7.7l5.9-.9L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}

function Testimonials() {
  return (
    <PageShell
      eyebrow="Ils nous ont fait confiance"
      title={
        <>
          Plus de 500 couples,{" "}
          <em className="italic text-[#E82050]">une seule histoire.</em>
        </>
      }
      intro="Découvrez ce que nos mariés disent de MonInvit.com — leurs impressions, leur expérience, et leurs conseils."
    >
      <section className="mx-auto max-w-5xl px-5 pb-10">
        <div className="flex flex-wrap items-center justify-center gap-6 rounded-[24px] border border-[#F1E3C6]/50 bg-white/70 p-6 text-center sm:gap-10">
          <div>
            <p className="font-[family-name:var(--font-display)] text-4xl italic text-[#E82050]">
              4.9/5
            </p>
            <div className="mt-1 flex justify-center"><Stars /></div>
            <p className="mt-1 text-xs text-[#7A6D70]">Note moyenne des couples</p>
          </div>
          <div className="h-10 w-px bg-[#F1E3C6]/70" />
          <div>
            <p className="font-[family-name:var(--font-display)] text-4xl italic text-[#E82050]">
              500+
            </p>
            <p className="mt-1 text-xs text-[#7A6D70]">Mariages célébrés</p>
          </div>
          <div className="h-10 w-px bg-[#F1E3C6]/70" />
          <div>
            <p className="font-[family-name:var(--font-display)] text-4xl italic text-[#E82050]">
              98%
            </p>
            <p className="mt-1 text-xs text-[#7A6D70]">Recommandent le service</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16" aria-labelledby="avis-heading">
        <h2 id="avis-heading" className="sr-only">Avis des couples</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {REVIEWS.map((r) => {
            const t = TONES[r.tone];
            return (
              <figure
                key={r.couple}
                className={`flex flex-col rounded-[24px] p-7 shadow-sm ${t.bg}`}
              >
                <Stars />
                <blockquote
                  className={`mt-4 font-[family-name:var(--font-display)] text-lg italic leading-relaxed ${t.ink}`}
                >
                  « {r.quote} »
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-full font-[family-name:var(--font-display)] text-xs italic ${t.badge}`}
                  >
                    {r.initials}
                  </span>
                  <div>
                    <p className={`text-sm font-medium ${t.ink}`}>{r.couple}</p>
                    <p className={`text-xs ${t.sub}`}>{r.city} · {r.date}</p>
                  </div>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-16 text-center">
        <h2 className="font-[family-name:var(--font-display)] text-3xl italic sm:text-4xl">
          Et si le prochain témoignage était le vôtre ?
        </h2>
        <p className="mt-3 text-[#5A4F52]">
          Créez votre invitation aujourd'hui, publiez quand vous êtes prêts.
        </p>
        <Link
          to="/signup"
          className="mt-8 inline-block rounded-full bg-[#201A1C] px-8 py-4 text-sm font-medium text-[#FBF8F8] shadow-lg shadow-[#E82050]/20 hover:-translate-y-0.5 hover:shadow-xl"
        >
          Créer notre invitation
        </Link>
      </section>
    </PageShell>
  );
}
