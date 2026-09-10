/**
 * Moteur d'emails automatiques pilotés par l'avancement de l'utilisateur.
 *
 * Les règles de déclenchement sont fixes ici ; le délai, l'objet, le corps et
 * le bouton de chaque email sont stockés en base (table email_automations) et
 * modifiables depuis l'admin sans redéploiement.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { EmailAPIError, sendLovableEmail } from '@lovable.dev/email-js'

const SITE_URL = 'https://moninvit.com'
const SITE_NAME = 'MonInvit.com'
const SENDER_DOMAIN = 'notify.moninvit.com'
const FROM_DOMAIN = 'moninvit.com'
const LOGO_URL = 'https://moninvit.com/media/a53d13c7-logo-moninvit.png'

export interface Automation {
  id: string
  trigger_key: string
  name: string
  description: string | null
  phase: string
  delay_value: number
  delay_unit: 'minutes' | 'hours' | 'days'
  subject: string
  body_html: string
  cta_label: string | null
  cta_url_pattern: string | null
  is_active: boolean
  max_sends_per_user: number
  sort_order: number
  updated_at: string
}

export interface Candidate {
  user_id: string | null
  wedding_id: string | null
  email: string
  first_name: string
  bride_name?: string
  groom_name?: string
  slug?: string
}

export function createServiceClient(keyOverride?: string): SupabaseClient {
  const url =
    process.env['SUPABASE_URL'] || (import.meta.env.VITE_SUPABASE_URL as string)
  const key = keyOverride || process.env['SUPABASE_SERVICE_ROLE_KEY']
  if (!url || !key) throw new Error('server_misconfigured')
  return createClient(url, key, { auth: { persistSession: false } })
}

/* ---------------------------------------------------------------- rendu --- */

const FONTS =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,500&family=Nunito+Sans:wght@400;600;700&display=swap'

export function renderAutomationEmail(
  automation: Automation,
  vars: Record<string, string>,
): string {
  const ctaUrl = vars['cta_url'] ?? ''
  const ctaBlock =
    automation.cta_label && ctaUrl
      ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px auto 8px"><tr><td align="center" bgcolor="#E82050" style="border-radius:999px"><a href="${ctaUrl}" style="display:inline-block;padding:14px 30px;font-family:'Nunito Sans',Arial,sans-serif;font-size:14px;font-weight:700;letter-spacing:.04em;color:#ffffff;text-decoration:none">${escapeHtml(
          automation.cta_label,
        )}</a></td></tr></table>`
      : ''

  const inner = substitute(automation.body_html, { ...vars, cta: ctaBlock })

  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<link rel="stylesheet" href="${FONTS}"/>
<style>
  body{margin:0;padding:0;background:#FAF8F5}
  .wrap{max-width:560px;margin:0 auto;padding:28px 14px}
  .card{background:#FFFFFF;border:1px solid #F0E4DC;border-radius:18px;overflow:hidden}
  .head{padding:26px 32px 20px;text-align:center;border-bottom:2px solid #E82050}
  .body{padding:30px 32px 10px;font-family:'Nunito Sans',-apple-system,Segoe UI,Arial,sans-serif;font-size:15px;line-height:1.65;color:#201A1C}
  .body h1{font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-weight:500;font-size:27px;color:#201A1C;margin:0 0 18px}
  .body p{margin:0 0 16px}
  .body a{color:#E82050}
  .body .note{font-size:12px;color:#7A6E70;text-align:center;margin-top:4px}
  .body .box{background:#FFF8EC;border:1px solid #EFDFC2;border-radius:12px;padding:14px 16px;font-size:13px;color:#6B5B3E;margin:18px 0 6px;text-align:center}
  .foot{padding:20px 32px 26px;text-align:center;font-family:'Nunito Sans',Arial,sans-serif;font-size:12px;color:#8A7E80;line-height:1.6}
  .foot .b{font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;color:#C6A15B;letter-spacing:.14em;text-transform:uppercase;font-size:11px;margin:0 0 6px}
</style></head>
<body><div class="wrap"><div class="card">
  <div class="head"><img src="${LOGO_URL}" alt="${SITE_NAME}" height="34" style="height:34px;width:auto;display:block;margin:0 auto"/></div>
  <div class="body">${inner}</div>
  <div class="foot"><p class="b">Invitations &amp; gestion de mariage</p><p style="margin:0">© ${new Date().getFullYear()} moninvit.com · Fait avec ♥ à Abidjan</p></div>
</div></div></body></html>`
}

function substitute(html: string, vars: Record<string, string>) {
  return html.replace(/\{(\w+)\}/g, (_m, key: string) => vars[key] ?? '')
}

function htmlToText(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|tr|h1|h2)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function buildVars(c: Candidate, automation: Automation) {
  const pattern = automation.cta_url_pattern ?? ''
  const path = substitute(pattern, {
    wedding_id: c.wedding_id ?? '',
    slug: c.slug ?? '',
  })
  const ctaUrl = path
    ? path.startsWith('http')
      ? path
      : `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`
    : ''
  return {
    first_name: c.first_name || '',
    bride_name: c.bride_name || '',
    groom_name: c.groom_name || '',
    slug: c.slug || '',
    wedding_id: c.wedding_id || '',
    cta_url: ctaUrl,
    cta_label: automation.cta_label || '',
  }
}

/* ---------------------------------------------------------------- envoi --- */

export async function sendAutomationEmail(
  automation: Automation,
  candidate: Candidate,
  opts: { idempotencyKey?: string } = {},
): Promise<'sent' | 'suppressed'> {
  const apiKey = process.env['LOVABLE_API_KEY']
  if (!apiKey) throw new Error('LOVABLE_API_KEY is not configured')

  const vars = buildVars(candidate, automation)
  const html = renderAutomationEmail(automation, vars)
  const subject = substitute(automation.subject, vars)

  try {
    await sendLovableEmail(
      {
        to: candidate.email,
        from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
        sender_domain: SENDER_DOMAIN,
        subject,
        html,
        text: htmlToText(html),
        purpose: 'transactional',
        label: `automation-${automation.trigger_key}`,
        idempotency_key:
          opts.idempotencyKey ||
          `${automation.trigger_key}-${candidate.user_id ?? 'anon'}-${candidate.wedding_id ?? 'none'}`,
      },
      { apiKey, sendUrl: process.env['LOVABLE_SEND_URL'] },
    )
  } catch (error) {
    if (error instanceof EmailAPIError && error.code === 'recipient_suppressed') {
      return 'suppressed'
    }
    throw error
  }
  return 'sent'
}

/* ------------------------------------------------------------ candidats --- */

function cutoffISO(value: number, unit: string) {
  const ms = ({ minutes: 60000, hours: 3600000, days: 86400000 } as const)[
    unit as 'minutes' | 'hours' | 'days'
  ] ?? 3600000
  return new Date(Date.now() - value * ms).toISOString()
}

function addDaysISO(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

type ProfileLite = {
  id: string
  email: string | null
  user_first_name: string | null
  display_name: string | null
}

function firstNameOf(p?: ProfileLite | null) {
  return p?.user_first_name || p?.display_name?.split(' ')[0] || ''
}

async function profilesByIds(supabase: SupabaseClient, ids: string[]) {
  const unique = [...new Set(ids.filter(Boolean))]
  if (!unique.length) return new Map<string, ProfileLite>()
  const { data } = await supabase
    .from('profiles')
    .select('id, email, user_first_name, display_name')
    .in('id', unique)
  const map = new Map<string, ProfileLite>()
  for (const p of (data ?? []) as ProfileLite[]) map.set(p.id, p)
  return map
}

async function weddingCandidates(
  supabase: SupabaseClient,
  build: (q: any) => any,
): Promise<Candidate[]> {
  const base = supabase
    .from('weddings')
    .select('id, owner_id, bride_name, groom_name, slug')
    .limit(500)
  const { data } = await build(base)
  const rows = (data ?? []) as any[]
  const profiles = await profilesByIds(supabase, rows.map((r) => r.owner_id))
  return rows
    .map((r) => {
      const p = profiles.get(r.owner_id)
      if (!p?.email) return null
      return {
        user_id: r.owner_id,
        wedding_id: r.id,
        email: p.email,
        first_name: firstNameOf(p),
        bride_name: r.bride_name ?? '',
        groom_name: r.groom_name ?? '',
        slug: r.slug ?? '',
      } as Candidate
    })
    .filter(Boolean) as Candidate[]
}

export async function getCandidates(
  supabase: SupabaseClient,
  automation: Automation,
): Promise<Candidate[]> {
  const cutoff = cutoffISO(automation.delay_value, automation.delay_unit)

  switch (automation.trigger_key) {
    case 'welcome': {
      const { data } = await supabase
        .from('profiles')
        .select('id, email, user_first_name, display_name, created_at')
        .is('welcome_email_sent_at', null)
        .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString())
        .limit(200)
      return ((data ?? []) as any[])
        .filter((p) => p.email)
        .map((p) => ({
          user_id: p.id,
          wedding_id: null,
          email: p.email,
          first_name: firstNameOf(p),
        }))
    }

    case 'account_inactive_48h': {
      const { data } = await supabase
        .from('profiles')
        .select('id, email, user_first_name, display_name, created_at')
        .lt('created_at', cutoff)
        .gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString())
        .limit(300)
      const rows = ((data ?? []) as any[]).filter((p) => p.email)
      if (!rows.length) return []
      const { data: owned } = await supabase
        .from('weddings')
        .select('owner_id')
        .in('owner_id', rows.map((r) => r.id))
      const withWedding = new Set((owned ?? []).map((w: any) => w.owner_id))
      return rows
        .filter((p) => !withWedding.has(p.id))
        .map((p) => ({
          user_id: p.id,
          wedding_id: null,
          email: p.email,
          first_name: firstNameOf(p),
        }))
    }

    case 'wizard_abandoned_24h':
    case 'wizard_abandoned_72h':
      return weddingCandidates(supabase, (q) =>
        q
          .lt('onboarding_step', 4)
          .eq('is_published', false)
          .lt('updated_at', cutoff),
      )

    case 'paywall_reached':
    case 'publish_reminder_j3':
      return weddingCandidates(supabase, (q) =>
        q
          .gte('onboarding_step', 4)
          .eq('is_published', false)
          .not('paywall_reached_at', 'is', null)
          .lt('paywall_reached_at', cutoff),
      )

    case 'payment_abandoned': {
      const { data } = await supabase
        .from('payments')
        .select('user_id, wedding_id, created_at')
        .eq('status', 'pending')
        .lt('created_at', cutoff)
        .gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString())
        .limit(300)
      const rows = (data ?? []) as any[]
      const profiles = await profilesByIds(supabase, rows.map((r) => r.user_id))
      return rows
        .map((r) => {
          const p = profiles.get(r.user_id)
          if (!p?.email) return null
          return {
            user_id: r.user_id,
            wedding_id: r.wedding_id ?? null,
            email: p.email,
            first_name: firstNameOf(p),
          } as Candidate
        })
        .filter(Boolean) as Candidate[]
    }

    case 'published_success':
      // Déclenché directement par le webhook de paiement.
      return []

    case 'urgency_30d':
    case 'urgency_7d': {
      const days = automation.trigger_key === 'urgency_30d' ? 30 : 7
      return weddingCandidates(supabase, (q) =>
        q
          .eq('is_published', false)
          .not('wedding_date', 'is', null)
          .lte('wedding_date', addDaysISO(days))
          .gte('wedding_date', new Date().toISOString().slice(0, 10)),
      )
    }

    case 'low_rsvp_j5': {
      const candidates = await weddingCandidates(supabase, (q) =>
        q
          .eq('is_published', true)
          .not('published_at', 'is', null)
          .lt('published_at', cutoff),
      )
      const out: Candidate[] = []
      for (const c of candidates) {
        const { count } = await supabase
          .from('rsvps')
          .select('id', { count: 'exact', head: true })
          .eq('wedding_id', c.wedding_id)
        if ((count ?? 0) < 5) out.push(c)
      }
      return out
    }

    case 'upsell_guestbook_j2':
      return weddingCandidates(supabase, (q) =>
        q
          .eq('is_published', true)
          .eq('has_guestbook', false)
          .not('published_at', 'is', null)
          .lt('published_at', cutoff),
      )

    default:
      return []
  }
}

/* --------------------------------------------------------------- moteur --- */

export interface RunSummary {
  processed: number
  sent: number
  skipped: number
  failed: number
  details: Array<{ trigger_key: string; sent: number; skipped: number; failed: number }>
}

async function alreadySent(
  supabase: SupabaseClient,
  triggerKey: string,
  userId: string | null,
  weddingId: string | null,
) {
  let q = supabase
    .from('email_automation_log')
    .select('id')
    .eq('trigger_key', triggerKey)
    .limit(1)
  q = userId ? q.eq('user_id', userId) : q.is('user_id', null)
  q = weddingId ? q.eq('wedding_id', weddingId) : q.is('wedding_id', null)
  const { data } = await q
  return Boolean(data?.length)
}

export async function runEmailAutomations(serviceKey?: string): Promise<RunSummary> {
  const supabase = createServiceClient(serviceKey)
  const { data: automations } = await supabase
    .from('email_automations')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  const summary: RunSummary = { processed: 0, sent: 0, skipped: 0, failed: 0, details: [] }

  for (const automation of ((automations ?? []) as Automation[])) {
    const detail = { trigger_key: automation.trigger_key, sent: 0, skipped: 0, failed: 0 }
    let candidates: Candidate[] = []
    try {
      candidates = await getCandidates(supabase, automation)
    } catch (error) {
      console.error('[automations] candidates failed', automation.trigger_key, error)
      summary.details.push(detail)
      continue
    }

    for (const candidate of candidates) {
      summary.processed++
      if (await alreadySent(supabase, automation.trigger_key, candidate.user_id, candidate.wedding_id)) {
        detail.skipped++
        summary.skipped++
        continue
      }
      try {
        const result = await sendAutomationEmail(automation, candidate)
        await supabase.from('email_automation_log').insert({
          user_id: candidate.user_id,
          wedding_id: candidate.wedding_id,
          trigger_key: automation.trigger_key,
          recipient_email: candidate.email,
          status: result,
        })
        if (automation.trigger_key === 'welcome' && candidate.user_id) {
          await supabase
            .from('profiles')
            .update({ welcome_email_sent_at: new Date().toISOString() })
            .eq('id', candidate.user_id)
        }
        detail.sent++
        summary.sent++
      } catch (error) {
        console.error('[automations] send failed', automation.trigger_key, error)
        detail.failed++
        summary.failed++
      }
    }
    summary.details.push(detail)
  }

  return summary
}

/** Déclenchement immédiat d'une automatisation pour une page donnée. */
export async function triggerAutomationForWedding(
  triggerKey: string,
  weddingId: string,
): Promise<'sent' | 'skipped' | 'inactive' | 'not_found'> {
  const supabase = createServiceClient()
  const { data: automation } = await supabase
    .from('email_automations')
    .select('*')
    .eq('trigger_key', triggerKey)
    .maybeSingle()
  if (!automation) return 'not_found'
  if (!automation.is_active) return 'inactive'

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, owner_id, bride_name, groom_name, slug')
    .eq('id', weddingId)
    .maybeSingle()
  if (!wedding) return 'not_found'

  const profiles = await profilesByIds(supabase, [wedding.owner_id])
  const profile = profiles.get(wedding.owner_id)
  if (!profile?.email) return 'not_found'

  if (await alreadySent(supabase, triggerKey, wedding.owner_id, wedding.id)) return 'skipped'

  const candidate: Candidate = {
    user_id: wedding.owner_id,
    wedding_id: wedding.id,
    email: profile.email,
    first_name: firstNameOf(profile),
    bride_name: wedding.bride_name ?? '',
    groom_name: wedding.groom_name ?? '',
    slug: wedding.slug ?? '',
  }

  const result = await sendAutomationEmail(automation as Automation, candidate)
  await supabase.from('email_automation_log').insert({
    user_id: candidate.user_id,
    wedding_id: candidate.wedding_id,
    trigger_key: triggerKey,
    recipient_email: candidate.email,
    status: result,
  })
  return 'sent'
}
