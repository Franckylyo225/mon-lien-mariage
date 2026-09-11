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
  templateName: string
  source: 'auth' | 'transactional' | 'automation'
  metadata?: Record<string, string | number | boolean | null>
}

function normalizeRecipient(value: string) {
  return value.trim().toLowerCase()
}

function assertValidInput(input: ResendSendInput) {
  const recipients = Array.isArray(input.to) ? input.to : [input.to]
  if (!recipients.length || recipients.some((email) => !/^\S+@\S+\.\S+$/.test(email.trim()))) {
    throw new Error('A valid recipient email is required')
  }
  if (!/^.+<\S+@\S+\.\S+>$/.test(input.from.trim())) {
    throw new Error('A valid sender email is required')
  }
  if (!input.subject.trim() || !input.html.trim()) {
    throw new Error('Email subject and HTML are required')
  }
}

async function recordAttempt(
  input: ResendSendInput,
  status: 'sent' | 'failed',
  messageId: string | null,
  errorMessage?: string,
) {
  const url = process.env['SUPABASE_URL']
  const serviceKey = process.env['SUPABASE_SERVICE_ROLE_KEY']
  if (!url || !serviceKey) return

  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })
    const recipients = Array.isArray(input.to) ? input.to : [input.to]
    const { error } = await supabase.from('email_send_log').insert(
      recipients.map((recipient) => ({
        message_id: messageId,
        template_name: input.templateName,
        recipient_email: normalizeRecipient(recipient),
        status,
        error_message: errorMessage?.slice(0, 1000) ?? null,
        metadata: { provider: 'resend', source: input.source, ...input.metadata },
      })),
    )
    if (error) console.error('[resend] email audit write failed', error.code)
  } catch (error) {
    console.error('[resend] email audit unavailable', error instanceof Error ? error.message : 'unknown')
  }
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

export async function sendResendEmail(input: ResendSendInput): Promise<{ id: string }> {
  assertValidInput(input)
  const lovableKey = process.env['LOVABLE_API_KEY']
  const resendKey = process.env['RESEND_API_KEY']
  if (!lovableKey || !resendKey) {
    const message = !lovableKey
      ? 'LOVABLE_API_KEY is not configured'
      : 'RESEND_API_KEY is not configured'
    await recordAttempt(input, 'failed', null, message)
    throw new Error(message)
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${lovableKey}`,
    'X-Connection-Api-Key': resendKey,
  }
  if (input.idempotencyKey) headers['Idempotency-Key'] = input.idempotencyKey

  let response: Response
  try {
    response = await fetch(`${GATEWAY_URL}/emails`, {
      method: 'POST',
      headers,
      signal: AbortSignal.timeout(15_000),
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
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Resend request failed'
    await recordAttempt(input, 'failed', null, message)
    throw error
  }

  if (!response.ok) {
    const body = await response.text()
    console.error(`[resend] send failed [${response.status}]: ${body}`)
    await recordAttempt(input, 'failed', null, `[${response.status}] ${body}`)
    throw new ResendSendError(response.status, body)
  }

  const payload = (await response.json().catch(() => ({}))) as {
    id?: string
    data?: { id?: string }
  }
  const id = payload.id ?? payload.data?.id
  if (!id) {
    const message = 'Resend accepted the request without returning a message id'
    await recordAttempt(input, 'failed', null, message)
    throw new ResendSendError(502, message)
  }

  await recordAttempt(input, 'sent', id)
  console.info('[resend] email accepted', { messageId: id, template: input.templateName })
  return { id }
}
