import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/site/SiteChrome";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — Conseils & inspirations mariage | MonMariage.ci" },
      {
        name: "description",
        content:
          "Conseils, checklists et inspirations pour organiser un mariage inoubliable en Côte d'Ivoire : dot, civil, religieux, réception.",
      },
      { property: "og:title", content: "Blog — MonMariage.ci" },
      {
        property: "og:description",
        content:
          "Idées, tendances et guides pratiques pour préparer votre mariage sereinement.",
      },
    ],
  }),
  component: Blog,
});

const POSTS = [
  {
    slug: "checklist-mariage-6-mois",
    category: "Organisation",
    date: "12 juin 2027",
    title: "La checklist ultime des 6 derniers mois avant le mariage",
    excerpt:
      "De la liste d'invités au choix du traiteur, un plan clair pour ne rien oublier lors de la dernière ligne droite.",
    tone: "cream",
  },
  {
    slug: "reussir-sa-dot-abidjan",
    category: "Traditions",
    date: "28 mai 2027",
    title: "Réussir sa dot à Abidjan : le guide des familles",
    excerpt:
      "Symboles, présents, prises de parole : comment honorer la tradition tout en gardant une cérémonie fluide.",
    tone: "clay",
  },
  {
    slug: "tenues-mariage-civil",
    category: "Style",
    date: "10 mai 2027",
    title: "10 idées de tenues pour un mariage civil moderne",
    excerpt:
      "Tailleurs, robes courtes, ensembles pantalon : notre sélection pour un look chic à la mairie.",
    tone: "sage",
  },
  {
    slug: "playlist-reception",
    category: "Réception",
    date: "22 avril 2027",
    title: "La playlist parfaite pour faire danser toute la salle",
    excerpt:
      "Coupé-décalé, afrobeats, slow romantiques : notre recette pour un dancefloor jamais vide.",
    tone: "cream",
  },
  {
    slug: "gerer-plan-de-table",
    category: "Organisation",
    date: "05 avril 2027",
    title: "Gérer son plan de table sans se prendre la tête",
    excerpt:
      "La méthode simple pour placer 200 invités sans froisser personne, avec les RSVP MonMariage.ci.",
    tone: "clay",
  },
  {
    slug: "photos-mariage-conseils",
    category: "Photo",
    date: "18 mars 2027",
    title: "5 conseils pour des photos de mariage inoubliables",
    excerpt:
      "Briefer votre photographe, penser la lumière, prévoir les moments clés : nos astuces essentielles.",
    tone: "sage",
  },
];

const TONES: Record<string, string> = {
  cream: "bg-[#fbeee4] border border-[#e8c5b6]/50",
  clay: "bg-[#c17c74] text-[#fdf7f3]",
  sage: "bg-[#e5ded1] border border-[#d5c9b3]/60",
};

function Blog() {
  const [featured, ...rest] = POSTS;
  return (
    <PageShell
      eyebrow="Le journal"
      title={
        <>
          Inspirations & conseils pour{" "}
          <em className="italic text-[#c17c74]">votre grand jour.</em>
        </>
      }
      intro="Chaque semaine, des idées, guides et retours d'expérience pour préparer un mariage à votre image."
    >
      <section className="mx-auto max-w-6xl px-5 pb-16">
        {/* Featured */}
        <Link
          to="/blog"
          className="group grid overflow-hidden rounded-[28px] border border-[#e8c5b6]/50 bg-white/70 shadow-sm md:grid-cols-2"
        >
          <div
            className="min-h-[220px] bg-gradient-to-br from-[#f6d9cb] via-[#e8c5b6] to-[#c17c74]"
            aria-hidden
          />
          <div className="p-8 sm:p-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#c17c74]">
              À la une · {featured.category}
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl leading-tight transition group-hover:text-[#c17c74] sm:text-4xl">
              {featured.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#6b4a3e]">
              {featured.excerpt}
            </p>
            <p className="mt-6 text-xs text-[#8a6a5e]">{featured.date} · 6 min de lecture</p>
          </div>
        </Link>

        {/* Grid */}
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => (
            <Link
              key={p.slug}
              to="/blog"
              className={`group flex flex-col overflow-hidden rounded-[24px] p-6 transition hover:-translate-y-1 hover:shadow-xl ${TONES[p.tone]}`}
            >
              <p
                className={
                  "font-mono text-[10px] uppercase tracking-[0.28em] " +
                  (p.tone === "clay" ? "text-[#fdf7f3]/80" : "text-[#c17c74]")
                }
              >
                {p.category}
              </p>
              <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl leading-tight sm:text-2xl">
                {p.title}
              </h3>
              <p
                className={
                  "mt-2 flex-1 text-sm leading-relaxed " +
                  (p.tone === "clay" ? "text-[#fdf7f3]/85" : "text-[#6b4a3e]")
                }
              >
                {p.excerpt}
              </p>
              <p
                className={
                  "mt-6 text-xs " +
                  (p.tone === "clay" ? "text-[#fdf7f3]/70" : "text-[#8a6a5e]")
                }
              >
                {p.date}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-16 rounded-[28px] bg-[#2b1a14] px-6 py-10 text-center text-[#fdf7f3] sm:px-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#e8c5b6]">
            Newsletter
          </p>
          <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl italic sm:text-3xl">
            Recevez nos meilleures idées, une fois par mois.
          </h3>
          <form className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              placeholder="votre@email.com"
              className="flex-1 rounded-full border border-[#e8c5b6]/40 bg-[#fdf7f3]/10 px-5 py-3 text-sm text-[#fdf7f3] placeholder:text-[#e8c5b6]/60 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-full bg-[#c17c74] px-6 py-3 text-sm font-medium text-[#fdf7f3] hover:opacity-90"
            >
              S'inscrire
            </button>
          </form>
        </div>
      </section>
    </PageShell>
  );
}
