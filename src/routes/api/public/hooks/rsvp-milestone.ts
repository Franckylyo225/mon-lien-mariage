import { createClient } from '@supabase/supabase-js'
import { createFileRoute } from '@tanstack/react-router'
import { sendTemplateEmail } from '@/lib/email-templates/send-email'

// Internal webhook called by the on_rsvp_confirmed Postgres trigger via pg_net.
// Authenticated with the service-role key.
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

        const logSend = async (
          status: 'sent' | 'suppressed' | 'failed',
          errorMessage?: string,
        ) => {
          const { error } = await supabase.from('email_send_log').insert({
            message_id: null,
            template_name: 'rsvp-milestone',
            recipient_email: recipientEmail,
            status,
            ...(errorMessage ? { error_message: errorMessage } : {}),
          })
          if (error) {
            console.error('Failed to write email_send_log', {
              code: error.code,
              message: error.message,
            })
          }
        }

        try {
          const result = await sendTemplateEmail('rsvp-milestone', recipientEmail, {
            templateData: {
              milestone,
              coupleLabel,
              slug: payload?.slug ?? '',
            },
            idempotencyKey: `milestone-${weddingId}-${milestone}`,
          })

          if (!result.sent) {
            await logSend('suppressed')
            return Response.json({ success: false, reason: 'suppressed' })
          }

          await logSend('sent')
          return Response.json({ success: true, milestone })
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)
          await logSend('failed', message.slice(0, 1000))
          return Response.json({ error: 'send_failed' }, { status: 500 })
        }
      },
    },
  },
})
