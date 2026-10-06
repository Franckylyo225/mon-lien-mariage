/**
 * Moteur d'emails automatiques pilotés par l'avancement de l'utilisateur.
 *
 * Les règles de déclenchement sont fixes ici ; le délai, l'objet, le corps et
 * le bouton de chaque email sont stockés en base (table email_automations) et
 * modifiables depuis l'admin sans redéploiement.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { sendResendEmail } from "@/lib/email-resend.server";
import { getServiceRoleKey, getSupabaseUrl } from "@/lib/server-credentials.server";
import { renderShellHtml } from "@/lib/email-templates/_layout";
import { brand as EMAIL_BRAND, fonts as EMAIL_FONTS } from "@/lib/email-templates/_brand";

const SITE_URL = "https://moninvit.com";
const SITE_NAME = "MonInvit.com";
const FROM_DOMAIN = "moninvit.com";
const LOGO_URL = "https://moninvit.com/media/a53d13c7-logo-moninvit.png";

export interface Automation {
  id: string;
  trigger_key: string;
  name: string;
  description: string | null;
  phase: string;
  delay_value: number;
  delay_unit: "minutes" | "hours" | "days";
  subject: string;
  body_html: string;
  cta_label: string | null;
  cta_url_pattern: string | null;
  is_active: boolean;
  max_sends_per_user: number;
  sort_order: number;
  updated_at: string;
}

export interface Candidate {
  user_id: string | null;
  wedding_id: string | null;
  email: string;
  first_name: string;
  bride_name?: string;
  groom_name?: string;
  slug?: string;
}

export function createServiceClient(keyOverride?: string): SupabaseClient {
  const url = getSupabaseUrl();
  const key = keyOverride || getServiceRoleKey();
  if (!url) throw new Error("server_misconfigured: missing supabase url");
  if (!key) throw new Error("server_misconfigured: missing service key");
  return createClient(url, key, { auth: { persistSession: false } });
}

/* ---------------------------------------------------------------- rendu --- */

export function renderAutomationEmail(
  automation: Automation,
  vars: Record<string, string>,
): string {
  const ctaUrl = vars["cta_url"] ?? "";
  const ctaBlock =
    automation.cta_label && ctaUrl
      ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:4px 0 26px"><tr><td align="center" bgcolor="${EMAIL_BRAND.primary}" style="border-radius:999px"><a href="${ctaUrl}" style="display:inline-block;padding:15px 32px;font-family:${EMAIL_FONTS.sans};font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:999px;line-height:1.2">${escapeHtml(
          automation.cta_label,
        )}</a></td></tr></table>`
      : "";

  const inner = substituteHtml(automation.body_html, { ...vars, cta: ctaBlock });

  // Same envelope as the React templates: one brand, one footer, one set of
  // fonts that inboxes actually have.
  return renderShellHtml({
    contentHtml: inner,
    // The subject still holds its {placeholders} here; the inbox preview line
    // would show them raw.
    preheader: escapeHtml(substitute(automation.subject, vars)),
  });
}

function substitute(html: string, vars: Record<string, string>) {
  return html.replace(/\{(\w+)\}/g, (_m, key: string) => vars[key] ?? "");
}

/** Same as substitute for HTML bodies: values are escaped, except the pre-rendered button block. */
function substituteHtml(html: string, vars: Record<string, string>) {
  return html.replace(/\{(\w+)\}/g, (_m, key: string) => {
    const value = vars[key] ?? "";
    return key === "cta" ? value : escapeHtml(value);
  });
}

function htmlToText(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|tr|h1|h2)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function buildVars(c: Candidate, automation: Automation) {
  const pattern = automation.cta_url_pattern ?? "";
  const path = substitute(pattern, {
    wedding_id: c.wedding_id ?? "",
    slug: c.slug ?? "",
  });
  const ctaUrl = path
    ? path.startsWith("http")
      ? path
      : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`
    : "";
  return {
    first_name: c.first_name || "",
    bride_name: c.bride_name || "",
    groom_name: c.groom_name || "",
    slug: c.slug || "",
    wedding_id: c.wedding_id || "",
    cta_url: ctaUrl,
    cta_label: automation.cta_label || "",
  };
}

/* ---------------------------------------------------------------- envoi --- */

export async function sendAutomationEmail(
  automation: Automation,
  candidate: Candidate,
  opts: { idempotencyKey?: string } = {},
): Promise<{ status: "sent"; messageId: string }> {
  const vars = buildVars(candidate, automation);
  const html = renderAutomationEmail(automation, vars);
  const subject = substitute(automation.subject, vars);

  const delivery = await sendResendEmail({
    to: candidate.email,
    from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
    subject,
    html,
    text: htmlToText(html),
    tags: [
      {
        name: "label",
        value: `automation-${automation.trigger_key}`.replace(/[^a-zA-Z0-9_-]/g, "_"),
      },
    ],
    idempotencyKey:
      opts.idempotencyKey ||
      `${automation.trigger_key}-${candidate.user_id ?? "anon"}-${candidate.wedding_id ?? "none"}`,
    templateName: automation.trigger_key,
    source: "automation",
    metadata: { user_id: candidate.user_id, wedding_id: candidate.wedding_id },
  });
  return { status: "sent", messageId: delivery.id };
}

/* ------------------------------------------------------------ candidats --- */

function cutoffISO(value: number, unit: string) {
  const ms =
    ({ minutes: 60000, hours: 3600000, days: 86400000 } as const)[
      unit as "minutes" | "hours" | "days"
    ] ?? 3600000;
  return new Date(Date.now() - value * ms).toISOString();
}

function addDaysISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

type ProfileLite = {
  id: string;
  email: string | null;
  user_first_name: string | null;
  display_name: string | null;
};

function firstNameOf(p?: ProfileLite | null) {
  return p?.user_first_name || p?.display_name?.split(" ")[0] || "";
}

async function profilesByIds(supabase: SupabaseClient, ids: string[]) {
  const unique = [...new Set(ids.filter(Boolean))];
  if (!unique.length) return new Map<string, ProfileLite>();
  const { data } = await supabase
    .from("profiles")
    .select("id, email, user_first_name, display_name")
    .in("id", unique);
  const map = new Map<string, ProfileLite>();
  for (const p of (data ?? []) as ProfileLite[]) map.set(p.id, p);
  return map;
}

async function weddingCandidates(
  supabase: SupabaseClient,
  build: (q: any) => any,
): Promise<Candidate[]> {
  const base = supabase
    .from("weddings")
    .select("id, owner_id, bride_name, groom_name, slug")
    .limit(500);
  const { data } = await build(base);
  const rows = (data ?? []) as any[];
  const profiles = await profilesByIds(
    supabase,
    rows.map((r) => r.owner_id),
  );
  return rows
    .map((r) => {
      const p = profiles.get(r.owner_id);
      if (!p?.email) return null;
      return {
        user_id: r.owner_id,
        wedding_id: r.id,
        email: p.email,
        first_name: firstNameOf(p),
        bride_name: r.bride_name ?? "",
        groom_name: r.groom_name ?? "",
        slug: r.slug ?? "",
      } as Candidate;
    })
    .filter(Boolean) as Candidate[];
}

export async function getCandidates(
  supabase: SupabaseClient,
  automation: Automation,
): Promise<Candidate[]> {
  const cutoff = cutoffISO(automation.delay_value, automation.delay_unit);

  switch (automation.trigger_key) {
    case "welcome": {
      const { data } = await supabase
        .from("profiles")
        .select("id, email, user_first_name, display_name, created_at")
        .is("welcome_email_sent_at", null)
        .lte("created_at", cutoff)
        .gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString())
        .limit(200);
      return ((data ?? []) as any[])
        .filter((p) => p.email)
        .map((p) => ({
          user_id: p.id,
          wedding_id: null,
          email: p.email,
          first_name: firstNameOf(p),
        }));
    }

    case "account_inactive_48h": {
      const { data } = await supabase
        .from("profiles")
        .select("id, email, user_first_name, display_name, created_at")
        .lt("created_at", cutoff)
        .gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString())
        .limit(300);
      const rows = ((data ?? []) as any[]).filter((p) => p.email);
      if (!rows.length) return [];
      const { data: owned } = await supabase
        .from("weddings")
        .select("owner_id")
        .in(
          "owner_id",
          rows.map((r) => r.id),
        );
      const withWedding = new Set((owned ?? []).map((w: any) => w.owner_id));
      return rows
        .filter((p) => !withWedding.has(p.id))
        .map((p) => ({
          user_id: p.id,
          wedding_id: null,
          email: p.email,
          first_name: firstNameOf(p),
        }));
    }

    case "wizard_abandoned_24h":
    case "wizard_abandoned_72h":
      return weddingCandidates(supabase, (q) =>
        q.lt("onboarding_step", 4).eq("is_published", false).lt("updated_at", cutoff),
      );

    case "paywall_reached":
    case "publish_reminder_j3":
      return weddingCandidates(supabase, (q) =>
        q
          .gte("onboarding_step", 4)
          .eq("is_published", false)
          .not("paywall_reached_at", "is", null)
          .lt("paywall_reached_at", cutoff),
      );

    case "payment_abandoned": {
      const { data } = await supabase
        .from("payments")
        .select("user_id, wedding_id, created_at")
        .eq("status", "pending")
        .lt("created_at", cutoff)
        .gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString())
        .limit(300);
      const rows = (data ?? []) as any[];
      const profiles = await profilesByIds(
        supabase,
        rows.map((r) => r.user_id),
      );
      return rows
        .map((r) => {
          const p = profiles.get(r.user_id);
          if (!p?.email) return null;
          return {
            user_id: r.user_id,
            wedding_id: r.wedding_id ?? null,
            email: p.email,
            first_name: firstNameOf(p),
          } as Candidate;
        })
        .filter(Boolean) as Candidate[];
    }

    case "published_success":
      // Déclenché directement par le webhook de paiement.
      return [];

    case "urgency_30d":
    case "urgency_7d": {
      const days = automation.trigger_key === "urgency_30d" ? 30 : 7;
      return weddingCandidates(supabase, (q) =>
        q
          .eq("is_published", false)
          .not("wedding_date", "is", null)
          .lte("wedding_date", addDaysISO(days))
          .gte("wedding_date", new Date().toISOString().slice(0, 10)),
      );
    }

    case "low_rsvp_j5": {
      const candidates = await weddingCandidates(supabase, (q) =>
        q.eq("is_published", true).not("published_at", "is", null).lt("published_at", cutoff),
      );
      const out: Candidate[] = [];
      for (const c of candidates) {
        const { count } = await supabase
          .from("rsvps")
          .select("id", { count: "exact", head: true })
          .eq("wedding_id", c.wedding_id);
        if ((count ?? 0) < 5) out.push(c);
      }
      return out;
    }

    case "upsell_guestbook_j2":
      return weddingCandidates(supabase, (q) =>
        q
          .eq("is_published", true)
          .eq("has_guestbook", false)
          .not("published_at", "is", null)
          .lt("published_at", cutoff),
      );

    default:
      return [];
  }
}

/* --------------------------------------------------------------- moteur --- */

export interface RunSummary {
  processed: number;
  sent: number;
  skipped: number;
  failed: number;
  details: Array<{ trigger_key: string; sent: number; skipped: number; failed: number }>;
}

async function alreadySent(
  supabase: SupabaseClient,
  triggerKey: string,
  userId: string | null,
  weddingId: string | null,
) {
  let q = supabase.from("email_automation_log").select("id").eq("trigger_key", triggerKey).limit(1);
  q = userId ? q.eq("user_id", userId) : q.is("user_id", null);
  q = weddingId ? q.eq("wedding_id", weddingId) : q.is("wedding_id", null);
  const { data } = await q;
  return Boolean(data?.length);
}

export async function runEmailAutomations(serviceKey?: string): Promise<RunSummary> {
  const supabase = createServiceClient(serviceKey);
  const { data: automations } = await supabase
    .from("email_automations")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  const summary: RunSummary = { processed: 0, sent: 0, skipped: 0, failed: 0, details: [] };
  // Un seul email automatique par utilisateur et par passage.
  const emailedThisRun = new Set<string>();

  for (const automation of (automations ?? []) as Automation[]) {
    const detail = { trigger_key: automation.trigger_key, sent: 0, skipped: 0, failed: 0 };
    let candidates: Candidate[] = [];
    try {
      candidates = await getCandidates(supabase, automation);
    } catch (error) {
      console.error("[automations] candidates failed", automation.trigger_key, error);
      summary.details.push(detail);
      continue;
    }

    for (const candidate of candidates) {
      summary.processed++;
      const runKey = candidate.user_id ?? candidate.email;
      if (
        emailedThisRun.has(runKey) ||
        (await alreadySent(
          supabase,
          automation.trigger_key,
          candidate.user_id,
          candidate.wedding_id,
        ))
      ) {
        detail.skipped++;
        summary.skipped++;
        continue;
      }

      try {
        const result = await sendAutomationEmail(automation, candidate);
        await supabase.from("email_automation_log").insert({
          user_id: candidate.user_id,
          wedding_id: candidate.wedding_id,
          trigger_key: automation.trigger_key,
          recipient_email: candidate.email,
          status: result.status,
        });
        if (automation.trigger_key === "welcome" && candidate.user_id) {
          await supabase
            .from("profiles")
            .update({ welcome_email_sent_at: new Date().toISOString() })
            .eq("id", candidate.user_id);
        }
        emailedThisRun.add(runKey);
        detail.sent++;
        summary.sent++;
      } catch (error) {
        console.error("[automations] send failed", automation.trigger_key, error);
        detail.failed++;
        summary.failed++;
      }
    }
    summary.details.push(detail);
  }

  return summary;
}

/** Déclenchement immédiat d'une automatisation pour une page donnée. */
export async function triggerAutomationForWedding(
  triggerKey: string,
  weddingId: string,
): Promise<"sent" | "skipped" | "inactive" | "not_found"> {
  const supabase = createServiceClient();
  const { data: automation } = await supabase
    .from("email_automations")
    .select("*")
    .eq("trigger_key", triggerKey)
    .maybeSingle();
  if (!automation) return "not_found";
  if (!automation.is_active) return "inactive";

  const { data: wedding } = await supabase
    .from("weddings")
    .select("id, owner_id, bride_name, groom_name, slug")
    .eq("id", weddingId)
    .maybeSingle();
  if (!wedding) return "not_found";

  const profiles = await profilesByIds(supabase, [wedding.owner_id]);
  const profile = profiles.get(wedding.owner_id);
  if (!profile?.email) return "not_found";

  if (await alreadySent(supabase, triggerKey, wedding.owner_id, wedding.id)) return "skipped";

  const candidate: Candidate = {
    user_id: wedding.owner_id,
    wedding_id: wedding.id,
    email: profile.email,
    first_name: firstNameOf(profile),
    bride_name: wedding.bride_name ?? "",
    groom_name: wedding.groom_name ?? "",
    slug: wedding.slug ?? "",
  };

  const result = await sendAutomationEmail(automation as Automation, candidate);
  await supabase.from("email_automation_log").insert({
    user_id: candidate.user_id,
    wedding_id: candidate.wedding_id,
    trigger_key: triggerKey,
    recipient_email: candidate.email,
    status: result.status,
  });
  return "sent";
}
