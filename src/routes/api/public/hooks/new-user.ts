import * as React from 'react'
import { render } from '@react-email/render'
import { createClient } from '@supabase/supabase-js'
import { createFileRoute } from '@tanstack/react-router'
import { TEMPLATES } from '@/lib/email-templates/registry'

// Internal webhook called by the on_profile_created Postgres trigger via pg_net.
// Authenticated with the service-role key stored in Vault.
// Notifies platform admins that a new user signed up.
const SITE_NAME = 'MonInvit.com'
const SENDER_DOMAIN = 'notify.moninvit.com'
const FROM_DOMAIN = 'notify.moninvit.com'

function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function unsubscribeTokenFor(supabase: any, email: string): Promise<string> {
  const normalized = email.toLowerCase()
  const { data: existing } = await supabase
    .from('email_unsubscribe_tokens')
    .select('token, used_at')
    .eq('email', normalized)
    .maybeSingle()
  if (existing?.token && !existing.used_at) return existing.token
  const token = generateToken()
  await supabase
    .from('email_unsubscribe_tokens')
    .upsert({ token, email: normalized }, { onConflict: 'email', ignoreDuplicates: true })
  const { data: stored } = await supabase
    .from('email_unsubscribe_tokens')
    .select('token')
    .eq('email', normalized)
    .maybeSingle()
  return stored?.token ?? token
}

export const Route = createFileRoute('/api/public/hooks/new-user')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const supabaseUrl =
          process.env.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (!supabaseUrl || !serviceKey) {
          return Response.json({ error: 'server_misconfigured' }, { status: 500 })
        }

        const auth = request.headers.get('Authorization') || ''
        if (!auth.startsWith('Bearer ') || auth.slice(7) !== serviceKey) {
          return Response.json({ error: 'unauthorized' }, { status: 401 })
        }

        let payload: any
        try {
          payload = await request.json()
        } catch {
          return Response.json({ error: 'invalid_json' }, { status: 400 })
        }

        const userEmail: string | undefined = payload?.user_email
        const userId: string | undefined = payload?.user_id
        if (!userEmail || !userId) {
          return Response.json({ error: 'missing_fields' }, { status: 400 })
        }

        const supabase = createClient(supabaseUrl, serviceKey, {
          auth: { persistSession: false },
        })

        // Recipients: every platform admin.
        const { data: adminRows } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'admin')
        const adminIds = (adminRows ?? []).map((r: any) => r.user_id)
        let recipients: string[] = []
        if (adminIds.length) {
          const { data: adminProfiles } = await supabase
            .from('profiles')
            .select('email')
            .in('id', adminIds)
          recipients = (adminProfiles ?? [])
            .map((p: any) => p.email)
            .filter((e: string | null): e is string => !!e)
        }
        if (!recipients.length) recipients = ['franck@nwc-agency.com']

        const template = TEMPLATES['admin-new-user']
        if (!template) {
          return Response.json({ error: 'template_missing' }, { status: 500 })
        }

        const userName =
          [payload?.first_name, payload?.last_name].filter(Boolean).join(' ') ||
          payload?.display_name ||
          ''
        const templateData = {
          userEmail,
          userName,
          signedUpAt: new Date().toLocaleString('fr-FR', { timeZone: 'UTC' }) + ' UTC',
        }
        const element = React.createElement(template.component, templateData)
        const html = await render(element)
        const plainText = await render(element, { plainText: true })
        const subject =
          typeof template.subject === 'function'
            ? template.subject(templateData)
            : template.subject

        for (const recipient of recipients) {
          const messageId = crypto.randomUUID()
          const unsubscribeToken = await unsubscribeTokenFor(supabase, recipient)

          await supabase.from('email_send_log').insert({
            message_id: messageId,
            template_name: 'admin-new-user',
            recipient_email: recipient,
            status: 'pending',
          })

          const { error: enqueueError } = await supabase.rpc('enqueue_email', {
            queue_name: 'transactional_emails',
            payload: {
              message_id: messageId,
              to: recipient,
              from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
              sender_domain: SENDER_DOMAIN,
              subject,
              html,
              text: plainText,
              purpose: 'transactional',
              label: 'admin-new-user',
              idempotency_key: `new-user-${userId}-${recipient}`,
              unsubscribe_token: unsubscribeToken,
              queued_at: new Date().toISOString(),
            },
          })

          if (enqueueError) {
            await supabase.from('email_send_log').insert({
              message_id: messageId,
              template_name: 'admin-new-user',
              recipient_email: recipient,
              status: 'failed',
              error_message: enqueueError.message,
            })
          }
        }

        return Response.json({ success: true, notified: recipients.length })
      },
    },
  },
})
