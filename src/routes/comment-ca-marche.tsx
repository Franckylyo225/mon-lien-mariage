import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/site/SiteChrome";

export const Route = createFileRoute("/comment-ca-marche")({
  head: () => ({
    meta: [
      { title: "Comment ça marche — MonInvit.com" },
      {
        name: "description",
        content:
          "Créez votre invitation de mariage digitale en 4 étapes : choisissez un modèle, personnalisez, partagez, suivez les RSVP en direct.",
      },
      { property: "og:title", content: "Comment ça marche — MonInvit.com" },
      {
        property: "og:description",
        content:
          "Du choix du modèle au suivi des invités, votre invitation prête en 10 minutes.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/comment-ca-marche" },
      { property: "og:site_name", content: "MonInvit.com" },
      { property: "og:locale", content: "fr_FR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Comment ça marche — MonInvit.com" },
      {
        name: "twitter:description",
        content: "Votre invitation prête en 10 minutes, en 4 étapes simples.",
      },
    ],
    links: [{ rel: "canonical", href: "/comment-ca-marche" }],
  }),
  component: HowItWorks,
});


const STEPS = [
  {
    n: "01",
    title: "Choisissez votre modèle",
    desc: "Plus de 20 modèles romantiques, classiques ou contemporains. Un aperçu réel avant de choisir.",
  },
  {
    n: "02",
    title: "Personnalisez votre page",
    desc: "Prénoms, dates, photos, programme, thème, effets. Tout se modifie en direct depuis votre téléphone.",
  },
  {
    n: "03",
    title: "Ajoutez vos invités",
    desc: "Importez votre liste ou ajoutez-les un par un. Chacun reçoit un lien nominatif à partager sur WhatsApp.",
  },
  {
    n: "04",
    title: "Suivez les RSVP",
    desc: "Confirmations, +1, régimes alimentaires, messages : tout arrive en direct dans votre tableau de bord.",
  },
];

const FAQ = [
  {
    q: "Combien de temps pour créer ma page ?",
    a: "Comptez 10 à 15 minutes pour la version essentielle. Vous pouvez toujours revenir peaufiner ensuite.",
  },
  {
    q: "Quand faut-il payer ?",
    a: "Vous ne payez qu'au moment de publier votre invitation. Avant, tout est gratuit et sans engagement.",
  },
  {
    q: "Puis-je modifier après publication ?",
    a: "Oui, votre page reste modifiable jusqu'au jour J (et même après pour les remerciements).",
  },
  {
    q: "Mes invités doivent-ils installer quelque chose ?",
    a: "Non. Un simple lien à ouvrir dans WhatsApp, iMessage ou par email suffit.",
  },
];

function HowItWorks() {
  return (
    <PageShell
      eyebrow="Comment ça marche"
      title={
        <>
          Votre invitation, prête en{" "}
          <em className="italic text-[#c17c74]">4 étapes.</em>
        </>
      }
      intro="Nous avons pensé chaque étape pour que vous puissiez tout faire depuis votre téléphone, sans compétence technique."
    >
      <section className="mx-auto max-w-5xl px-5 py-12" aria-labelledby="etapes-heading">
        <h2 id="etapes-heading" className="sr-only">Les 4 étapes</h2>
        <ol className="grid gap-6 md:grid-cols-2">

          {STEPS.map((s) => (
            <li
              key={s.n}
              className="rounded-[24px] border border-[#e8c5b6]/50 bg-white/70 p-8 shadow-sm"
            >
              <p className="font-[family-name:var(--font-display)] text-4xl italic text-[#c17c74]">
                {s.n}
              </p>
              <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6b4a3e]">
                {s.desc}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-[#e8c5b6]/40 bg-[#fbeee4]/60 py-16">
        <div className="mx-auto max-w-3xl px-5">
          <p className="text-center font-mono text-[11px] uppercase tracking-[0.3em] text-[#c17c74]">
            Questions fréquentes
          </p>
          <h2 className="mt-4 text-center font-[family-name:var(--font-display)] text-3xl italic sm:text-4xl">
            Tout ce que vous vous demandez.
          </h2>
          <div className="mt-10 divide-y divide-[#e8c5b6]/60">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-left font-[family-name:var(--font-display)] text-lg italic text-[#2b1a14]">
                  {f.q}
                  <span className="text-[#c17c74] transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-[#6b4a3e]">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-20 text-center">
        <h2 className="font-[family-name:var(--font-display)] text-3xl italic sm:text-4xl">
          Prêts à commencer ?
        </h2>
        <p className="mt-3 text-[#6b4a3e]">
          Créez votre page gratuitement, publiez quand vous êtes prêts.
        </p>
        <Link
          to="/signup"
          className="mt-8 inline-block rounded-full bg-[#2b1a14] px-8 py-4 text-sm font-medium text-[#fdf7f3] shadow-lg shadow-[#c17c74]/20 hover:-translate-y-0.5 hover:shadow-xl"
        >
          Créer notre invitation
        </Link>
      </section>
    </PageShell>
  );
}
