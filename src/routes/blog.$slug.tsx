import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { BlogCard, CategoryBadge, PostVisual } from "@/components/blog/BlogCard";
import {
  CATEGORY_LABELS,
  fetchPost,
  fetchPosts,
  formatDate,
  initials,
  type BlogPost,
} from "@/lib/blog";

const SITE = "https://moninvit.com";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const post = await fetchPost(params.slug);
    if (!post) throw notFound();
    return post;
  },
  head: ({ params, loaderData }) => {
    const post = loaderData as BlogPost | undefined;
    if (!post) return {};
    const url = `${SITE}/blog/${params.slug}`;
    const desc = post.seo_description ?? post.excerpt ?? "";
    const meta: Array<Record<string, string>> = [
      { title: `${post.seo_title ?? post.title} · MonInvit Blog` },
      { name: "description", content: desc },
      { property: "og:title", content: post.title },
      { property: "og:description", content: post.excerpt ?? desc },
      { property: "og:url", content: url },
      { property: "og:type", content: "article" },
      { property: "og:site_name", content: "MonInvit.com" },
      { property: "og:locale", content: "fr_FR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: post.title },
      { name: "twitter:description", content: post.excerpt ?? desc },
    ];
    if (post.cover_image_url) {
      meta.push({ property: "og:image", content: post.cover_image_url });
      meta.push({ name: "twitter:image", content: post.cover_image_url });
    }
    return {
      meta,
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt ?? desc,
            image: post.cover_image_url ?? undefined,
            author: { "@type": "Organization", name: "MonInvit" },
            publisher: {
              "@type": "Organization",
              name: "MonInvit",
              url: SITE,
            },
            datePublished: post.published_at,
            dateModified: post.updated_at,
            mainEntityOfPage: url,
          }),
        },
      ],
    };
  },
  component: BlogArticle;
});

function renderMarkdown(content: string) {
  const blocks = content.split(/\n{2,}/);
  return blocks.map((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("## ")) {
      return (
        <h2
          key={i}
          className="mt-10 mb-3 font-[family-name:var(--font-serif)] text-[24px] leading-tight text-[#1A1A1A]"
        >
          {trimmed.slice(3)}
        </h2>
      );
    }
    if (trimmed.startsWith("### ")) {
      return (
        <h3
          key={i}
          className="mt-8 mb-2 font-[family-name:var(--font-serif)] text-[19px] text-[#1A1A1A]"
        >
          {trimmed.slice(4)}
        </h3>
      );
    }
    const lines = trimmed.split("\n");
    if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
      return (
        <ul key={i} className="my-4 list-disc space-y-1.5 pl-5 text-[#4B4B4B]">
          {lines.map((l, j) => (
            <li key={j}>{l.replace(/^\s*[-*]\s+/, "")}</li>
          ))}
        </ul>
      );
    }
    if (lines.every((l) => /^\s*\d+\.\s+/.test(l))) {
      return (
        <ol key={i} className="my-4 list-decimal space-y-1.5 pl-5 text-[#4B4B4B]">
          {lines.map((l, j) => (
            <li key={j}>{l.replace(/^\s*\d+\.\s+/, "")}</li>
          ))}
        </ol>
      );
    }
    return (
      <p key={i} className="my-4 text-[16px] leading-[1.75] text-[#4B4B4B]">
        {trimmed}
      </p>
    );
  });
}

function BlogArticle() {
  const post = Route.useLoaderData();
  const [copied, setCopied] = useState(false);
  const url = `${SITE}/blog/${post.slug}`;

  const { data: all = [] } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: fetchPosts,
  });
  const suggested = all
    .filter((p) => p.id !== post.id)
    .sort((a, b) =>
      a.category === post.category ? -1 : b.category === post.category ? 1 : 0,
    )
    .slice(0, 3);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const shareLinks = (
    <>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(post.title + " " + url)}`}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 text-[13px] text-[#6B6B6B] transition hover:text-[#993556]"
      >
        <span aria-hidden>💬</span> Partager
      </a>
      <button
        type="button"
        onClick={copyLink}
        className="flex items-center gap-2 text-[13px] text-[#6B6B6B] transition hover:text-[#993556]"
      >
        <span aria-hidden>🔗</span> {copied ? "Lien copié" : "Copier le lien"}
      </button>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 text-[13px] text-[#6B6B6B] transition hover:text-[#993556]"
      >
        <span aria-hidden>ƒ</span> Facebook
      </a>
    </>
  );

  return (
    <div className="min-h-dvh overflow-x-hidden bg-[#fdf7f3] text-[#2b1a14]">
      <SiteHeader />
      <main id="main" className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-10 lg:grid-cols-[180px_minmax(0,1fr)]">
          {/* Share rail */}
          <aside className="hidden lg:block">
            <div className="sticky top-8 flex flex-col gap-3">
              <Link
                to="/blog"
                className="text-[13px] text-[#6B6B6B] transition hover:text-[#993556]"
              >
                ↑ Retour au blog
              </Link>
              <div className="mt-3 flex flex-col gap-3 border-t border-[#EDE8E0] pt-4">
                {shareLinks}
              </div>
            </div>
          </aside>

          <article className="min-w-0">
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#9CA3AF]">
              <CategoryBadge category={post.category} />
              <span>{formatDate(post.published_at)}</span>
              <span>{post.reading_time_minutes} min de lecture</span>
            </div>

            <h1 className="mt-4 font-[family-name:var(--font-serif)] text-[28px] italic leading-[1.15] text-[#1A1A1A] sm:text-[42px]">
              {post.title}
            </h1>

            {post.excerpt ? (
              <p className="mt-4 font-[family-name:var(--font-display)] text-[18px] italic leading-relaxed text-[#4B4B4B]">
                {post.excerpt}
              </p>
            ) : null}

            <div className="mt-6 flex items-center gap-3">
              {post.author_avatar_url ? (
                <img
                  src={post.author_avatar_url}
                  alt={post.author_name}
                  className="size-9 rounded-full object-cover"
                />
              ) : (
                <span
                  aria-hidden
                  className="grid size-9 place-items-center rounded-full border border-[#ED93B1] bg-[#FBEAF0] text-[12px] font-medium text-[#993556]"
                >
                  {initials(post.author_name)}
                </span>
              )}
              <div className="text-[12px] leading-tight text-[#6B6B6B]">
                <p>Rédigé par {post.author_name}</p>
                <p className="text-[#9CA3AF]">
                  Mis à jour le{" "}
                  {new Date(post.updated_at).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl">
              <PostVisual post={post} ratio="16 / 9" />
            </div>

            <div className="mt-8">{renderMarkdown(post.content ?? "")}</div>

            {/* Mobile share bar */}
            <div className="mt-10 flex flex-wrap items-center gap-5 border-t border-[#EDE8E0] pt-5 lg:hidden">
              {shareLinks}
            </div>

            {/* Article CTA */}
            <div
              className="my-10 flex items-start gap-4 rounded-r-[14px] border border-l-[3px] border-[#EDE8E0] border-l-[#993556] bg-[#FAF6F2] px-7 py-6"
            >
              <span aria-hidden className="text-xl">
                📱
              </span>
              <div>
                <h2 className="font-[family-name:var(--font-serif)] text-[19px] text-[#1A1A1A]">
                  Envoyez votre invitation par WhatsApp
                </h2>
                <p className="mt-2 text-[14px] leading-relaxed text-[#6B6B6B]">
                  Créez une page d'invitation en 30 minutes. Partagez le lien à tous
                  vos invités. Recevez les confirmations automatiquement.
                </p>
                <Link
                  to="/signup"
                  className="mt-4 inline-flex rounded-[10px] bg-[#993556] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Essayer gratuitement →
                </Link>
              </div>
            </div>

            {suggested.length > 0 ? (
              <section className="mt-14">
                <h2 className="mb-6 font-[family-name:var(--font-serif)] text-[22px] italic text-[#1A1A1A]">
                  Lire aussi →
                </h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {suggested.map((p) => (
                    <BlogCard key={p.id} post={p} />
                  ))}
                </div>
              </section>
            ) : null}
          </article>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

export const _unused = CATEGORY_LABELS;
