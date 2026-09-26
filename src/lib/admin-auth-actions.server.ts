/**
 * Actions d'administration des comptes (mot de passe, désactivation,
 * suppression, email de réinitialisation). Elles nécessitent la clé
 * serveur privilégiée. Si l'hébergement courant ne l'expose pas (ex. le
 * domaine principal hébergé ailleurs), l'action est relayée vers
 * l'hébergement de la plateforme, qui dispose de la clé et revérifie
 * lui-même que l'appelant est administrateur.
 */
import { getRequest } from "@tanstack/react-start/server";

export type AdminAuthAction =
  | { action: "set_password"; userId: string; password: string }
  | { action: "set_disabled"; userId: string; disabled: boolean }
  | { action: "delete_user"; userId: string }
  | { action: "reset_email"; email: string };

const RELAY_URL = "https://moninvit.lovable.app/api/public/admin-auth";

export async function executeAdminAuthAction(input: AdminAuthAction): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  let error: { message: string } | null = null;
  switch (input.action) {
    case "set_password":
      ({ error } = await supabaseAdmin.auth.admin.updateUserById(input.userId, {
        password: input.password,
      }));
      break;
    case "set_disabled":
      ({ error } = await supabaseAdmin.auth.admin.updateUserById(input.userId, {
        ban_duration: input.disabled ? "876000h" : "none",
      }));
      break;
    case "delete_user":
      ({ error } = await supabaseAdmin.auth.admin.deleteUser(input.userId));
      break;
    case "reset_email":
      ({ error } = await supabaseAdmin.auth.resetPasswordForEmail(input.email, {
        redirectTo: "https://moninvit.com/reset-password",
      }));
      break;
  }
  if (error) throw new Error(error.message);
}

export async function runAdminAuthAction(input: AdminAuthAction): Promise<void> {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_URL) {
    return executeAdminAuthAction(input);
  }
  const auth = getRequest()?.headers.get("authorization");
  if (!auth) throw new Error("Session expirée, reconnectez-vous.");
  const res = await fetch(RELAY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: auth },
    body: JSON.stringify(input),
  });
  const body = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(body.error || "L'action n'a pas pu être effectuée.");
}
