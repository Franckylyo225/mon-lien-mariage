# Nouveau bloc « Thème du mariage »

Aujourd'hui, l'ancien bloc « Notre Histoire » (un titre, un texte libre, quelques photos) n'apparaît plus que comme secours : dès qu'une page a des étapes dans le nouveau modèle timeline, l'ancien contenu est ignoré. 6 pages ont encore du contenu dans l'ancien format.

L'idée : transformer cet ancien format en un bloc autonome et réutilisable appelé **Thème du mariage** — un bloc de contenu libre (titre + texte + photos) que tout le monde peut activer, totalement séparé de « Notre Histoire ».

## Ce qui sera fait

### 1. Base de données
Nouveaux champs sur la page d'invitation :
- activation du bloc, titre (par défaut « Thème du mariage »), texte, photos, style d'affichage (police, taille, alignement).
- Reprise automatique du contenu existant : pour les pages qui ont déjà un texte ou des photos dans l'ancien bloc histoire, ce contenu est copié dans le nouveau bloc et le bloc est activé, pour que rien ne soit perdu ni ne disparaisse de la page publique.
- Les anciens champs restent en place (aucune suppression), mais ne servent plus au rendu.

### 2. Page publique
- Un nouveau bloc « Thème du mariage » avec le même rendu que l'ancien (titre, grille de photos cliquables avec lightbox, texte stylable).
- Il s'affiche uniquement s'il est activé et non vide.
- « Notre Histoire » ne rend plus que la timeline (nouveau modèle) : plus de repli sur l'ancien contenu, donc aucun risque de doublon.
- Placement : juste après « Notre Histoire », avant la galerie.

### 3. Éditeur inline
- Nouvelle carte « Thème du mariage » dans l'éditeur : interrupteur d'activation, titre, texte, ajout/suppression de photos (upload compressé comme ailleurs), et réglages de style.
- La carte « Notre Histoire » reste dédiée aux étapes de la timeline.

## Détails techniques

- Migration : ajout de `theme_block_enabled`, `theme_block_title`, `theme_block_body`, `theme_block_images`, `theme_block_style` sur `public.weddings`, plus un `UPDATE` de reprise depuis `story_body` / `story_images` / `story_title` / `story_style` quand ce contenu existe.
- `src/lib/wedding-store.tsx` : mapping DB ↔ `Couple` (`themeBlock*`) en lecture et en écriture.
- `src/lib/public-wedding.functions.ts` : ajout des colonnes au `select`, et `src/routes/e.$slug.tsx` : mapping côté page publique.
- `src/components/invitation-templates/sections.tsx` : extraction du rendu legacy dans un nouveau `ThemeBlockSection` (réutilise `ImageLightbox`), et simplification de `OurStorySection` (timeline seule).
- Les 16 templates rendent `ThemeBlockSection` après `OurStorySection` (ajout dans le rendu partagé pour éviter 16 éditions divergentes lorsque c'est possible).
- Nouveau `src/components/editor/ThemeBlockSheet.tsx` branché dans `PreviewEditor.tsx`.
