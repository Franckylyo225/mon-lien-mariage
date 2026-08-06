import { Link } from "@tanstack/react-router";
import {
  CATEGORY_GRADIENTS,
  CATEGORY_LABELS,
  formatDate,
  initials,
  type BlogPost,
} from "@/lib/blog";

export function CategoryBadge({ category }: { category: BlogPost["category"] }) {
  return (
    <span className="inline-block rounded-full bg-[#F5EFE7] px-2 py-[3px] text-[9px] font-semibold uppercase tracking-[0.08em] text-[#993556]">
      {CATEGORY_LABELS[category]}
    </span>
  );
}

export function FeaturedBadge() {
  return (
    <span className="inline-block rounded-full bg-[#993556] px-2 py-[3px] text-[9px] font-semibold uppercase tracking-[0.08em] text-white">
      À la une
    </span>
  );
}

export function PostVisual({
  post,
  className,
  ratio = "16 / 9",
}: {
  post: BlogPost;
  className?: string;
  ratio?: string;
}) {
  if (post.cover_image_url) {
    return (
      <img
        src={post.cover_image_url}
        alt={post.title}
        loading="lazy"
        className={"w-full object-cover " + (className ?? "")}
        style={{ aspectRatio: ratio }}
      />
    );
  }
  return (
    <div
      aria-hidden
      className={"w-full " + (className ?? "")}
      style={{ aspectRatio: ratio, background: CATEGORY_GRADIENTS[post.category] }}
    />
  );
}

export function AuthorMeta({
  post,
  dark = false,
  size = "sm",
}: {
  post: BlogPost;
  dark?: boolean;
  size?: "sm" | "md";
}) {
  const avatarSize = size === "md" ? "size-7 text-[11px]" : "size-6 text-[10px]";
  return (
    <div className="flex items-center gap-2">
      {post.author_avatar_url ? (
        <img
          src={post.author_avatar_url}
          alt={post.author_name}
          className={`${avatarSize} shrink-0 rounded-full object-cover`}
        />
      ) : (
        <span
          aria-hidden
          className={`${avatarSize} grid shrink-0 place-items-center rounded-full border border-[#ED93B1] bg-[#FBEAF0] font-medium text-[#993556]`}
        >
          {initials(post.author_name)}
        </span>
      )}
      <span
        className={
          "text-[11px] " + (dark ? "text-white/40" : "text-[#9CA3AF]")
        }
      >
        {post.author_name} · {formatDate(post.published_at)} ·{" "}
        {post.reading_time_minutes} min
      </span>
    </div>
  );
}

export function BlogCard({ post }: { post: BlogPost }) {
  const story = post.category === "histoires";
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className={
        "group flex flex-col overflow-hidden rounded-[14px] border transition duration-200 hover:-translate-y-[3px] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] " +
        (story ? "border-[#1A1A1A] bg-[#1A1A1A]" : "border-[#EDE8E0] bg-white")
      }
      style={{ borderWidth: "0.5px" }}
    >
      <PostVisual post={post} />
      <div className="flex flex-1 flex-col px-[18px] pt-4 pb-[14px]">
        <div>
          <CategoryBadge category={post.category} />
        </div>
        <h3
          className={
            "my-2 line-clamp-2 font-[family-name:var(--font-serif)] text-[18px] italic leading-[1.3] " +
            (story ? "text-[#FAF8F5]" : "text-[#1A1A1A]")
          }
        >
          {post.title}
        </h3>
        <p
          className={
            "mb-[14px] line-clamp-2 flex-1 text-[13px] leading-[1.6] " +
            (story ? "text-[#FAF8F5]/60" : "text-[#6B6B6B]")
          }
        >
          {post.excerpt}
        </p>
        <div
          className="mt-auto border-t pt-3"
          style={{
            borderTopWidth: "0.5px",
            borderTopColor: story ? "rgba(255,255,255,0.1)" : "#F5F5F5",
          }}
        >
          <AuthorMeta post={post} dark={story} />
        </div>
      </div>
    </Link>
  );
}
