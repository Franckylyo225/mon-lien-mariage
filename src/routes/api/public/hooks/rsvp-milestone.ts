import * as React from 'react'
import { render } from '@react-email/render'
import { createClient } from '@supabase/supabase-js'
import { createFileRoute } from '@tanstack/react-router'
import { TEMPLATES } from '@/lib/email-templates/registry'

// Internal webhook called by the on_rsvp_confirmed Postgres trigger via pg_net.
// Authenticated with the service-role key stored in Vault (email_queue_service_role_key).
// Renders the milestone email and enqueues it in the transactional queue.
const SITE_NAME = 'moninvit'
const SENDER_DOMAIN = 'notify.moninvit.com'
const FROM_DOMAIN = 'moninvit.com'

function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export const Route = createFileRoute('/api/public/hooks/rsvp-milestone')({
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

        const recipientEmail: string | undefined = payload?.owner_email
        const milestone: number | undefined = payload?.milestone
        const weddingId: string | undefined = payload?.wedding_id
        if (!recipientEmail || !milestone || !weddingId) {
          return Response.json({ error: 'missing_fields' }, { status: 400 })
        }

        const coupleLabel = [payload?.bride_name, payload?.groom_name]
          .filter(Boolean)
          .join(' & ')

        const supabase = createClient(supabaseUrl, serviceKey, {
          auth: { persistSession: false },
        })

        // Suppression check
        const { data: suppressed } = await supabase
          .from('suppressed_emails')
          .select('id')
          .eq('email', recipientEmail.toLowerCase())
          .maybeSingle()
        if (suppressed) {
          return Response.json({ success: false, reason: 'suppressed' })
        }

        // Unsubscribe token (reuse or create)
        const normalized = recipientEmail.toLowerCase()
        let unsubscribeToken: string
        const { data: existingToken } = await supabase
          .from('email_unsubscribe_tokens')
          .select('token, used_at')
          .eq('email', normalized)
          .maybeSingle()
        if (existingToken && !existingToken.used_at) {
          unsubscribeToken = existingToken.token
        } else {
          unsubscribeToken = generateToken()
          await supabase
            .from('email_unsubscribe_tokens')
            .upsert(
              { token: unsubscribeToken, email: normalized },
              { onConflict: 'email', ignoreDuplicates: true },
            )
          const { data: stored } = await supabase
            .from('email_unsubscribe_tokens')
            .select('token')
            .eq('email', normalized)
            .maybeSingle()
          if (stored?.token) unsubscribeToken = stored.token
        }

        const template = TEMPLATES['rsvp-milestone']
        if (!template) {
          return Response.json({ error: 'template_missing' }, { status: 500 })
        }

        const templateData = {
          milestone,
          coupleLabel,
          slug: payload?.slug ?? '',
        }
        const element = React.createElement(template.component, templateData)
        const html = await render(element)
        const plainText = await render(element, { plainText: true })
        const subject =
          typeof template.subject === 'function'
            ? template.subject(templateData)
            : template.subject

        const messageId = crypto.randomUUID()
        const idempotencyKey = `milestone-${weddingId}-${milestone}`

        await supabase.from('email_send_log').insert({
          message_id: messageId,
          template_name: 'rsvp-milestone',
          recipient_email: recipientEmail,
          status: 'pending',
        })

        const { error: enqueueError } = await supabase.rpc('enqueue_email', {
          queue_name: 'transactional_emails',
          payload: {
            message_id: messageId,
            to: recipientEmail,
            from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
            sender_domain: SENDER_DOMAIN,
            subject,
            html,
            text: plainText,
            purpose: 'transactional',
            label: 'rsvp-milestone',
            idempotency_key: idempotencyKey,
            unsubscribe_token: unsubscribeToken,
            queued_at: new Date().toISOString(),
          },
        })

        if (enqueueError) {
          await supabase.from('email_send_log').insert({
            message_id: messageId,
            template_name: 'rsvp-milestone',
            recipient_email: recipientEmail,
            status: 'failed',
            error_message: enqueueError.message,
          })
          return Response.json({ error: 'enqueue_failed' }, { status: 500 })
        }

        return Response.json({ success: true, queued: true, milestone })
      },
    },
  },
})
