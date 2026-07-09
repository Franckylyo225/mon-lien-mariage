## Objectif

Créer une nouvelle page **Liens & Partages** (`/dashboard/share`) accessible uniquement une fois le paiement effectué (`couple.isPublished === true`). Sinon → paywall qui invite à publier.

## Structure de la page (dans l'ordre)

1. **Aperçu du lien de partage** (mise en avant — bloc principal)
   - Prévisualisation type "carte OG" (comme sur WhatsApp / iMessage / Facebook) : image + titre + description + domaine.
   - Champs éditables :
     - `Titre du partage` (défaut : `{Prénoms} — Vous êtes convié·e`)
     - `Description du partage` (défaut : `Rejoignez-nous le {date} à {ville}`)
     - `Image de partage` (URL ; défaut : `heroImageUrl`)
   - Ces valeurs alimentent les balises `og:title`, `og:description`, `og:image`, `twitter:*` de `src/routes/e.$slug.tsx`.
   - Note explicite affichée à l'utilisateur : les plateformes mettent en cache l'aperçu ; forcer un rafraîchissement peut prendre un moment.

2. **Lien public** — champ readonly + bouton *Copier*.

3. **Adresse personnalisée**
   - Input `monmariage.ci/e/{slug}` avec **vérification de disponibilité** en temps réel (debounce ~400 ms).
   - États : ✓ Disponible / ✗ Déjà pris / … Vérification.
   - Bouton *Enregistrer* actif seulement si valide + dispo.
   - **Suggestions courtes** générées si indisponible ou sur demande — privilégier les liens les plus courts :
     - initiales : `as`, `as27`
     - prénom+initiale : `aicha-s`, `stephane-a`
     - + année 2 chiffres : `as-27`
     - Filtrer par disponibilité avant affichage (max 4 suggestions).

4. **Partage WhatsApp** — bouton `wa.me/?text=…` avec message pré-rempli utilisant le titre de partage.

5. **QR Code** — image (api.qrserver.com), bouton *Télécharger*.

## Paywall

- Si `couple.isPublished === false` → la page rend un état verrouillé (icône cadenas, court texte, CTA *Publier mon invitation* → `/publish`). Pas de lien public, pas de slug, pas d'aperçu.
- Le lien "Ma page / Aperçu" de la bottom nav reçoit un onglet dédié **Partager** visible uniquement quand publié ; sinon on garde l'onglet Aperçu existant.
- Sur `dashboard/landing`, retirer les blocs "Lien public + QR + WhatsApp" et les déplacer ici (source unique de vérité). La page landing reste dédiée à la personnalisation du contenu.

## Détails techniques

### Base de données (migration Supabase)
Ajouter trois colonnes sur `weddings` :
- `share_title TEXT`
- `share_description TEXT`
- `share_image_url TEXT`

Aucune nouvelle table. Colonnes exposées via `getPublicWedding` (server fn déjà existante) pour être lues par `e.$slug.tsx`.

### Store `wedding-store.tsx`
- Étendre `Couple` avec `shareTitle`, `shareDescription`, `shareImageUrl`.
- Ajouter mappers `rowToCouple` / `coupleToRow` correspondants.

### Vérification de disponibilité slug
- Nouvelle server function `checkSlugAvailability` dans `src/lib/public-wedding.functions.ts` : requête publiable-key sur `weddings` where `slug = ? and id != currentWeddingId`. Retourne `{ available: boolean }`.
- Politique RLS déjà en place pour lecture publique via `getPublicWedding` — vérifier qu'une policy `SELECT` sur slug existe (elle existe déjà pour la page publique). Sinon, ajouter un RPC SECURITY DEFINER qui renvoie juste le booléen.

### Meta OG dynamique
- `src/routes/e.$slug.tsx` — `head({ loaderData })` utilise `data.wedding.share_title / share_description / share_image_url` en priorité, sinon fallback sur les valeurs actuelles + `hero_image_url`.
- Ajouter `og:image`, `twitter:card=summary_large_image`, `twitter:image`, `og:url` (relatif).

### Nouveau fichier route
- `src/routes/dashboard.share.tsx` (`createFileRoute("/dashboard/share")`), `head()` avec `robots: noindex`.

### Navigation
- `BottomNav.tsx` : quand `isPublished`, remplacer le 4ᵉ onglet "Ma page" par "Partager" pointant vers `/dashboard/share` (icône `IconShare`). L'aperçu reste accessible depuis "Ma page" landing / bouton dédié.
- `TITLES` dans `dashboard.tsx` : ajouter `"/dashboard/share": "Liens & Partages"`.

### Nettoyage `dashboard.landing.tsx`
- Retirer la section "Lien public + QR" et les CTA WhatsApp / QR (déplacés vers `/dashboard/share`).
- Garder l'éditeur de template, contenu, contact, dress code, etc.

## Fichiers touchés

- **Nouveau** : `src/routes/dashboard.share.tsx`
- **Nouveau** : migration SQL (ajout 3 colonnes `weddings`)
- **Modifiés** :
  - `src/lib/wedding-store.tsx` (type + mappers)
  - `src/lib/public-wedding.functions.ts` (retour des 3 colonnes + nouvelle fn `checkSlugAvailability`)
  - `src/routes/e.$slug.tsx` (head OG dynamique + passage des champs au template si besoin)
  - `src/routes/dashboard.landing.tsx` (retrait des blocs partage)
  - `src/components/mobile-shell/BottomNav.tsx` (onglet Partager si publié)
  - `src/routes/dashboard.tsx` (titre)

## Hors périmètre (non fait dans ce plan)

- Génération automatique d'une image OG personnalisée (server-side rendering d'une carte visuelle). L'utilisateur colle une URL image pour l'instant. Peut être ajouté plus tard.
- Intégration réelle CinetPay (le paiement reste simulé comme aujourd'hui).