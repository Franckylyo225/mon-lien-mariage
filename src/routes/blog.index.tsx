import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { BlogCard, AuthorMeta, CategoryBadge, FeaturedBadge, PostVisual } from "@/components/blog/BlogCard";
import { CATEGORIES, fetchPosts, type BlogCategory } from "@/lib/blog";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog — Conseils & histoires de mariage | MonInvit.com" },
      {
        name: "description",
        content:
          "Des histoires vraies, des guides pratiques et des idées pour préparer un mariage ivoirien à votre image : dot, coutumier, civil, réception.",
      },
      { property: "og:title", content: "Blog — MonInvit.com" },
      {
        property: "og:description",
        content:
          "Histoires de couples, guides pratiques et inspirations pour préparer votre mariage en Côte d'Ivoire.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://moninvit.com/blog" },
      { property: "og:site_name", content: "MonInvit.com" },
      { property: "og:locale", content: "fr_FR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Blog — MonInvit.com" },
      {
        name: "twitter:description",
        content: "Histoires de couples et conseils pour un mariage inoubliable.",
      },
    ],
    links: [{ rel: "canonical", href: "https://moninvit.com/blog" }],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const [active, setActive] = useState<BlogCategory | "all">("all");
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: fetchPosts,
  });

  const categoriesCount = useMemo(
    () => new Set(posts.map((p) => p.category)).size,
    [posts],
  );

  const filtered = useMemo(
    () => (active === "all" ? posts : posts.filter((p) => p.category === active)),
    [posts, active],
  );

  const featured =
    active === "all" ? posts.find((p) => p.is_featured) ?? posts[0] : undefined;
  const rest = filtered.filter((p) => p.id !== featured?.id);
  const first = rest.slice(0, 6);
  const later = rest.slice(6);
  const stories = later.filter((p) => p.category === "histoires");
  const others = later.filter((p) => p.category !== "histoires");

  return (
    <div className="min-h-dvh overflow-x-hidden bg-[#fdf7f3] text-[#2b1a14]">
      <SiteHeader />
      <main id="main">
        {/* Hero */}
        <section className="relative isolate">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(1000px 500px at 50% -10%, #f6d9cb 0%, #fdf7f3 60%, #fdf7f3 100%)",
            }}
          />
          <div className="mx-auto max-w-4xl px-5 pt-14 pb-10 text-center sm:pt-20">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#c17c74]">
              Le journal
            </p>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl leading-[1.05] sm:text-6xl">
              Inspirations & conseils pour{" "}
              <em className="italic text-[#c17c74]">votre grand jour.</em>
            </h1>
            <p className="mx-auto mt-5 max-w-[520px] text-[16px] leading-relaxed text-[#6B6B6B]">
              Des histoires vraies, des guides pratiques et des idées pour préparer
              un mariage ivoirien à votre image. Chaque semaine, une nouvelle lecture.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <Pill>{posts.length} articles</Pill>
              <Pill>{categoriesCount} catégories</Pill>
              <Pill>Mis à jour chaque semaine</Pill>
            </div>
          </div>
        </section>

        {/* Sticky filters */}
        <div
          className="sticky top-0 z-30 border-b py-3 backdrop-blur"
          style={{
            background: "rgba(250,248,245,0.95)",
            borderBottomWidth: "0.5px",
            borderBottomColor: "#EDE8E0",
          }}
        >
          <div className="mx-auto max-w-6xl px-5">
            <div className="flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {CATEGORIES.map((c) => {
                const isActive = active === c.key;
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setActive(c.key)}
                    aria-pressed={isActive}
                    className={
                      "whitespace-nowrap rounded-full border px-4 py-1.5 text-[12px] transition-all duration-150 " +
                      (isActive
                        ? "border-[#1A1A1A] bg-[#1A1A1A] text-white"
                        : "border-[#E5E5E5] bg-white text-[#6B6B6B] hover:border-[#993556] hover:text-[#993556]")
                    }
                    style={{ borderWidth: "0.5px" }}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <section className="mx-auto max-w-6xl px-5 pt-10 pb-16">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-72 animate-pulse rounded-[14px] bg-[#f1e6dd]"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-16 text-center text-sm text-[#6B6B6B]">
              Aucun article dans cette catégorie pour le moment.
            </p>
          ) : (
            <div key={active} className="animate-in fade-in duration-300">
              {/* Featured */}
              {featured ? (
                <Link
                  to="/blog/$slug"
                  params={{ slug: featured.slug }}
                  className="group grid items-center gap-8 md:grid-cols-2"
                >
                  <PostVisual
                    post={featured}
                    ratio="4 / 3"
                    className="rounded-2xl"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <CategoryBadge category={featured.category} />
                      <FeaturedBadge />
                    </div>
                    <h2 className="mt-4 font-[family-name:var(--font-serif)] text-[28px] leading-tight text-[#1A1A1A] transition group-hover:text-[#993556] sm:text-[32px]">
                      {featured.title}
                    </h2>
                    <p className="mt-3 text-[15px] leading-relaxed text-[#6B6B6B]">
                      {featured.excerpt}
                    </p>
                    <div className="mt-5">
                      <AuthorMeta post={featured} size="md" />
                    </div>
                    <span className="mt-6 inline-flex items-center rounded-[10px] bg-[#993556] px-6 py-3 text-sm font-semibold text-white transition group-hover:opacity-90">
                      Lire l'article →
                    </span>
                  </div>
                </Link>
              ) : null}

              {/* First grid */}
              {first.length > 0 ? (
                <div
                  className={
                    "grid gap-6 md:grid-cols-2 lg:grid-cols-3 " +
                    (featured ? "mt-12" : "")
                  }
                >
                  {first.map((p) => (
                    <BlogCard key={p.id} post={p} />
                  ))}
                </div>
              ) : null}

              {/* CTA */}
              <div
                className="my-10 rounded-[20px] px-6 py-10 text-center sm:px-12"
                style={{
                  background:
                    "linear-gradient(135deg, #4B1528 0%, #993556 100%)",
                }}
              >
                <h3 className="font-[family-name:var(--font-serif)] text-[24px] italic leading-[1.3] text-[#FBEAF0] sm:text-[28px]">
                  Votre invitation est déjà en train de s'écrire.
                </h3>
                <p className="mx-auto mt-3 max-w-lg text-[15px] leading-[1.6] text-[#FBEAF0]/70">
                  Rejoignez +500 couples qui ont choisi MonInvit.com pour partager
                  leur mariage avec leurs proches.
                </p>
                <Link
                  to="/signup"
                  className="mt-6 inline-flex rounded-[10px] bg-[#FBEAF0] px-7 py-[13px] text-sm font-semibold text-[#4B1528] transition hover:opacity-90"
                >
                  Créer mon invitation gratuitement →
                </Link>
              </div>

              {/* Others */}
              {others.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {others.map((p) => (
                    <BlogCard key={p.id} post={p} />
                  ))}
                </div>
              ) : null}

              {/* Stories section */}
              {stories.length > 0 ? (
                <>
                  <div className="mx-auto mt-12 mb-8 max-w-xl text-center">
                    <p className="mb-2 text-[10px] uppercase tracking-[0.12em] text-[#993556]">
                      ✦ Témoignages
                    </p>
                    <h2 className="mb-1.5 font-[family-name:var(--font-serif)] text-[26px] italic text-[#1A1A1A]">
                      Ils ont dit oui avec MonInvit
                    </h2>
                    <p className="text-[14px] text-[#6B6B6B]">
                      Des couples ivoiriens partagent leur expérience.
                    </p>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {stories.map((p) => (
                      <BlogCard key={p.id} post={p} />
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* Newsletter */}
          <div className="mt-16 rounded-[28px] bg-[#2b1a14] px-6 py-10 text-center text-[#fdf7f3] sm:px-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#e8c5b6]">
              Newsletter
            </p>
            <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl italic sm:text-3xl">
              Un email par mois.
              <br />
              Des idées pour votre mariage ivoirien.
            </h3>
            <form
              className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row"
              onSubmit={(e) => e.preventDefault()}
            >
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
            <p className="mt-4 text-[11px] text-white/50">
              ✓ Pas de spam · ✓ Désabonnement en un clic
              <br />+ 1 200 futurs mariés déjà abonnés
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-[#F5EFE7] px-3 py-1 text-[11px] text-[#993556]">
      {children}
    </span>
  );
}
