# Corriger l'erreur d'inscription des invités sur la page publique

## Ce qui se passe

Quand un visiteur remplit le formulaire « Confirmez votre venue » sur une page publiée, l'enregistrement échoue systématiquement côté base, et l'écran affiche le message générique « Une erreur s'est produite ».

Vérifications faites sur la base :
- La fonction d'inscription publique construit la liste des cérémonies en texte, alors que la colonne correspondante de la table des invités attend des identifiants (type différent) : l'insertion est rejetée à chaque appel.
- Aucun invité n'a jamais été créé par ce parcours (0 enregistrement de source « inscription publique »).
- Les 291 réponses enregistrées à ce jour proviennent toutes de l'ancien chemin direct, et la plus récente date du 13/09 — plus rien depuis.
- Les deux autres fonctions liées au lien personnalisé (lecture de l'invité par jeton, réponse par jeton) ont le même défaut de type et échouent de la même façon.

## Correctifs

1. **Base de données** (une migration) : corriger les trois fonctions pour manipuler les identifiants de cérémonie au bon type.
   - `rsvp_public_signup` : liste des cérémonies en `uuid[]`, statut RSVP construit à partir de `cid::text`.
   - `guest_by_invite_token` : retourner `ceremony_ids` en `uuid[]` (signature de retour ajustée).
   - `rsvp_respond_by_token` : comparaisons `c2.id = ANY(v_guest.ceremony_ids)` sans conversion texte, et `v_ids` en `uuid[]`.
   Les fonctions restent `SECURITY DEFINER` avec `search_path` vide et exécutables par les visiteurs non connectés, comme aujourd'hui.

2. **Messages d'erreur lisibles** dans le formulaire public (`rsvp-form.tsx`) et dans le parcours par lien personnalisé (`rsvp-identified.tsx`) :
   - `closed` → « Les confirmations sont closes pour cet événement. »
   - `not_found` → « Cette page d'invitation n'est plus disponible. »
   - `invalid` → « Merci d'indiquer votre nom complet. »
   - erreur technique → message renvoyé par la base au lieu du texte générique (les erreurs de la base ne sont pas des `Error` JS, d'où le message vague actuel).
   Le repli « insertion directe » n'est plus déclenché quand la fonction répond explicitement `closed` / `not_found` / `invalid`.

3. **Vérification** : appel de bout en bout sur une page publiée (navigateur automatisé), puis contrôle qu'un invité de source « inscription publique » et sa réponse liée apparaissent bien dans la base et dans « Mes invités ».

## Détails techniques

- Migration Supabase remplaçant les trois fonctions (`CREATE OR REPLACE`), sans changement de schéma de table.
- `guest_by_invite_token` change de type de retour : `DROP FUNCTION` puis recréation, et adaptation du typage côté client si nécessaire (`src/integrations/supabase/types.ts` régénéré).
- Aucune modification de design, de couleurs ou de mise en page.
