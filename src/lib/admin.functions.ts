import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const BASE_PRICE_XOF = 24900;

async function assertAdmin(context: {
  supabase: { rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }> };
  userId: string;
}) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error("Vérification du rôle échouée");
  if (!data) throw new Error("Accès refusé");
}

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { isAdmin: Boolean(data) };
  });

export const getPlatformStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [
      usersCount,
      weddingsCount,
      publishedCount,
      rsvpsCount,
      guestsCount,
      recentWeddings,
      recentUsers,
      publishedByDay,
    ] = await Promise.all([
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("weddings").select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("weddings")
        .select("id", { count: "exact", head: true })
        .eq("is_published", true),
      supabaseAdmin.from("rsvps").select("id", { count: "exact", head: true }),
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
        .gte("published_at", new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()),
    ]);

    const published = publishedCount.count ?? 0;
    const revenueXof = published * BASE_PRICE_XOF;

    // Aggregate published by day (last 30 days)
    const dayMap = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 3600 * 1000);
      const key = d.toISOString().slice(0, 10);
      dayMap.set(key, 0);
    }
    for (const row of publishedByDay.data ?? []) {
      const key = String(row.published_at).slice(0, 10);
      if (dayMap.has(key)) dayMap.set(key, (dayMap.get(key) ?? 0) + 1);
    }
    const series = Array.from(dayMap.entries()).map(([date, count]) => ({ date, count }));

    return {
      users: usersCount.count ?? 0,
      weddings: weddingsCount.count ?? 0,
      published,
      rsvps: rsvpsCount.count ?? 0,
      guests: guestsCount.count ?? 0,
      revenueXof,
      pricePerPublish: BASE_PRICE_XOF,
      recentWeddings: recentWeddings.data ?? [],
      recentUsers: recentUsers.data ?? [],
      publishedSeries: series,
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
      .limit(500);

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
        "id, owner_id, bride_name, groom_name, event_type, city, slug, is_published, published_at, wedding_date, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(500);

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
      .limit(500);

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
