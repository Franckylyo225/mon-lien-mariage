
# Personnalisation thème & couleurs

Bottom sheet dans l'éditeur inline pour choisir un thème (6 au total), une couleur d'accent (12 curées) et un fond (4 curés), avec aperçu en direct via CSS variables.

## 1. Base de données

Migration `weddings` :
- `accent_color text` (défaut null — hérite du thème)
- `background_base text` (défaut null — hérite du thème)

Le champ `theme` existant accepte 3 nouveaux slugs : `vert-sauge`, `bleu-nuit`, `or-antique`. Contrainte CHECK mise à jour pour valider les 6 thèmes et les 4 fonds.

Rétrocompatibilité : les valeurs NULL restent valides, le rendu tombe sur les défauts du thème.

## 2. Configuration des thèmes (fichier `src/lib/wedding-theme.ts`)

Nouveau module central exportant :
- `THEMES` : 6 entrées `{ slug, name, fontHeading, fontBody, defaultAccent, defaultBg, pattern? }`
- `ACCENTS` : les 12 couleurs curées (nom + hex)
- `BACKGROUNDS` : les 4 fonds (slug + hex)
- `resolveTheme(couple)` : retourne les valeurs finales `{ bg, accent, textPrimary, textSecondary, border, surface, fontHeading, fontBody }`
- `applyThemeVars(root, resolved)` : écrit toutes les CSS variables sur l'élément racine

Les couleurs de texte secondaire, bordure, surface sont dérivées de manière cohérente (fond clair → texte foncé, surface blanche).

## 3. Store & mappers

`src/lib/wedding-store.tsx` :
- Ajout à `Couple` : `accentColor?: string`, `backgroundBase?: "ivoire" | "creme" | "blanc" | "gris"`
- Nouveau slug `ThemeId` étendu aux 6 thèmes
- `rowToCouple` / `coupleToRow` gèrent les 2 nouvelles colonnes

`src/lib/public-wedding.functions.ts` : ajout des champs dans la sélection et le mapper public.

## 4. CSS variables & rendu

Les templates lisent des CSS variables au lieu de valeurs hardcodées :
- `--wedding-bg`, `--wedding-accent`, `--wedding-text-primary`, `--wedding-text-secondary`, `--wedding-border`, `--wedding-surface`, `--wedding-font-heading`, `--wedding-font-body`

Application :
- **Éditeur (`/dashboard/preview`)** : `useEffect` sur le wrapper de `PreviewPage` — met à jour les vars en fonction de `couple.theme / accentColor / backgroundBase`.
- **Page publique (`/e/:slug`)** : balise `<style>` inline dans `head()` (via `createFileRoute.head`) pour éviter le FOUC, en utilisant `loaderData`.

Composants qui adoptent l'accent : sceau enveloppe, compte à rebours, boutons RSVP, icônes cérémonie, séparateurs. Le corps de texte reste `--wedding-text-primary`.

## 5. Bottom sheet "Thème & couleurs"

Nouveau composant `ThemeSheet` dans `src/components/editor/ThemeSheet.tsx`, appelé depuis `PreviewEditor.tsx` (nouveau bouton palette dans les contrôles globaux).

Structure :
- Hauteur 60vh, drag pour aller à 85vh (comportement identique aux autres sheets)
- Deux onglets : **Thème** / **Couleurs**

**Onglet Thème** : grille 2×3 des 6 thèmes, chaque carte rend en direct un mini-preview (couple names dans la typo du thème, fond du thème, trait d'accent) — pas d'images statiques, on rend en HTML/CSS pour rester léger et à jour. Tap = applique thème + reset `accentColor` / `backgroundBase` à null.

**Onglet Couleurs** :
- Section "Couleur d'accent" : grille 6×2 de pastilles 44 px avec nom en 9 px
- Section "Fond" : grille 2×2 de tuiles avec "Aa" central
- Bouton texte "Restaurer les valeurs du thème" en bas (remet `accentColor` et `backgroundBase` à null)

Live update : chaque changement met à jour les CSS variables via `applyThemeVars` immédiatement, puis debounce 500 ms sur la sauvegarde Supabase (via `useAutosave` déjà en place).

Indicateur discret en bas du sheet : "Vos changements sont visibles en direct ci-dessus".

## 6. Priorités & hors périmètre

Hors périmètre (conforme à l'annexe §14) : roue chromatique libre, changement de typo, palette dynamique par thème (§11 phase 2 non implémentée), miniatures PNG statiques (rendu HTML à la place).

## Détails techniques

- Validation côté serveur : dans `coupleToRow`, si `accentColor` fourni, vérifier qu'il appartient aux 12 hex ; idem `backgroundBase` parmi les 4 slugs. Sinon reset à null.
- Templates existants (terracotta / noir-minimal / etc.) : refactor progressif — les couleurs hardcodées les plus visibles (hero background, accent boutons) passent en `var(--wedding-*)` avec fallback à la valeur actuelle. Pas de refonte complète des 5 templates.
- Le sceau d'enveloppe (`envelope-animation.tsx`) utilise déjà `couple.accent` — remplacé par `var(--wedding-accent)`.
