/**
 * Envoi d'une campagne email à un segment d'utilisateurs.
 *
 * Distinct du moteur d'emails automatiques : une automatisation suit
 * l'avancement d'un utilisateur, une campagne est un message unique décidé à
 * la main et envoyé à une liste.
 *
 * Deux propriétés gouvernent ce module, parce que la panne qui coûte cher ici
 * n'est pas de ne rien envoyer, c'est d'envoyer deux fois :
 *
 * 1. Chaque envoi est journalisé dans `email_send_log` sous le nom de la
 *    campagne. Un destinataire déjà journalisé est écarté des lots suivants,
 *    donc relancer une campagne interrompue reprend où elle s'était arrêtée
 *    au lieu de tout renvoyer.
 * 2. Chaque email porte une clé d'idempotence propre au couple
 *    (campagne, destinataire), que Resend refuse de servir deux fois.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { sendResendEmail } from "@/lib/email-resend.server";
import { renderShellHtml } from "@/lib/email-templates/_layout";
import { brand as EMAIL_BRAND, fonts as EMAIL_FONTS } from "@/lib/email-templates/_brand";

const SITE_NAME = "MonInvit.com";
const FROM = `${SITE_NAME} <noreply@moninvit.com>`;

/** Au-delà, une requête serveur risque d'expirer avant la fin du lot. */
export const MAX_BATCH = 40;

export type CampaignSegment = "tous" | "sans_publication" | "avec_publication" | "sans_evenement";

export const SEGMENT_LABELS: Record<CampaignSegment, string> = {
  tous: "Tous les comptes",
  sans_publication: "Comptes sans publication",
  avec_publication: "Comptes ayant publié",
  sans_evenement: "Comptes sans aucun événement",
};

export interface CampaignContent {
  /** Identifie la campagne dans le journal et dans les clés d'idempotence. */
  key: string;
  subject: string;
  eyebrow: string;
  bodyHtml: string;
  ctaLabel: string;
  ctaUrl: string;
}

export interface Recipient {
  userId: string;
  email: string;
  firstName: string;
}

/* ------------------------------------------------------------- audience --- */

interface ProfileRow {
  id: string;
  email: string | null;
  user_first_name: string | null;
  display_name: string | null;
  deletion_requested_at: string | null;
}

/** Les profils, page par page : un plafond muet finirait par oublier des gens. */
async function allProfiles(supabase: SupabaseClient): Promise<ProfileRow[]> {
  const PAGE = 1000;
  const rows: ProfileRow[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, user_first_name, display_name, deletion_requested_at")
      .order("created_at", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    const page = (data ?? []) as ProfileRow[];
    rows.push(...page);
    if (page.length < PAGE) return rows;
  }
}

function firstNameOf(p: ProfileRow): string {
  const fromDisplay = p.display_name?.trim().split(/\s+/)[0] ?? "";
  return (p.user_first_name?.trim() || fromDisplay || "").slice(0, 40);
}

export interface AudienceResult {
  recipients: Recipient[];
  /** Pourquoi des comptes ont été écartés, pour l'afficher sans deviner. */
  excluded: {
    sansEmail: number;
    suppressionDemandee: number;
    desabonnes: number;
    doublons: number;
    horsSegment: number;
  };
}

/**
 * Les destinataires éligibles d'un segment, exclusions appliquées.
 *
 * Ne tient pas compte de ce qui a déjà été envoyé : c'est `pendingRecipients`
 * qui s'en charge, pour que l'écran puisse montrer la taille du segment et le
 * reste à faire séparément.
 */
export async function resolveAudience(
  supabase: SupabaseClient,
  segment: CampaignSegment,
): Promise<AudienceResult> {
  const profiles = await allProfiles(supabase);

  const { data: weddings, error: wErr } = await supabase
    .from("weddings")
    .select("owner_id, is_published");
  if (wErr) throw new Error(wErr.message);

  const total = new Map<string, number>();
  const published = new Map<string, number>();
  for (const w of (weddings ?? []) as { owner_id: string; is_published: boolean }[]) {
    total.set(w.owner_id, (total.get(w.owner_id) ?? 0) + 1);
    if (w.is_published) published.set(w.owner_id, (published.get(w.owner_id) ?? 0) + 1);
  }

  // La liste de suppression existait sans être lue par personne : une campagne
  // est précisément le moment où elle doit compter.
  const { data: suppressed } = await supabase.from("suppressed_emails").select("email");
  const blocked = new Set(
    ((suppressed ?? []) as { email: string }[]).map((s) => s.email.trim().toLowerCase()),
  );

  const excluded = {
    sansEmail: 0,
    suppressionDemandee: 0,
    desabonnes: 0,
    doublons: 0,
    horsSegment: 0,
  };
  const seen = new Set<string>();
  const recipients: Recipient[] = [];

  for (const p of profiles) {
    const inSegment =
      segment === "tous"
        ? true
        : segment === "avec_publication"
          ? (published.get(p.id) ?? 0) > 0
          : segment === "sans_publication"
            ? (total.get(p.id) ?? 0) > 0 && (published.get(p.id) ?? 0) === 0
            : (total.get(p.id) ?? 0) === 0;
    if (!inSegment) {
      excluded.horsSegment += 1;
      continue;
    }

    const email = p.email?.trim().toLowerCase() ?? "";
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      excluded.sansEmail += 1;
      continue;
    }
    // Un compte dont la suppression est demandée ne reçoit plus de promotion.
    if (p.deletion_requested_at) {
      excluded.suppressionDemandee += 1;
      continue;
    }
    if (blocked.has(email)) {
      excluded.desabonnes += 1;
      continue;
    }
    if (seen.has(email)) {
      excluded.doublons += 1;
      continue;
    }
    seen.add(email);
    recipients.push({ userId: p.id, email, firstName: firstNameOf(p) });
  }

  return { recipients, excluded };
}

export function templateNameFor(key: string): string {
  return `campaign-${key}`;
}

/** Les adresses déjà servies par cette campagne, d'après le journal d'envoi. */
export async function alreadySent(supabase: SupabaseClient, key: string): Promise<Set<string>> {
  const PAGE = 1000;
  const done = new Set<string>();
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("email_send_log")
      .select("recipient_email")
      .eq("template_name", templateNameFor(key))
      .eq("status", "sent")
      .range(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    const page = (data ?? []) as { recipient_email: string }[];
    for (const r of page) done.add(r.recipient_email.trim().toLowerCase());
    if (page.length < PAGE) return done;
  }
}

/* ---------------------------------------------------------------- rendu --- */

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Même bouton que le moteur d'automatisations : une table, pas un <a> stylé. */
function ctaBlock(url: string, label: string): string {
  if (!url || !label) return "";
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:4px 0 26px"><tr><td align="center" bgcolor="${EMAIL_BRAND.primary}" style="border-radius:999px"><a href="${url}" style="display:inline-block;padding:15px 32px;font-family:${EMAIL_FONTS.sans};font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:999px;line-height:1.2">${escapeHtml(label)}</a></td></tr></table>`;
}

/**
 * Remplace les variables du corps. Un prénom absent ne doit pas laisser
 * « Bonjour , » : la salutation se replie sur une forme sans nom.
 */
export function substituteBody(template: string, firstName: string, cta: string): string {
  const name = firstName.trim();
  return template
    .replace(/Bonjour \{first_name\}\s*,/g, name ? `Bonjour ${escapeHtml(name)},` : "Bonjour,")
    .replace(/\{first_name\}/g, escapeHtml(name))
    .replace(/\{cta\}/g, cta);
}

export function renderCampaign(content: CampaignContent, firstName: string): string {
  return renderShellHtml({
    contentHtml: substituteBody(
      content.bodyHtml,
      firstName,
      ctaBlock(content.ctaUrl, content.ctaLabel),
    ),
    eyebrow: content.eyebrow,
    preheader: escapeHtml(content.subject),
  });
}

/** Version texte lisible, dérivée du HTML rendu. */
export function campaignText(content: CampaignContent, firstName: string): string {
  const html = substituteBody(content.bodyHtml, firstName, "");
  const body = html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|tr|h1|h2)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  const cta =
    content.ctaUrl && content.ctaLabel ? `\n\n${content.ctaLabel} : ${content.ctaUrl}` : "";
  return body + cta;
}

/* ---------------------------------------------------------------- envoi --- */

export interface SendOutcome {
  email: string;
  status: "sent" | "failed";
  error?: string;
}

/**
 * Envoie la campagne à `recipients`, un par un.
 *
 * Séquentiel à dessein : l'écran envoie par lots courts, et un échec isolé ne
 * doit ni arrêter le lot ni faire perdre la trace de ce qui est déjà parti.
 */
export async function sendCampaignTo(
  content: CampaignContent,
  recipients: Recipient[],
): Promise<SendOutcome[]> {
  const outcomes: SendOutcome[] = [];
  for (const r of recipients) {
    try {
      await sendResendEmail({
        to: r.email,
        from: FROM,
        subject: content.subject,
        html: renderCampaign(content, r.firstName),
        text: campaignText(content, r.firstName),
        tags: [{ name: "label", value: templateNameFor(content.key).slice(0, 50) }],
        // Resend refuse de servir deux fois la même clé : la garde la plus
        // proche de l'envoi, en plus du filtre par le journal.
        idempotencyKey: `${templateNameFor(content.key)}-${r.userId}`,
        templateName: templateNameFor(content.key),
        source: "automation",
        metadata: { user_id: r.userId, campaign: content.key },
      });
      outcomes.push({ email: r.email, status: "sent" });
    } catch (e) {
      outcomes.push({
        email: r.email,
        status: "failed",
        error: e instanceof Error ? e.message.slice(0, 300) : "échec inconnu",
      });
    }
  }
  return outcomes;
}
