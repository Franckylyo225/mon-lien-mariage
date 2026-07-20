## Objectif

Dans l'éditeur inline (`/dashboard/preview` → feuille « Thème & couleurs » → onglet **Couleurs**), permettre à l'utilisateur de choisir librement la couleur d'arrière-plan (hex arbitraire), en plus des 4 fonds préréglés déjà proposés, symétriquement au choix de couleur d'accent (textes).

## État actuel

- `ThemeSheet.tsx` propose : 12 accents preset + 4 fonds preset (`ivoire`, `creme`, `blanc`, `gris`).
- `couple.backgroundBase` est typé `BackgroundSlug` (union de 4 slugs) → impossible de stocker un hex libre aujourd'hui.
- `resolveTheme` mappe le slug vers un hex via `BG_HEX`.

## Changements

### 1. `src/lib/wedding-theme.ts`
- Élargir le type accepté pour `backgroundBase` : garder les 4 slugs prédéfinis + accepter n'importe quel `#RRGGBB`.
- `resolveTheme` : si `backgroundBase` est un hex valide → l'utiliser directement ; sinon si c'est un slug connu → `BG_HEX[slug]` ; sinon fallback sur `theme.defaultBg`.
- Ajouter un helper `isValidHex(hex)`.

### 2. `src/lib/wedding-store.tsx`
- Élargir le type `Couple.backgroundBase` en `string | undefined` (ou `BackgroundSlug | string`), pour autoriser un hex.

### 3. `src/components/editor/ThemeSheet.tsx` — onglet **Couleurs**
Sous la section actuelle « Fond » (les 4 preset) :
- Ajouter une petite pastille « + Personnalisée » (comme le bouton `+` du `ColorPicker`).
- Au clic, ouvrir un mini éditeur inline (réutiliser la logique de `ColorEditor` de `ColorPicker.tsx` : input hex + sliders HSL + presets suggérés) qui appelle `onPatch({ backgroundBase: hex })`.
- Si `backgroundBase` est déjà un hex libre (pas un slug), afficher cette pastille en état actif avec le hex courant + un bouton « Retirer » qui remet `undefined` (retour au défaut du thème).
- Les 4 preset restent cliquables ; sélectionner un preset écrase le hex libre.

### 4. Aucun impact backend
Le champ existe déjà en base (colonne texte). Aucune migration nécessaire — on stocke juste `#RRGGBB` au lieu d'un slug.

## Notes techniques (interne)
- Extraire `ColorEditor` de `ColorPicker.tsx` dans un fichier partagé `src/components/editor/HexEditor.tsx` pour le réutiliser dans `ThemeSheet` sans dupliquer les sliders HSL.
- `applyThemeVars` fonctionne déjà via `--wedding-bg` — pas de changement.
- Le bouton « Restaurer les valeurs du thème » couvre déjà le reset (met `backgroundBase: undefined`).

## Hors périmètre
- Aucun changement sur la couleur d'accent (déjà éditable via `ColorPicker` ailleurs, et via 12 preset ici).
- Pas de changement sur les templates publics.
