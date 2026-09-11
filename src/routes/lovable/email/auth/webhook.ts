import * as React from 'react'
import { render } from '@react-email/render'
import { verifyWebhookRequest, WebhookError } from '@lovable.dev/webhooks-js'
import type { AuthEmailHookData } from '@lovable.dev/email-js'
import { createFileRoute } from '@tanstack/react-router'
import { SignupEmail } from '@/lib/email-templates/signup'
import { InviteEmail } from '@/lib/email-templates/invite'
import { MagicLinkEmail } from '@/lib/email-templates/magic-link'
import { RecoveryEmail } from '@/lib/email-templates/recovery'
import { EmailChangeEmail } from '@/lib/email-templates/email-change'
import { ReauthenticationEmail } from '@/lib/email-templates/reauthentication'
import { canonicalizeAuthUrl } from '@/lib/email-redirect'
import { sendResendEmail } from '@/lib/email-resend.server'

// Configuration
const SITE_NAME = 'Mon Invit'
const ROOT_DOMAIN = 'moninvit.com'
const FROM_DOMAIN = 'moninvit.com'
const SITE_URL = `https://${ROOT_DOMAIN}`

type ActionType =
  | 'signup'
  | 'invite'
  | 'magiclink'
  | 'recovery'
  | 'email_change'
  | 'reauthentication'

type AuthPayload = {
  version: string
  type: string
  run_id?: string
  data: AuthEmailHookData
}

function parseAuthPayload(body: string): AuthPayload {
  const parsed = JSON.parse(body) as AuthPayload
  if (
    !parsed ||
    typeof parsed !== 'object' ||
    parsed.type !== 'auth' ||
    !parsed.data ||
    typeof parsed.data.action_type !== 'string' ||
    typeof parsed.data.email !== 'string'
  ) {
    throw new Error('Invalid auth email webhook payload')
  }
  return parsed
}

const EMAILS: Record<
  ActionType,
  (data: AuthEmailHookData) => { subject: string; element: React.ReactElement }
> = {
  signup: (data) => ({
    subject: data.token
      ? `${data.token} — votre code de confirmation MonInvit.com`
      : 'Votre code de confirmation MonInvit.com',
    element: React.createElement(SignupEmail, {
      siteName: SITE_NAME,
      siteUrl: SITE_URL,
      recipient: data.email,
      token: data.token ?? '',
    }),
  }),
  invite: (data) => ({
    subject: "Vous êtes invité(e)",
    element: React.createElement(InviteEmail, {
      siteName: SITE_NAME,
      siteUrl: SITE_URL,
      confirmationUrl: canonicalizeAuthUrl(data.url, data.action_type),
    }),
  }),
  magiclink: (data) => ({
    subject: 'Votre lien de connexion',
    element: React.createElement(MagicLinkEmail, {
      siteName: SITE_NAME,
      confirmationUrl: canonicalizeAuthUrl(data.url, data.action_type),
    }),
  }),
  recovery: (data) => ({
    subject: 'Réinitialisation de votre mot de passe',
    element: React.createElement(RecoveryEmail, {
      siteName: SITE_NAME,
      confirmationUrl: canonicalizeAuthUrl(data.url, data.action_type),
      token: data.token ?? '',
    }),
  }),
  email_change: (data) => ({
    subject: 'Confirmez votre nouvelle adresse email',
    element: React.createElement(EmailChangeEmail, {
      siteName: SITE_NAME,
      oldEmail: data.old_email ?? '',
      email: data.email,
      newEmail: data.new_email ?? '',
      confirmationUrl: canonicalizeAuthUrl(data.url, data.action_type),
    }),
  }),
  reauthentication: (data) => ({
    subject: 'Votre code de vérification',
    element: React.createElement(ReauthenticationEmail, { token: data.token ?? '' }),
  }),
}

// Les emails d'authentification sont vérifiés avec la signature Lovable puis
// envoyés via Resend.
export const Route = createFileRoute('/lovable/email/auth/webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env['LOVABLE_API_KEY']
        if (!apiKey) {
          console.error('[auth-email] LOVABLE_API_KEY missing — cannot verify auth webhook')
          return Response.json({ error: 'email_not_configured' }, { status: 500 })
        }

        let event: AuthPayload
        try {
          const verified = await verifyWebhookRequest<AuthPayload>({
            req: request,
            secret: apiKey,
            parser: parseAuthPayload,
          })
          event = verified.payload
        } catch (error) {
          if (error instanceof WebhookError) {
            return Response.json({ error: error.message }, { status: 401 })
          }
          console.error('[auth-email] webhook verification failed:', error)
          return Response.json({ error: 'verification_failed' }, { status: 500 })
        }

        const actionType = event.data.action_type as ActionType
        const definition = EMAILS[actionType]
        if (!definition) {
          return Response.json({ error: `Unknown action type: ${actionType}` }, { status: 400 })
        }

        try {
          const { subject, element } = definition(event.data)
          const html = await render(element)
          const text = await render(element, { plainText: true })
          await sendResendEmail({
            to: event.data.email,
            from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
            subject,
            html,
            text,
            tags: [{ name: 'label', value: actionType }],
          })
        } catch (error) {
          console.error('[auth-email] send failed:', error)
          return Response.json({ error: 'send_failed' }, { status: 500 })
        }

        return Response.json({ success: true, sent: true })
      },
    },
  },
})
