import { createServerFn } from "@tanstack/react-start";
import { requireAuth as requireSupabaseAuth } from "@/lib/auth-middleware";

const BASE_PRICE_XOF = 24900;
const DAY_MS = 24 * 3600 * 1000;

async function assertAdmin(context: { supabase: any; userId: string }) {
  const [adminRole, ownerRole] = await Promise.all([
    context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    }),
    context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "owner",
    }),
  ]);
  if (adminRole.error || ownerRole.error) throw new Error("Vérification du rôle échouée");
  if (!adminRole.data && !ownerRole.data) throw new Error("Accès refusé");
}

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [adminRole, ownerRole] = await Promise.all([
      context.supabase.rpc("has_role", {
        _user_id: context.userId,
        _role: "admin",
      }),
      context.supabase.rpc("has_role", {
        _user_id: context.userId,
        _role: "owner",
      }),
    ]);
    if (adminRole.error || ownerRole.error) throw new Error("Vérification du rôle échouée");
    return { isAdmin: Boolean(adminRole.data || ownerRole.data) };
  });

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function buildRangeDayMap(fromMs: number, toMs: number) {
  const map = new Map<string, number>();
  const days = Math.max(1, Math.min(370, Math.round((toMs - fromMs) / DAY_MS) + 1));
  for (let i = days - 1; i >= 0; i--) {
    map.set(dayKey(new Date(toMs - i * DAY_MS)), 0);
  }
  return map;
}

function trend(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 100);
}

export interface StatsRangeInput {
  from?: string; // ISO date
  to?: string; // ISO date
}

export const getPlatformStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: StatsRangeInput | undefined) => data ?? {})
  .handler(async ({ data: range, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const toMs = range.to ? Date.parse(range.to) : Date.now();
    const fromMs = range.from ? Date.parse(range.from) : toMs - 30 * DAY_MS;
    const safeFrom = Number.isFinite(fromMs) ? fromMs : toMs - 30 * DAY_MS;
    const safeTo = Number.isFinite(toMs) ? toMs : Date.now();
    const since = new Date(safeFrom).toISOString();
    const until = new Date(safeTo).toISOString();
    const prevSince = new Date(safeFrom - (safeTo - safeFrom)).toISOString();
    const dayCount = Math.max(1, Math.min(370, Math.round((safeTo - safeFrom) / DAY_MS) + 1));

    const inRange = (q: any, col: string) => q.gte(col, since).lte(col, until);
    const inPrev = (q: any, col: string) => q.gte(col, prevSince).lt(col, since);

    const [
      usersCount,
      usersPrev,
      weddingsCount,
      weddingsPrev,
      publishedCount,
      publishedPrev,
      rsvpsCount,
      rsvpsPrev,
      guestsCount,
      recentWeddings,
      recentUsers,
      publishedByDay,
      rsvpByDay,
      themeRows,
    ] = await Promise.all([
      inRange(supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }), "created_at"),
      inPrev(supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }), "created_at"),
      inRange(supabaseAdmin.from("weddings").select("id", { count: "exact", head: true }), "created_at"),
      inPrev(supabaseAdmin.from("weddings").select("id", { count: "exact", head: true }), "created_at"),
      inRange(
        supabaseAdmin
          .from("weddings")
          .select("id", { count: "exact", head: true })
          .eq("is_published", true)
          .not("published_at", "is", null),
        "published_at",
      ),
      inPrev(
        supabaseAdmin
          .from("weddings")
          .select("id", { count: "exact", head: true })
          .eq("is_published", true)
          .not("published_at", "is", null),
        "published_at",
      ),
      inRange(supabaseAdmin.from("rsvps").select("id", { count: "exact", head: true }), "created_at"),
      inPrev(supabaseAdmin.from("rsvps").select("id", { count: "exact", head: true }), "created_at"),
      inRange(supabaseAdmin.from("guests").select("id", { count: "exact", head: true }), "created_at"),
      supabaseAdmin
        .from("weddings")
        .select("id, bride_name, groom_name, is_published, created_at, published_at, slug")
        .order("created_at", { ascending: false })
        .limit(6),
      supabaseAdmin
        .from("profiles")
        .select("id, email, user_first_name, created_at")
        .order("created_at", { ascending: false })
        .limit(6),
      inRange(
        supabaseAdmin
          .from("weddings")
          .select("published_at")
          .eq("is_published", true)
          .not("published_at", "is", null),
        "published_at",
      ),
      inRange(supabaseAdmin.from("rsvps").select("created_at"), "created_at"),
      supabaseAdmin.from("weddings").select("theme").not("theme", "is", null),
    ]);

    const published = publishedCount.count ?? 0;
    const revenueXof = published * BASE_PRICE_XOF;

    const publishedDayMap = buildRangeDayMap(safeFrom, safeTo);
    for (const row of publishedByDay.data ?? []) {
      const key = String(row.published_at).slice(0, 10);
      if (publishedDayMap.has(key)) publishedDayMap.set(key, (publishedDayMap.get(key) ?? 0) + 1);
    }
    const publishedSeries = Array.from(publishedDayMap.entries()).map(([date, count]) => ({
      date,
      count,
      revenueXof: count * BASE_PRICE_XOF,
    }));

    const rsvpDayMap = buildRangeDayMap(safeFrom, safeTo);
    for (const row of rsvpByDay.data ?? []) {
      const key = String(row.created_at).slice(0, 10);
      if (rsvpDayMap.has(key)) rsvpDayMap.set(key, (rsvpDayMap.get(key) ?? 0) + 1);
    }
    const rsvpSeries = Array.from(rsvpDayMap.entries()).map(([date, count]) => ({ date, count }));

    const themeCounts = new Map<string, number>();
    for (const row of themeRows.data ?? []) {
      const t = String((row as any).theme);
      themeCounts.set(t, (themeCounts.get(t) ?? 0) + 1);
    }
    const topThemes = Array.from(themeCounts.entries())
      .map(([theme, count]) => ({ theme, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const totalWed = weddingsCount.count ?? 0;
    const conversion = totalWed === 0 ? 0 : Math.round((published / totalWed) * 100);

    return {
      users: usersCount.count ?? 0,
      weddings: totalWed,
      published,
      rsvps: rsvpsCount.count ?? 0,
      guests: guestsCount.count ?? 0,
      revenueXof,
      revenuePeriodXof: revenueXof,
      pricePerPublish: BASE_PRICE_XOF,
      conversionRate: conversion,
      range: { from: since, to: until, days: dayCount },
      trends: {
        users: trend(usersCount.count ?? 0, usersPrev.count ?? 0),
        weddings: trend(totalWed, weddingsPrev.count ?? 0),
        published: trend(published, publishedPrev.count ?? 0),
        rsvps: trend(rsvpsCount.count ?? 0, rsvpsPrev.count ?? 0),
        revenue: trend(
          published * BASE_PRICE_XOF,
          (publishedPrev.count ?? 0) * BASE_PRICE_XOF,
        ),
      },
      recentWeddings: recentWeddings.data ?? [],
      recentUsers: recentUsers.data ?? [],
      publishedSeries,
      rsvpSeries,
      topThemes,
    };
  });

export const listAllUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, email, user_first_name, display_name, created_at, deletion_requested_at")
      .order("created_at", { ascending: false })
      .limit(1000);

    const ids = (profiles ?? []).map((p) => p.id);
    const { data: weddings } = ids.length
      ? await supabaseAdmin
          .from("weddings")
          .select("owner_id, is_published")
          .in("owner_id", ids)
      : { data: [] as Array<{ owner_id: string; is_published: boolean }> };

    const { data: roles } = ids.length
      ? await supabaseAdmin
          .from("user_roles")
          .select("user_id, role")
          .in("user_id", ids)
      : { data: [] as Array<{ user_id: string; role: string }> };

    const counts = new Map<string, { total: number; published: number }>();
    for (const w of weddings ?? []) {
      const c = counts.get(w.owner_id) ?? { total: 0, published: 0 };
      c.total += 1;
      if (w.is_published) c.published += 1;
      counts.set(w.owner_id, c);
    }
    const roleMap = new Map<string, string[]>();
    for (const r of roles ?? []) {
      const arr = roleMap.get(r.user_id) ?? [];
      arr.push(r.role);
      roleMap.set(r.user_id, arr);
    }

    return (profiles ?? []).map((p) => ({
      ...p,
      weddings_total: counts.get(p.id)?.total ?? 0,
      weddings_published: counts.get(p.id)?.published ?? 0,
      roles: roleMap.get(p.id) ?? [],
    }));
  });

export const listAllWeddings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: weddings } = await supabaseAdmin
      .from("weddings")
      .select(
        "id, owner_id, bride_name, groom_name, event_type, city, slug, is_published, published_at, wedding_date, created_at, theme",
      )
      .order("created_at", { ascending: false })
      .limit(1000);

    const ownerIds = Array.from(new Set((weddings ?? []).map((w) => w.owner_id)));
    const { data: owners } = ownerIds.length
      ? await supabaseAdmin
          .from("profiles")
          .select("id, email, user_first_name")
          .in("id", ownerIds)
      : { data: [] as Array<{ id: string; email: string | null; user_first_name: string | null }> };
    const ownerMap = new Map((owners ?? []).map((o) => [o.id, o]));

    const wIds = (weddings ?? []).map((w) => w.id);
    const { data: rsvps } = wIds.length
      ? await supabaseAdmin.from("rsvps").select("wedding_id").in("wedding_id", wIds)
      : { data: [] as Array<{ wedding_id: string }> };
    const rsvpCount = new Map<string, number>();
    for (const r of rsvps ?? []) {
      rsvpCount.set(r.wedding_id, (rsvpCount.get(r.wedding_id) ?? 0) + 1);
    }

    return (weddings ?? []).map((w) => ({
      ...w,
      owner_email: ownerMap.get(w.owner_id)?.email ?? null,
      owner_name: ownerMap.get(w.owner_id)?.user_first_name ?? null,
      rsvp_count: rsvpCount.get(w.id) ?? 0,
    }));
  });

export const listPayments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: payments } = await supabaseAdmin
      .from("payments")
      .select(
        "id, user_id, wedding_id, amount_fcfa, currency, payment_type, status, paystack_reference, paystack_transaction_id, payment_method, created_at, updated_at",
      )
      .order("created_at", { ascending: false })
      .limit(1000);

    const rows = payments ?? [];

    const weddingIds = Array.from(
      new Set(rows.map((p) => p.wedding_id).filter(Boolean) as string[]),
    );
    const userIds = Array.from(new Set(rows.map((p) => p.user_id).filter(Boolean)));

    const { data: weddings } = weddingIds.length
      ? await supabaseAdmin
          .from("weddings")
          .select("id, bride_name, groom_name, slug")
          .in("id", weddingIds)
      : { data: [] as Array<{ id: string; bride_name: string; groom_name: string; slug: string | null }> };
    const weddingMap = new Map((weddings ?? []).map((w) => [w.id, w]));

    const { data: owners } = userIds.length
      ? await supabaseAdmin.from("profiles").select("id, email").in("id", userIds)
      : { data: [] as Array<{ id: string; email: string | null }> };
    const ownerMap = new Map((owners ?? []).map((o) => [o.id, o]));

    return rows.map((p) => {
      const w = p.wedding_id ? weddingMap.get(p.wedding_id) : null;
      return {
        id: p.id,
        wedding_id: p.wedding_id,
        couple: w ? `${w.bride_name} & ${w.groom_name}` : "—",
        slug: w?.slug ?? null,
        owner_email: ownerMap.get(p.user_id)?.email ?? null,
        amount_xof: Number(p.amount_fcfa ?? 0),
        currency: p.currency ?? "XOF",
        payment_type: p.payment_type as string,
        status: p.status as string,
        reference: p.paystack_reference as string,
        transaction_id: p.paystack_transaction_id as string | null,
        method: p.payment_method as string | null,
        created_at: p.created_at as string,
        updated_at: p.updated_at as string,
      };
    });
  });


export const listEmailLog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);

    const apiKey = process.env['LOVABLE_API_KEY'];
    if (!apiKey) {
      return { logs: [], totals: { sent: 0, failed: 0, last24: 0 }, historyStartsAt: null as string | null };
    }

    const { listEmailLogs } = await import("@lovable.dev/email-js");
    const res = await listEmailLogs({ limit: 100 }, { apiKey });

    const since24 = Date.now() - DAY_MS;
    const logs = res.data.map((e, i) => ({
      id: `${e.message_id ?? "evt"}-${e.timestamp}-${i}`,
      template_name: (e.tags ?? []).join(", ") || null,
      recipient_email: e.recipient,
      status: e.event_type,
      error_message: e.event_type === "sent" ? null : (e.status ?? null),
      created_at: e.timestamp,
    }));

    return {
      logs,
      totals: {
        sent: logs.filter((l) => l.status === "sent").length,
        failed: logs.filter((l) => ["bounced", "rejected", "complained", "suppressed"].includes(l.status)).length,
        last24: logs.filter((l) => new Date(l.created_at).getTime() >= since24).length,
      },
      historyStartsAt: res.history_starts_at ?? null,
    };
  });


type ActivityItem = {
  id: string;
  kind: "signup" | "wedding_created" | "wedding_published" | "rsvp";
  label: string;
  subtitle: string | null;
  created_at: string;
};

export const listActivity = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ActivityItem[]> => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [signups, weddings, publications, rsvps] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id, email, user_first_name, created_at")
        .order("created_at", { ascending: false })
        .limit(40),
      supabaseAdmin
        .from("weddings")
        .select("id, bride_name, groom_name, created_at, published_at, is_published")
        .order("created_at", { ascending: false })
        .limit(40),
      supabaseAdmin
        .from("weddings")
        .select("id, bride_name, groom_name, published_at")
        .eq("is_published", true)
        .not("published_at", "is", null)
        .order("published_at", { ascending: false })
        .limit(40),
      supabaseAdmin
        .from("rsvps")
        .select("id, guest_name, wedding_id, created_at")
        .order("created_at", { ascending: false })
        .limit(40),
    ]);

    const items: ActivityItem[] = [];
    for (const s of signups.data ?? []) {
      items.push({
        id: `signup-${s.id}`,
        kind: "signup",
        label: `Nouvel inscrit : ${s.user_first_name || s.email || "utilisateur"}`,
        subtitle: s.email ?? null,
        created_at: s.created_at,
      });
    }
    for (const w of weddings.data ?? []) {
      items.push({
        id: `wed-${w.id}`,
        kind: "wedding_created",
        label: `Événement créé : ${w.bride_name} & ${w.groom_name}`,
        subtitle: null,
        created_at: w.created_at,
      });
    }
    for (const p of publications.data ?? []) {
      items.push({
        id: `pub-${p.id}`,
        kind: "wedding_published",
        label: `Publication : ${p.bride_name} & ${p.groom_name}`,
        subtitle: null,
        created_at: p.published_at as string,
      });
    }
    for (const r of rsvps.data ?? []) {
      items.push({
        id: `rsvp-${r.id}`,
        kind: "rsvp",
        label: `RSVP : ${r.guest_name ?? "invité"}`,
        subtitle: null,
        created_at: r.created_at,
      });
    }
    items.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    return items.slice(0, 80);
  });

interface RoleInput {
  userId: string;
  role: "admin" | "moderator";
  grant: boolean;
}

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: RoleInput) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.grant) {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: data.userId, role: data.role } as never);
      if (error && !String(error.message).includes("duplicate")) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", data.userId)
        .eq("role", data.role);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

// ---------- Codes promo ----------

export const listPromoCodes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("promo_codes")
      .select(
        "id, code, discount_percent, max_uses, uses, valid_from, valid_until, is_active, notes, created_at, updated_at",
      )
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

interface PromoUpsertInput {
  id?: string;
  code: string;
  discount_percent: number;
  max_uses: number | null;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  notes: string | null;
}

function validatePromoInput(data: PromoUpsertInput) {
  const code = (data.code || "").trim().toUpperCase();
  if (!/^[A-Z0-9_-]{3,32}$/.test(code)) {
    throw new Error("Code invalide (3-32 caractères A-Z, chiffres, - ou _).");
  }
  const discount = Math.round(Number(data.discount_percent));
  if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
    throw new Error("La remise doit être entre 0 et 100.");
  }
  const max_uses =
    data.max_uses === null || data.max_uses === undefined ? null : Math.max(1, Math.round(Number(data.max_uses)));
  return { code, discount, max_uses };
}

export const upsertPromoCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: PromoUpsertInput) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { code, discount, max_uses } = validatePromoInput(data);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const payload = {
      code,
      discount_percent: discount,
      max_uses,
      valid_from: data.valid_from || null,
      valid_until: data.valid_until || null,
      is_active: data.is_active,
      notes: data.notes?.trim() ? data.notes.trim() : null,
    };

    if (data.id) {
      const { error } = await supabaseAdmin
        .from("promo_codes")
        .update(payload as never)
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: data.id };
    }

    const { data: inserted, error } = await supabaseAdmin
      .from("promo_codes")
      .insert({ ...payload, created_by: context.userId } as never)
      .select("id")
      .single();
    if (error) {
      if (String(error.message).toLowerCase().includes("duplicate")) {
        throw new Error("Ce code existe déjà.");
      }
      throw new Error(error.message);
    }
    return { ok: true, id: (inserted as { id: string }).id };
  });

export const deletePromoCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("promo_codes").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });


// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------

const BLOG_SELECT =
  "id, slug, title, excerpt, content, cover_image_url, category, author_name, author_avatar_url, reading_time_minutes, is_featured, is_published, published_at, seo_title, seo_description, created_at, updated_at";

interface BlogUpsertInput {
  id?: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  cover_image_url: string | null;
  category: string;
  author_name: string;
  author_avatar_url: string | null;
  reading_time_minutes: number;
  is_featured: boolean;
  is_published: boolean;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
}

const BLOG_CATEGORIES = ["traditions", "organisation", "style", "reception", "histoires"];

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const listBlogPosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("blog_posts")
      .select(BLOG_SELECT)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertBlogPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: BlogUpsertInput) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const title = (data.title || "").trim();
    if (title.length < 3) throw new Error("Le titre est requis (3 caractères minimum).");
    const slug = slugify(data.slug || title);
    if (!slug) throw new Error("Slug invalide.");
    if (!BLOG_CATEGORIES.includes(data.category)) throw new Error("Catégorie invalide.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const payload = {
      slug,
      title,
      excerpt: data.excerpt?.trim() || null,
      content: data.content ?? null,
      cover_image_url: data.cover_image_url?.trim() || null,
      category: data.category,
      author_name: data.author_name?.trim() || "L'équipe MonInvit",
      author_avatar_url: data.author_avatar_url?.trim() || null,
      reading_time_minutes: Math.max(1, Math.round(Number(data.reading_time_minutes) || 4)),
      is_featured: !!data.is_featured,
      is_published: !!data.is_published,
      published_at: data.is_published ? (data.published_at || new Date().toISOString()) : null,
      seo_title: data.seo_title?.trim() || null,
      seo_description: data.seo_description?.trim() || null,
    };

    if (payload.is_featured) {
      const q = supabaseAdmin.from("blog_posts").update({ is_featured: false } as never).eq("is_featured", true);
      const { error: unfeatureError } = data.id ? await q.neq("id", data.id) : await q;
      if (unfeatureError) throw new Error(unfeatureError.message);
    }

    if (data.id) {
      const { error } = await supabaseAdmin
        .from("blog_posts")
        .update(payload as never)
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: data.id };
    }

    const { data: inserted, error } = await supabaseAdmin
      .from("blog_posts")
      .insert(payload as never)
      .select("id")
      .single();
    if (error) {
      if (String(error.message).toLowerCase().includes("duplicate")) {
        throw new Error("Ce slug existe déjà.");
      }
      throw new Error(error.message);
    }
    return { ok: true, id: (inserted as { id: string }).id };
  });

export const setBlogPostPublished = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; is_published: boolean }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("blog_posts")
      .update({
        is_published: data.is_published,
        published_at: data.is_published ? new Date().toISOString() : null,
      } as never)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteBlogPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("blog_posts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Réinitialisation de mot de passe (admin) ----------

export const sendPasswordResetEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { email: string }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const email = (data.email || "").trim().toLowerCase();
    if (!email.includes("@")) throw new Error("Adresse email invalide");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: "https://moninvit.com/reset-password",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminSetUserPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { userId: string; password: string }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const pw = data.password ?? "";
    if (pw.length < 8 || !/[A-Z]/.test(pw) || !/[a-z]/.test(pw) || !/\d/.test(pw)) {
      throw new Error(
        "Mot de passe trop faible : 8 caractères minimum, une majuscule, une minuscule et un chiffre.",
      );
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      password: pw,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
