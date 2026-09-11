# Galerie de 6 pages d'ouverture + 3 effets

## Objectif
Permettre au marié de choisir un modèle de page d'ouverture parmi 6, puis l'effet d'ouverture (toucher, glisser vers le haut, glisser vers le bas), puis de personnaliser photo, couleur et textes. La page actuelle devient le modèle « Classique » et reste identique pour tous les événements déjà créés.

## Les 3 effets
- Toucher pour ouvrir — ouverture par simple appui (fondu/zoom)
- Glisser vers le haut — la page se soulève
- Glisser vers le bas — la page descend

Le texte affiché (« Tapez pour ouvrir », « Glissez vers le haut »…) est généré automatiquement selon l'effet, non modifiable.

## Les 6 modèles
1. **Classique** (existant, inchangé) — photo pleine largeur, ornements floraux, « Save the date », prénoms + date. Effet par défaut : toucher.
2. **Presse** — fond blanc, prénoms en majuscules espacées, photo verticale centrée avec « SAVE THE DATE » superposé, date en bas. Toucher.
3. **Olive** — fond uni coloré (vert olive par défaut, modifiable), titre script + serif, photo encadrée, prénoms en script. Toucher.
4. **Arche florale** — photo plein écran, arche colorée semi-transparente en bas avec médaillon ovale, « Save the date » + prénoms. Glisser vers le haut.
5. **Romantique** — fond crème, prénoms en grand script avec « & » estompé, photo en arche, date avec séparateurs, doodle cœur. Toucher.
6. **Breaking news** — fond vif (rouge par défaut, modifiable), « Vous êtes invité au mariage de », prénoms en script, photo façon écran TV avec bandeau LIVE et bandeau défilant. Toucher.

Chaque modèle réserve un emplacement discret pour « Hello {prénom} », juste au-dessus du texte d'effet, affiché uniquement quand l'invité arrive par son lien personnel.

## Parcours de choix (dans l'éditeur, feuille « Page d'ouverture »)
1. Galerie des 6 modèles en miniatures, Classique en premier, un seul sélectionnable.
2. L'effet par défaut du modèle est présélectionné ; les 2 autres restent proposés.
3. Personnalisation : photo, couleur de fond/accent (modèles concernés), affichage de la date. Prénoms et date proviennent déjà de l'événement.

## Base de données
Nouvelle migration ajoutant sur `weddings` :
- `opening_page_model` (texte contraint : classique, presse, olive, arche_floral, romantique, breaking_news), défaut `classique`
- `opening_page_effect` (texte contraint : tap, swipe_up, swipe_down), défaut `tap`
- `opening_page_config` (JSON, défaut `{}`) pour couleur, photo et textes spécifiques

Tous les événements existants sont remplis en `classique` / `tap`, donc aucune page publique déjà en ligne ne change.

## Détails techniques
- Nouveau dossier `src/components/public/opening/` : un fichier par modèle + `registry.ts` avec métadonnées (nom, effet par défaut, champs personnalisables) et `React.lazy` par modèle. Seul le modèle choisi est téléchargé.
- `OpeningPage.tsx` : coque commune qui gère l'effet d'ouverture (transform/opacity CSS uniquement), le geste de glissement (pointer events), l'accessibilité clavier, le slot « Hello {prénom} » et le texte d'effet.
- `InvitationSplash.tsx` existant est réutilisé tel quel comme rendu du modèle Classique, branché dans la coque.
- `src/lib/wedding-store.tsx` : ajout de `openingPageModel`, `openingPageEffect`, `openingPageConfig` dans `Couple`, le mapping des lignes et le patch de sauvegarde.
- `src/routes/e.$slug.tsx` et `src/lib/public-wedding.functions.ts` : lecture des nouveaux champs, passage du prénom de l'invité identifié à la page d'ouverture.
- `src/components/editor/SplashSheet.tsx` : refonte en 3 étapes (galerie → effet → personnalisation), en conservant les réglages existants du modèle Classique (fond, image, kicker, date).
- Miniatures de galerie rendues en SVG/CSS légers, pas d'images téléchargées.
