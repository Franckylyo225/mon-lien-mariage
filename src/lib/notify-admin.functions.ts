import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { sendTemplateEmail } from '@/lib/email-templates/send-email'

const schema = z.object({
  userEmail: z.string().email(),
  userName: z.string().max(160).optional().default(''),
})

/**
 * Notifies platform admins that a new account was created.
 * Called right after a successful sign-up. Best-effort: never throws to the client.
 */
export const notifyAdminNewUser = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    let recipients: string[] = []
    try {
      const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
      const { data: adminRows } = await supabaseAdmin
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin')
      const adminIds = (adminRows ?? []).map((r: { user_id: string }) => r.user_id)
      if (adminIds.length) {
        const { data: profiles } = await supabaseAdmin
          .from('profiles')
          .select('email')
          .in('id', adminIds)
        recipients = (profiles ?? [])
          .map((p: { email: string | null }) => p.email)
          .filter((e): e is string => !!e)
      }
    } catch (error) {
      console.error('notifyAdminNewUser: admin lookup failed', error)
    }
    if (!recipients.length) recipients = ['franck@nwc-agency.com']

    const templateData = {
      userEmail: data.userEmail,
      userName: data.userName,
      signedUpAt: new Date().toLocaleString('fr-FR', { timeZone: 'UTC' }) + ' UTC',
    }

    let notified = 0
    for (const recipient of recipients) {
      try {
        const result = await sendTemplateEmail('admin-new-user', recipient, {
          templateData,
          idempotencyKey: `new-user-${data.userEmail}-${recipient}`,
        })
        if (result.sent) notified++
      } catch (error) {
        console.error('notifyAdminNewUser: send failed', error)
      }
    }
    return { notified }
  })
