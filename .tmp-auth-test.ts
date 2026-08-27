import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL!
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!
const supabase = createClient(url, key, { auth: { persistSession: false } })

async function run() {
  // Mot de passe oublié -> template "recovery"
  const r1 = await supabase.auth.resetPasswordForEmail('franck@nwc-agency.com', {
    redirectTo: 'https://moninvit.com/reset-password',
  })
  console.log('recovery =>', r1.error ? `ERROR ${r1.error.message}` : 'requested')

  // Lien de connexion -> template "magiclink"
  const r2 = await supabase.auth.signInWithOtp({
    email: 'franck@nwc-agency.com',
    options: { shouldCreateUser: false, emailRedirectTo: 'https://moninvit.com' },
  })
  console.log('magiclink =>', r2.error ? `ERROR ${r2.error.message}` : 'requested')
}
run()
