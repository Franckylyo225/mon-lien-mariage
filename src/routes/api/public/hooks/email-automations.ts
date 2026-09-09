import { createFileRoute } from '@tanstack/react-router'

// Moteur d'emails automatiques — appelé toutes les heures par la planification
// de la base (pg_cron + pg_net). Protégé par la clé service-role.
export const Route = createFileRoute('/api/public/hooks/email-automations')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const serviceKey = process.env['SUPABASE_SERVICE_ROLE_KEY']
        if (!serviceKey) {
          return Response.json({ error: 'server_misconfigured' }, { status: 500 })
        }
        const auth = request.headers.get('Authorization') || ''
        if (!auth.startsWith('Bearer ') || auth.slice(7) !== serviceKey) {
          return Response.json({ error: 'unauthorized' }, { status: 401 })
        }

        try {
          const { runEmailAutomations } = await import('@/lib/email-automation.server')
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
