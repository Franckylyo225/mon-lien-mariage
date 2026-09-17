/**
 * Identifiants serveur fournis à l'exécution.
 *
 * Certains hébergements (ex. l'hébergement externe du domaine principal)
 * n'exposent pas les variables d'environnement gérées par la plateforme.
 * La planification de la base peut alors transmettre ces valeurs, lues dans le
 * coffre de la base, via des en-têtes HTTP. Ce module les mémorise pour la
 * durée de la requête afin que tout le reste du code serveur fonctionne à
 * l'identique, avec ou sans variables d'environnement.
 */

export interface RuntimeCredentials {
  supabaseUrl?: string | null
  serviceRoleKey?: string | null
  resendApiKey?: string | null
}

const runtime: RuntimeCredentials = {}

function clean(value?: string | null) {
  const trimmed = (value ?? '').trim()
  return trimmed.length > 0 ? trimmed : undefined
}

export function setRuntimeCredentials(input: RuntimeCredentials) {
  const url = clean(input.supabaseUrl)
  const key = clean(input.serviceRoleKey)
  const resend = clean(input.resendApiKey)
  if (url) runtime.supabaseUrl = url
  if (key) runtime.serviceRoleKey = key
  if (resend) runtime.resendApiKey = resend
}

export function getSupabaseUrl(): string | undefined {
  return (
    clean(process.env['SUPABASE_URL']) ||
    clean(runtime.supabaseUrl) ||
    clean(import.meta.env.VITE_SUPABASE_URL as string | undefined)
  )
}

export function getServiceRoleKey(): string | undefined {
  return clean(process.env['SUPABASE_SERVICE_ROLE_KEY']) || clean(runtime.serviceRoleKey)
}

export function getResendApiKey(): string | undefined {
  return clean(process.env['RESEND_API_KEY']) || clean(runtime.resendApiKey)
}
