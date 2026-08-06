import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  IconPlus,
  IconPencil,
  IconTrash,
  IconLoader2,
  IconEye,
  IconEyeOff,
  IconStar,
  IconExternalLink,
  IconUpload,
} from "@tabler/icons-react";
import {
  listBlogPosts,
  upsertBlogPost,
  setBlogPostPublished,
  deleteBlogPost,
} from "@/lib/admin.functions";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { uploadBlogImage } from "@/lib/blog-upload";
import { CATEGORY_LABELS, type BlogCategory } from "@/lib/blog";


export const Route = createFileRoute("/admin/blog")({
  component: AdminBlog,
});

type PostRow = {
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
  is_published: boolean;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
};

type FormState = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  category: BlogCategory;
  author_name: string;
  author_avatar_url: string;
  reading_time_minutes: number;
  is_featured: boolean;
  is_published: boolean;
  seo_title: string;
  seo_description: string;
};

const EMPTY_FORM: FormState = {
  slug: "",
  title: "",
  excerpt: "",
  content: "",
  cover_image_url: "",
  category: "organisation",
  author_name: "L'équipe MonInvit",
  author_avatar_url: "",
  reading_time_minutes: 4,
  is_featured: false,
  is_published: false,
  seo_title: "",
  seo_description: "",
};

const CATEGORY_KEYS = Object.keys(CATEGORY_LABELS) as BlogCategory[];

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function fmt(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const inputCls =
  "w-full rounded-md border border-border/70 bg-white px-3 py-2 text-sm outline-none focus:border-primary/60";

function AdminBlog() {
  const load = useServerFn(listBlogPosts);
  const save = useServerFn(upsertBlogPost);
  const togglePublish = useServerFn(setBlogPostPublished);
  const remove = useServerFn(deleteBlogPost);

  const [rows, setRows] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = (await load()) as unknown as PostRow[];
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chargement impossible");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter === "published" && !r.is_published) return false;
      if (filter === "draft" && r.is_published) return false;
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        r.slug.toLowerCase().includes(q) ||
        (r.excerpt ?? "").toLowerCase().includes(q)
      );
    });
  }, [rows, filter, search]);

  const stats = useMemo(
    () => ({
      total: rows.length,
      published: rows.filter((r) => r.is_published).length,
      drafts: rows.filter((r) => !r.is_published).length,
    }),
    [rows],
  );

  function openNew() {
    setForm({ ...EMPTY_FORM });
  }

  function openEdit(row: PostRow) {
    setForm({
      id: row.id,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt ?? "",
      content: row.content ?? "",
      cover_image_url: row.cover_image_url ?? "",
      category: row.category,
      author_name: row.author_name,
      author_avatar_url: row.author_avatar_url ?? "",
      reading_time_minutes: row.reading_time_minutes,
      is_featured: row.is_featured,
      is_published: row.is_published,
      seo_title: row.seo_title ?? "",
      seo_description: row.seo_description ?? "",
    });
  }

  async function handleSave() {
    if (!form) return;
    setSaving(true);
    try {
      await save({
        data: {
          ...(form.id ? { id: form.id } : {}),
          slug: form.slug || slugify(form.title),
          title: form.title,
          excerpt: form.excerpt || null,
          content: form.content || null,
          cover_image_url: form.cover_image_url || null,
          category: form.category,
          author_name: form.author_name,
          author_avatar_url: form.author_avatar_url || null,
          reading_time_minutes: form.reading_time_minutes,
          is_featured: form.is_featured,
          is_published: form.is_published,
          published_at: null,
          seo_title: form.seo_title || null,
          seo_description: form.seo_description || null,
        },
      });
      toast.success(form.id ? "Article mis à jour" : "Article créé");
      setForm(null);
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(row: PostRow) {
    setBusyId(row.id);
    try {
      await togglePublish({ data: { id: row.id, is_published: !row.is_published } });
      toast.success(row.is_published ? "Article dépublié" : "Article publié");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action impossible");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(row: PostRow) {
    if (!window.confirm(`Supprimer définitivement « ${row.title} » ?`)) return;
    setBusyId(row.id);
    try {
      await remove({ data: { id: row.id } });
      toast.success("Article supprimé");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Suppression impossible");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="mr-auto">
          <h1 className="font-serif text-xl">Articles du blog</h1>
          <p className="text-sm text-muted-foreground">
            Rédigez, publiez et mettez en avant les contenus du blog.
          </p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          <IconPlus size={15} /> Nouvel article
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: stats.total },
          { label: "Publiés", value: stats.published },
          { label: "Brouillons", value: stats.drafts },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border/70 bg-white p-4">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{s.label}</p>
            <p className="font-serif text-2xl">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(["all", "published", "draft"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3 py-1.5 text-[12px] ${
              filter === f
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border/70 bg-white hover:bg-secondary"
            }`}
          >
            {f === "all" ? "Tous" : f === "published" ? "Publiés" : "Brouillons"}
          </button>
        ))}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un titre, un slug…"
          className="ml-auto w-full max-w-xs rounded-full border border-border/70 bg-white px-3 py-1.5 text-[13px] outline-none focus:border-primary/60"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border/70 bg-white">
        {loading ? (
          <p className="p-6 text-center text-sm text-muted-foreground">Chargement…</p>
        ) : error ? (
          <p className="p-6 text-center text-sm text-destructive">{error}</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">Aucun article.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border/70 bg-neutral-50 text-[11px] uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-normal">Titre</th>
                <th className="px-4 py-2 font-normal">Catégorie</th>
                <th className="px-4 py-2 font-normal">Statut</th>
                <th className="px-4 py-2 font-normal">Publié le</th>
                <th className="px-4 py-2 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-b border-border/50 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {row.is_featured && <IconStar size={14} className="text-primary" />}
                      <div className="min-w-0">
                        <p className="truncate font-medium">{row.title}</p>
                        <p className="truncate text-[11px] text-muted-foreground">/{row.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[12px]">{CATEGORY_LABELS[row.category] ?? row.category}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] ${
                        row.is_published
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {row.is_published ? "Publié" : "Brouillon"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-muted-foreground">{fmt(row.published_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {row.is_published && (
                        <a
                          href={`/blog/${row.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Voir l'article"
                          className="rounded-md p-1.5 hover:bg-secondary"
                        >
                          <IconExternalLink size={15} />
                        </a>
                      )}
                      <button
                        onClick={() => handleToggle(row)}
                        disabled={busyId === row.id}
                        title={row.is_published ? "Dépublier" : "Publier"}
                        className="rounded-md p-1.5 hover:bg-secondary disabled:opacity-50"
                      >
                        {busyId === row.id ? (
                          <IconLoader2 size={15} className="animate-spin" />
                        ) : row.is_published ? (
                          <IconEyeOff size={15} />
                        ) : (
                          <IconEye size={15} />
                        )}
                      </button>
                      <button
                        onClick={() => openEdit(row)}
                        title="Modifier"
                        className="rounded-md p-1.5 hover:bg-secondary"
                      >
                        <IconPencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(row)}
                        disabled={busyId === row.id}
                        title="Supprimer"
                        className="rounded-md p-1.5 text-destructive hover:bg-destructive/10 disabled:opacity-50"
                      >
                        <IconTrash size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {form && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
          <div className="my-6 w-full max-w-2xl space-y-4 rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-center gap-3">
              <h2 className="mr-auto font-serif text-lg">
                {form.id ? "Modifier l'article" : "Nouvel article"}
              </h2>
              <button
                onClick={() => setForm(null)}
                className="rounded-full border border-border/70 px-3 py-1 text-[12px] hover:bg-secondary"
              >
                Fermer
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="sm:col-span-2 space-y-1">
                <span className="text-[12px] text-muted-foreground">Titre</span>
                <input
                  className={inputCls}
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) =>
                      f
                        ? {
                            ...f,
                            title: e.target.value,
                            slug: f.id || f.slug ? f.slug : slugify(e.target.value),
                          }
                        : f,
                    )
                  }
                />
              </label>

              <label className="space-y-1">
                <span className="text-[12px] text-muted-foreground">Slug</span>
                <input
                  className={inputCls}
                  value={form.slug}
                  onChange={(e) => setForm((f) => (f ? { ...f, slug: e.target.value } : f))}
                  onBlur={(e) =>
                    setForm((f) => (f ? { ...f, slug: slugify(e.target.value || f.title) } : f))
                  }
                />
              </label>

              <label className="space-y-1">
                <span className="text-[12px] text-muted-foreground">Catégorie</span>
                <select
                  className={inputCls}
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => (f ? { ...f, category: e.target.value as BlogCategory } : f))
                  }
                >
                  {CATEGORY_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {CATEGORY_LABELS[k]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="sm:col-span-2 space-y-1">
                <span className="text-[12px] text-muted-foreground">Extrait</span>
                <textarea
                  rows={2}
                  className={inputCls}
                  value={form.excerpt}
                  onChange={(e) => setForm((f) => (f ? { ...f, excerpt: e.target.value } : f))}
                />
              </label>

              <div className="sm:col-span-2 space-y-1">
                <span className="text-[12px] text-muted-foreground">Contenu</span>
                <RichTextEditor
                  value={form.content}
                  onChange={(html) => setForm((f) => (f ? { ...f, content: html } : f))}
                />
              </div>

              <div className="sm:col-span-2 space-y-2">
                <span className="text-[12px] text-muted-foreground">Image de couverture</span>
                {form.cover_image_url ? (
                  <div className="relative overflow-hidden rounded-xl border border-border/70">
                    <img
                      src={form.cover_image_url}
                      alt="Aperçu de la couverture"
                      className="h-44 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => (f ? { ...f, cover_image_url: "" } : f))
                      }
                      className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 shadow hover:bg-white"
                      title="Retirer l'image"
                    >
                      <IconTrash size={15} className="text-destructive" />
                    </button>
                  </div>
                ) : null}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => coverRef.current?.click()}
                    disabled={coverUploading}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1.5 text-[12px] hover:bg-secondary disabled:opacity-60"
                  >
                    {coverUploading ? (
                      <IconLoader2 size={14} className="animate-spin" />
                    ) : (
                      <IconUpload size={14} />
                    )}
                    {form.cover_image_url ? "Remplacer l'image" : "Téléverser une image"}
                  </button>
                  <input
                    ref={coverRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      e.target.value = "";
                      if (f) void handleCoverUpload(f);
                    }}
                  />
                  <input
                    className={`${inputCls} flex-1 min-w-[220px]`}
                    placeholder="…ou collez une URL d'image"
                    value={form.cover_image_url}
                    onChange={(e) =>
                      setForm((f) => (f ? { ...f, cover_image_url: e.target.value } : f))
                    }
                  />
                </div>
              </div>


              <label className="space-y-1">
                <span className="text-[12px] text-muted-foreground">Auteur</span>
                <input
                  className={inputCls}
                  value={form.author_name}
                  onChange={(e) => setForm((f) => (f ? { ...f, author_name: e.target.value } : f))}
                />
              </label>

              <label className="space-y-1">
                <span className="text-[12px] text-muted-foreground">Temps de lecture (min)</span>
                <input
                  type="number"
                  min={1}
                  className={inputCls}
                  value={form.reading_time_minutes}
                  onChange={(e) =>
                    setForm((f) =>
                      f ? { ...f, reading_time_minutes: Number(e.target.value) || 1 } : f,
                    )
                  }
                />
              </label>

              <label className="space-y-1">
                <span className="text-[12px] text-muted-foreground">Titre SEO</span>
                <input
                  className={inputCls}
                  value={form.seo_title}
                  onChange={(e) => setForm((f) => (f ? { ...f, seo_title: e.target.value } : f))}
                />
              </label>

              <label className="space-y-1">
                <span className="text-[12px] text-muted-foreground">Description SEO</span>
                <input
                  className={inputCls}
                  value={form.seo_description}
                  onChange={(e) =>
                    setForm((f) => (f ? { ...f, seo_description: e.target.value } : f))
                  }
                />
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) =>
                    setForm((f) => (f ? { ...f, is_published: e.target.checked } : f))
                  }
                />
                Publier l'article
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) =>
                    setForm((f) => (f ? { ...f, is_featured: e.target.checked } : f))
                  }
                />
                Mettre à la une
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setForm(null)}
                className="rounded-full border border-border/70 px-4 py-2 text-sm hover:bg-secondary"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60"
              >
                {saving && <IconLoader2 size={15} className="animate-spin" />} Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
