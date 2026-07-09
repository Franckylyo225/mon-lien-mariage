# Effets d'ouverture animés — 6 concepts

## Périmètre

Remplacer l'actuelle `EnvelopeAnimation` (unique) par un **système d'effets** sélectionnable, joué à la première visite d'une invitation publique.

## Modèle de données

Migration SQL sur `public.weddings` :
- `has_opening_effect boolean DEFAULT false`
- `opening_effect_slug text CHECK (... IN (6 slugs))`

Conserver `has_envelope_animation` pour rétrocompat (mappé vers `envelope-royal` si `has_opening_effect` est faux mais `has_envelope_animation` vrai).

Étendre `getPublicWedding` + type `Couple` (champs `hasOpeningEffect`, `openingEffectSlug`).

## Architecture front

Nouveau dossier `src/components/opening-effects/` :

```
opening-effects/
  index.tsx              // <OpeningEffect slug=... couple=... onDone=... />
  shared/
    useOpeningLifecycle.ts   // sessionStorage flag, reduced-motion, skip button, fade sortie
    OpeningShell.tsx         // fond plein écran + bouton Passer + gestion durée
  effects/
    EnvelopeRoyal.tsx        // Effet 1 (tap-to-open)
    EnvelopeFloral.tsx       // Effet 2 (variation Effet 1 + fleurs SVG)
    GrandPortal.tsx          // Effet 3 (deux battants + nœud)
    CinemaCurtain.tsx        // Effet 4 (velours)
    FallingPetals.tsx        // Effet 5 (36 pétales CSS)
    BookOpen.tsx             // Effet 6 (livre 3D)
  thumbnails/                // mini-SVG 6 vignettes (paywall + éditeur)
```

Règles communes centralisées dans `useOpeningLifecycle` :
- `sessionStorage['opening_seen_' + slug]` → skip si présent
- `prefers-reduced-motion` → afficher juste 1s de frame finale
- Bouton **Passer** apparaît après 1,5s
- Fade-in de la page à la fin (400ms)
- Durée max 5s

Aucune librairie ajoutée : CSS + SVG + framer-motion (déjà présent si utilisé, sinon fallback CSS keyframes inline). Je vérifie et j'utilise CSS pur si framer-motion absent.

## Intégration `/e/:slug`

Dans `src/routes/e.$slug.tsx` : remplacer le bloc `EnvelopeAnimation` par `<OpeningEffect slug={couple.openingEffectSlug ?? 'envelope-royal'} couple={couple} enabled={couple.hasOpeningEffect || couple.hasEnvelopeAnimation} />`.

## Éditeur

Dans l'éditeur "Ma page" (`PreviewEditor` / sheet dédié) : nouveau composant `OpeningEffectSheet` avec grille 2×3 des vignettes, sélection radio, aperçu plein écran en modal (réutilise `<OpeningEffect>`).

**Paywall** : pour l'instant, pas de logique de paiement dans cette annexe — j'ajoute juste l'UI (badge « 990 FCFA », vignettes grisées si `has_opening_effect=false`) et un bouton "Débloquer" qui bascule `has_opening_effect=true` (à câbler ensuite au provider de paiement).

## Ordre d'implémentation

1. Migration SQL + types
2. `useOpeningLifecycle` + `OpeningShell`
3. Effets 1, 4, 5 (les plus simples / prioritaires)
4. Effets 2, 3, 6
5. Vignettes SVG
6. Sheet éditeur + modal d'aperçu
7. Intégration dans `/e/:slug`
8. Vérif Playwright mobile 375×812

## Hors périmètre

- Intégration paiement réelle (juste UI paywall)
- Son
- Personnalisation fine des couleurs par effet

## Question avant de démarrer

Ce chantier est **conséquent** (~15-20 fichiers, 1 migration, refonte de l'ouverture). Confirmes-tu :

1. Je livre les **6 effets d'un coup** dans ce turn, ou seulement les **3 prioritaires** (Enveloppe Royale, Rideau de Gala, Pétales) et les 3 autres dans un turn suivant ?
2. Le sheet éditeur / paywall UI : à inclure maintenant ou après validation visuelle des effets ?
