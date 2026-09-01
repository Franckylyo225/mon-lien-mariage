import { supabase } from "@/integrations/supabase/client";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  cover_image_url: string | null;
  category: BlogCategory;
  author_name: string;
  author_avatar_url: string | null;
  reading_time_minutes: number;
  is_featured: boolean;
  published_at: string | null;
  updated_at: string;
  seo_title: string | null;
  seo_description: string | null;
};

export type BlogCategory =
  | "traditions"
  | "organisation"
  | "style"
  | "reception"
  | "histoires";

export const CATEGORIES: { key: BlogCategory | "all"; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "traditions", label: "Traditions" },
  { key: "organisation", label: "Organisation" },
  { key: "style", label: "Style" },
  { key: "reception", label: "Réception" },
];

export const CATEGORY_LABELS: Record<BlogCategory, string> = {
  traditions: "Traditions",
  organisation: "Organisation",
  style: "Style",
  reception: "Réception",
  histoires: "Histoires vraies",
};

export const CATEGORY_GRADIENTS: Record<BlogCategory, string> = {
  traditions: "linear-gradient(135deg, #C8973A, #8B5E3C)",
  organisation: "linear-gradient(135deg, #993556, #4B1528)",
  style: "linear-gradient(135deg, #C97B93, #7A4545)",
  reception: "linear-gradient(135deg, #7A8471, #4B5563)",
  histoires: "linear-gradient(135deg, #1E3A5F, #0D1B2E)",
};

const SELECT =
  "id,slug,title,excerpt,content,cover_image_url,category,author_name,author_avatar_url,reading_time_minutes,is_featured,published_at,updated_at,seo_title,seo_description";

export async function fetchPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(SELECT)
    .eq("is_published", true)
    .order("published_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as BlogPost[];
}

export async function fetchPost(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(SELECT)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as BlogPost) ?? null;
}

export function formatDate(value: string | null): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function initials(name: string): string {
  return name
    .replace(/^L'équipe\s+/i, "")
    .split(/[\s&]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
