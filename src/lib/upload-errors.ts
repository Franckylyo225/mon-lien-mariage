import { supabase } from "@/integrations/supabase/client";

/**
 * Verifies the user still has a valid auth session before uploading.
 * Returns null if OK, or a friendly error message string.
 */
export async function ensureAuthOrMessage(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      return "Votre session a expiré. Reconnectez-vous puis réessayez.";
    }
    return null;
  } catch {
    return "Impossible de vérifier votre session. Reconnectez-vous puis réessayez.";
  }
}

/** Map raw Supabase Storage errors to a user-friendly French message. */
export function friendlyUploadError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err ?? "");
  const msg = raw.toLowerCase();

  if (!raw) {
    return "Impossible d'uploader l'image. Vérifiez votre connexion et réessayez.";
  }
  if (msg.includes("object not found") || msg.includes("not_found")) {
    return "L'image n'a pas pu être enregistrée. Vérifiez votre connexion et réessayez.";
  }
  if (msg.includes("payload too large") || msg.includes("413")) {
    return "Cette image est trop lourde. Réessayez avec une photo plus légère.";
  }
  if (msg.includes("unauthorized") || msg.includes("jwt") || msg.includes("401")) {
    return "Votre session a expiré. Reconnectez-vous puis réessayez.";
  }
  if (
    msg.includes("row-level security") ||
    msg.includes("permission") ||
    msg.includes("403")
  ) {
    return "Accès refusé. Reconnectez-vous puis réessayez.";
  }
  if (
    msg.includes("failed to fetch") ||
    msg.includes("network") ||
    msg.includes("timeout")
  ) {
    return "Connexion instable. Vérifiez votre réseau et réessayez.";
  }
  return "Impossible d'uploader l'image. Vérifiez votre connexion et réessayez.";
}

/**
 * Strip accents/spaces/special chars from a filename base. Not used for the
 * storage key itself (we use UUIDs), but kept for any place that surfaces the
 * user's original filename.
 */
export function sanitizeFileName(name: string): string {
  const base = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return base
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 80) || "photo";
}
