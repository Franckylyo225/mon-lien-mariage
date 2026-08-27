import { sendTemplateEmail } from './src/lib/email-templates/send-email'

const TO = 'franck@nwc-agency.com'

async function run() {
  const tests: Array<[string, Record<string, any>]> = [
    ['rsvp-milestone', { milestone: 25, coupleLabel: 'Awa & Kofi', slug: 'awa-kofi' }],
    ['admin-new-user', {
      userEmail: 'test.utilisateur@example.com',
      userName: 'Test Utilisateur',
      signedUpAt: new Date().toLocaleString('fr-FR', { timeZone: 'UTC' }) + ' UTC',
    }],
  ]
  for (const [tpl, data] of tests) {
    try {
      const res = await sendTemplateEmail(tpl, TO, {
        templateData: data,
        idempotencyKey: `test-${tpl}-${Date.now()}`,
      })
      console.log(tpl, '=>', JSON.stringify(res))
    } catch (e: any) {
      console.log(tpl, '=> ERROR', e?.code ?? '', e?.message ?? String(e))
    }
  }
}
run()
