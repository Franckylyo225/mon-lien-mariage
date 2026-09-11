import * as React from 'react'
import { render } from '@react-email/render'
import { sendResendEmail } from '@/lib/email-resend.server'
import { TEMPLATES } from './registry'

// Server-only: envoi via Resend. Never import from client components.

// Configuration baked in at scaffold time
const SITE_NAME = "Mon Invit"
// FROM_DOMAIN is the domain shown in the From: header (e.g., "example.com").
// Can be the root domain when display_from_root is enabled — this is cosmetic only.
const FROM_DOMAIN = "moninvit.com"

export type SendTemplateEmailResult =
  | { sent: true; messageId: string }
  | { sent: false; reason: 'recipient_suppressed' }

export interface SendTemplateEmailOptions {
  templateData?: Record<string, any>
  /** Dedupes retries of the same logical send; defaults to a random UUID (no dedupe). */
  idempotencyKey?: string
  replyTo?: string
}

/** Renders a registered template and sends it through Resend. */
export async function sendTemplateEmail(
  templateName: string,
  to: string,
  options: SendTemplateEmailOptions = {}
): Promise<SendTemplateEmailResult> {
  const template = TEMPLATES[templateName]
  if (!template) {
    throw new Error(
      `Template '${templateName}' not found. Available: ${Object.keys(TEMPLATES).join(', ')}`
    )
  }

  // Template-level `to` takes precedence — notification templates always
  // send to their fixed address.
  const recipient = template.to || to
  if (!recipient) {
    throw new Error('Recipient is required (the template defines no fixed recipient)')
  }

  const templateData = options.templateData ?? {}
  const element = React.createElement(template.component, templateData)
  const html = await render(element)
  const text = await render(element, { plainText: true })
  const subject =
    typeof template.subject === 'function'
      ? template.subject(templateData)
      : template.subject

  const delivery = await sendResendEmail({
    to: recipient,
    from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
    subject,
    html,
    text,
    replyTo: options.replyTo,
    tags: [{ name: 'label', value: templateName.replace(/[^a-zA-Z0-9_-]/g, '_') }],
    idempotencyKey: options.idempotencyKey,
    templateName,
    source: 'transactional',
  })

  return { sent: true, messageId: delivery.id }
}
