import { createClient } from '@supabase/supabase-js'
import { createFileRoute } from '@tanstack/react-router'
import { sendTemplateEmail } from '@/lib/email-templates/send-email'

// Internal webhook called by the on_profile_created Postgres trigger via pg_net.
// Authenticated with the service-role key.
// Notifies platform admins that a new user signed up.
export const Route = createFileRoute('/api/public/hooks/new-user')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const supabaseUrl =
          process.env.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL
        const auth = request.headers.get('Authorization') || ''
        const suppliedKey = auth.startsWith('Bearer ') ? auth.slice(7) : ''
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || suppliedKey
        if (!supabaseUrl || !serviceKey) {
          return Response.json({ error: 'server_misconfigured' }, { status: 500 })
        }

        if (!suppliedKey || (process.env.SUPABASE_SERVICE_ROLE_KEY && suppliedKey !== serviceKey)) {
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
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
          const { error: authError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 })
          if (authError) return Response.json({ error: 'unauthorized' }, { status: 401 })
        }

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

        const userName =
          [payload?.first_name, payload?.last_name].filter(Boolean).join(' ') ||
          payload?.display_name ||
          ''
        const templateData = {
          userEmail,
          userName,
          signedUpAt: new Date().toLocaleString('fr-FR', { timeZone: 'UTC' }) + ' UTC',
        }

        let notified = 0
        for (const recipient of recipients) {
          try {
            const result = await sendTemplateEmail('admin-new-user', recipient, {
              templateData,
              idempotencyKey: `new-user-${userId}-${recipient}`,
            })
            if (result.sent) {
              notified++
            }
          } catch (error) {
            console.error('[new-user] Resend notification failed', error)
          }
        }

        return Response.json({ success: true, notified })
      },
    },
  },
})
