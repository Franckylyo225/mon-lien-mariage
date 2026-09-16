/**
 * Messages lisibles pour les réponses des fonctions RSVP publiques
 * (`rsvp_public_signup`, `rsvp_respond_by_token`).
 */
export function rsvpStatusMessage(status: unknown): string | null {
  switch (status) {
    case "closed":
      return "Les confirmations sont closes pour cet événement.";
    case "not_found":
      return "Cette page d'invitation n'est plus disponible.";
    case "invalid":
      return "Merci d'indiquer votre nom complet.";
    default:
      return null;
  }
}

/**
 * Les erreurs renvoyées par la base ne sont pas des `Error` JS :
 * on récupère quand même leur message plutôt qu'un texte générique.
 */
export function readableError(e: unknown): string {
  if (e instanceof Error && e.message) return e.message;
  if (e && typeof e === "object") {
    const rec = e as { message?: unknown; details?: unknown; hint?: unknown };
    for (const value of [rec.message, rec.details, rec.hint]) {
      if (typeof value === "string" && value.trim()) return value;
    }
  }
  return "Une erreur s'est produite.";
}
