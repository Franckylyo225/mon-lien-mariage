import { createFileRoute } from '@tanstack/react-router'
import { createHash } from 'crypto'

// Moteur d'emails automatiques — appelé toutes les heures par la planification
// de la base (pg_cron + pg_net). Protégé par un jeton partagé dont seule
// l'empreinte est stockée en base (table app_secrets, clé "email_automation").
export const Route = createFileRoute('/api/public/hooks/email-automations')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = request.headers.get('Authorization') || ''
        const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
        if (token.length < 16) {
          return Response.json({ error: 'unauthorized' }, { status: 401 })
        }

        try {
          const { createServiceClient, runEmailAutomations } = await import(
            '@/lib/email-automation.server'
          )
          const supabase = createServiceClient()
          const { data: secret } = await supabase
            .from('app_secrets')
            .select('value_hash')
            .eq('key', 'email_automation')
            .maybeSingle()

          const hash = createHash('sha256').update(token).digest('hex')
          if (!secret?.value_hash || secret.value_hash !== hash) {
            return Response.json({ error: 'unauthorized' }, { status: 401 })
          }

          const summary = await runEmailAutomations()
          return Response.json({ success: true, ...summary })
        } catch (error) {
          console.error('[automations] run failed', error)
          return Response.json({ error: 'run_failed' }, { status: 500 })
        }
      },
    },
  },
})
