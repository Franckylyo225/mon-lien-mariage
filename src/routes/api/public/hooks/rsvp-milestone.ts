import { createFileRoute } from '@tanstack/react-router'
import { sendTemplateEmail } from '@/lib/email-templates/send-email'

// Internal webhook called by the on_rsvp_confirmed Postgres trigger via pg_net.
// Authenticated with the service-role key.
export const Route = createFileRoute('/api/public/hooks/rsvp-milestone')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = request.headers.get('Authorization') || ''
        const suppliedKey = auth.startsWith('Bearer ') ? auth.slice(7) : ''
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (!suppliedKey) {
          return Response.json({ error: 'server_misconfigured' }, { status: 500 })
        }

        if (serviceKey && suppliedKey !== serviceKey) {
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
            return Response.json({ success: false, reason: 'suppressed' })
          }

          return Response.json({ success: true, milestone })
        } catch (error) {
          console.error('[rsvp-milestone] Resend notification failed', error)
          return Response.json({ error: 'send_failed' }, { status: 500 })
        }
      },
    },
  },
})
