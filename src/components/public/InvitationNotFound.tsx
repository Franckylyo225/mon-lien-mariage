import { Link } from "@tanstack/react-router";

/**
 * Écran « invitation introuvable » de la page publique. Déclaré dans son propre
 * module (et non dans la route) pour que le découpage de route puisse
 * l'extraire sans conflit entre notFoundComponent et errorComponent.
 */
export function InvitationNotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-6 text-center">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">404</p>
        <h1 className="mt-3 font-serif text-4xl italic">Invitation introuvable</h1>
        <p className="mt-3 max-w-sm text-sm opacity-70">
          Cette invitation n'existe pas ou n'a pas encore été publiée. Vérifiez le lien reçu de la
          part des mariés.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block font-mono text-[10px] uppercase tracking-widest opacity-60 hover:opacity-100"
        >
          ← Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
