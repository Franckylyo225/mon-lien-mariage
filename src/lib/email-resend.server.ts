// Envoi d'emails via Resend (connecteur passerelle Lovable).
// Server-only : lit LOVABLE_API_KEY et RESEND_API_KEY.

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/resend'

export interface ResendSendInput {
  to: string | string[]
  from: string
  subject: string
  html: string
  text?: string
  replyTo?: string
  tags?: { name: string; value: string }[]
  idempotencyKey?: string
}

export class ResendSendError extends Error {
  status: number
  body: string
  constructor(status: number, body: string) {
    super(`Resend request failed [${status}]: ${body}`)
    this.name = 'ResendSendError'
    this.status = status
    this.body = body
  }
}

export async function sendResendEmail(input: ResendSendInput): Promise<{ id?: string }> {
  const lovableKey = process.env['LOVABLE_API_KEY']
  if (!lovableKey) throw new Error('LOVABLE_API_KEY is not configured')
  const resendKey = process.env['RESEND_API_KEY']
  if (!resendKey) throw new Error('RESEND_API_KEY is not configured')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${lovableKey}`,
    'X-Connection-Api-Key': resendKey,
  }
  if (input.idempotencyKey) headers['Idempotency-Key'] = input.idempotencyKey

  const response = await fetch(`${GATEWAY_URL}/emails`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      from: input.from,
      to: Array.isArray(input.to) ? input.to : [input.to],
      subject: input.subject,
      html: input.html,
      ...(input.text ? { text: input.text } : {}),
      ...(input.replyTo ? { reply_to: input.replyTo } : {}),
      ...(input.tags ? { tags: input.tags } : {}),
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    console.error(`[resend] send failed [${response.status}]: ${body}`)
    throw new ResendSendError(response.status, body)
  }

  return (await response.json().catch(() => ({}))) as { id?: string }
}
