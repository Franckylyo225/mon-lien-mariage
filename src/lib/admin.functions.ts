import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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

function buildDayMap(days: number) {
  const map = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    map.set(dayKey(new Date(Date.now() - i * DAY_MS)), 0);
  }
  return map;
}

function trend(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 100);
}

export const getPlatformStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const nowIso = new Date().toISOString();
    const since30 = new Date(Date.now() - 30 * DAY_MS).toISOString();
    const since60 = new Date(Date.now() - 60 * DAY_MS).toISOString();

    const [
      usersCount,
      usersRecent,
      usersPrev,
      weddingsCount,
      weddingsRecent,
      weddingsPrev,
      publishedCount,
      publishedRecent,
      publishedPrev,
      rsvpsCount,
      rsvpsRecent,
      rsvpsPrev,
      guestsCount,
      recentWeddings,
      recentUsers,
      publishedByDay,
      rsvpByDay,
      themeRows,
    ] = await Promise.all([
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", since30),
      supabaseAdmin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since60)
        .lt("created_at", since30),
      supabaseAdmin.from("weddings").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("weddings").select("id", { count: "exact", head: true }).gte("created_at", since30),
      supabaseAdmin
        .from("weddings")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since60)
        .lt("created_at", since30),
      supabaseAdmin.from("weddings").select("id", { count: "exact", head: true }).eq("is_published", true),
      supabaseAdmin
        .from("weddings")
        .select("id", { count: "exact", head: true })
        .eq("is_published", true)
        .gte("published_at", since30),
      supabaseAdmin
        .from("weddings")
        .select("id", { count: "exact", head: true })
        .eq("is_published", true)
        .gte("published_at", since60)
        .lt("published_at", since30),
      supabaseAdmin.from("rsvps").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("rsvps").select("id", { count: "exact", head: true }).gte("created_at", since30),
      supabaseAdmin
        .from("rsvps")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since60)
        .lt("created_at", since30),
      supabaseAdmin.from("guests").select("id", { count: "exact", head: true }),
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
      supabaseAdmin
        .from("weddings")
        .select("published_at")
        .eq("is_published", true)
        .not("published_at", "is", null)
        .gte("published_at", since30),
      supabaseAdmin.from("rsvps").select("created_at").gte("created_at", since30),
      supabaseAdmin.from("weddings").select("theme").not("theme", "is", null),
    ]);

    // Suppress unused nowIso warning
    void nowIso;

    const published = publishedCount.count ?? 0;
    const revenueXof = published * BASE_PRICE_XOF;

    const publishedDayMap = buildDayMap(30);
    for (const row of publishedByDay.data ?? []) {
      const key = String(row.published_at).slice(0, 10);
      if (publishedDayMap.has(key)) publishedDayMap.set(key, (publishedDayMap.get(key) ?? 0) + 1);
    }
    const publishedSeries = Array.from(publishedDayMap.entries()).map(([date, count]) => ({
      date,
      count,
      revenueXof: count * BASE_PRICE_XOF,
    }));

    const rsvpDayMap = buildDayMap(30);
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
      revenue30Xof: (publishedRecent.count ?? 0) * BASE_PRICE_XOF,
      pricePerPublish: BASE_PRICE_XOF,
      conversionRate: conversion,
      trends: {
        users: trend(usersRecent.count ?? 0, usersPrev.count ?? 0),
        weddings: trend(weddingsRecent.count ?? 0, weddingsPrev.count ?? 0),
        published: trend(publishedRecent.count ?? 0, publishedPrev.count ?? 0),
        rsvps: trend(rsvpsRecent.count ?? 0, rsvpsPrev.count ?? 0),
        revenue: trend(
          (publishedRecent.count ?? 0) * BASE_PRICE_XOF,
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

    const { data: weddings } = await supabaseAdmin
      .from("weddings")
      .select("id, owner_id, bride_name, groom_name, slug, published_at")
      .eq("is_published", true)
      .not("published_at", "is", null)
      .order("published_at", { ascending: false })
      .limit(1000);

    const ownerIds = Array.from(new Set((weddings ?? []).map((w) => w.owner_id)));
    const { data: owners } = ownerIds.length
      ? await supabaseAdmin
          .from("profiles")
          .select("id, email")
          .in("id", ownerIds)
      : { data: [] as Array<{ id: string; email: string | null }> };
    const ownerMap = new Map((owners ?? []).map((o) => [o.id, o]));

    return (weddings ?? []).map((w) => ({
      wedding_id: w.id,
      couple: `${w.bride_name} & ${w.groom_name}`,
      slug: w.slug,
      owner_email: ownerMap.get(w.owner_id)?.email ?? null,
      paid_at: w.published_at,
      amount_xof: BASE_PRICE_XOF,
    }));
  });

export const listEmailLog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ data: logs }, sentCount, failedCount, last24Count] = await Promise.all([
      supabaseAdmin
        .from("email_send_log")
        .select("id, template_name, recipient_email, status, error_message, created_at")
        .order("created_at", { ascending: false })
        .limit(500),
      supabaseAdmin.from("email_send_log").select("id", { count: "exact", head: true }).eq("status", "sent"),
      supabaseAdmin.from("email_send_log").select("id", { count: "exact", head: true }).eq("status", "failed"),
      supabaseAdmin
        .from("email_send_log")
        .select("id", { count: "exact", head: true })
        .gte("created_at", new Date(Date.now() - DAY_MS).toISOString()),
    ]);

    return {
      logs: logs ?? [],
      totals: {
        sent: sentCount.count ?? 0,
        failed: failedCount.count ?? 0,
        last24: last24Count.count ?? 0,
      },
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

