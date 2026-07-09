
# Refonte des effets d'ouverture

Les 3 images de référence pointent vers deux archétypes premium :
- **A. Enveloppe crème embossée** avec fleurs gaufrées en relief + gros sceau de cire doré (N&J) + pastille "TAP TO OPEN" translucide.
- **B. Rideau de théâtre en velours rouge** qui s'écarte pour révéler l'invitation.

Les effets actuels (`EnvelopeRoyal`, `EnvelopeFloral`, `CinemaCurtain`) rendent ces idées mais de façon trop plate et géométrique (polygone triangle, rideau à plis droits, sceau texte). Je refonds ces 3 effets avec un rendu beaucoup plus riche, sans ajouter de librairie.

## Effets refondus

### 1. `envelope-royal` → "Enveloppe Ivoire Embossée" (réf. images 2 & 3)
- Fond crème avec vignette douce et texture papier subtile (SVG `feTurbulence`).
- Enveloppe portrait 300×420 (au lieu de paysage) avec :
  - Rabat triangulaire + **motifs floraux gaufrés** (SVG line-art blanc sur crème, filtre `drop-shadow` intérieure pour effet d'embossage) répartis sur le rabat et le dos.
  - **Sceau de cire circulaire** avec dégradé radial doré, bordure irrégulière (path organique, pas ellipse parfaite), reflet, ombre portée, et **monogramme "A & B" en script** (Cormorant italic) gravé au centre — texte légèrement enfoncé (double text ombré).
  - Pastille pilule blanche translucide "TAP TO OPEN" (Cormorant small caps, letter-spacing large) qui pulse doucement.
  - Sous l'enveloppe, gravure dorée "Prénom & Prénom — Ville · date".
- Interaction : au tap → le sceau se **fend en deux** (deux moitiés qui tombent avec rotation + fade), puis le rabat s'ouvre (rotateX 3D), la carte glisse vers le haut, puis fondu.
- Durée totale : ~2,8s après tap.

### 2. `envelope-floral` → "Enveloppe Botanique Aquarelle"
Variante plus colorée de la 1 : mêmes motifs gaufrés mais **remplis d'aquarelles pastel** (roses poudrés, sauge, or) au lieu de blanc gaufré, sceau assorti à `--wedding-accent`. Même interaction tap-to-open.

### 3. `cinema-curtain` → "Rideau de Velours" (réf. image 1)
Refonte complète :
- Fond scène sombre + halo doré central.
- Deux rideaux (gauche/droit) rendus en SVG avec :
  - **Plis verticaux réalistes** via ~14 bandes de dégradés linéaires (rouge foncé `#5a0a12` → rouge vif `#c81e2c` → rouge foncé, en alternance sur chaque pli) au lieu d'un aplat.
  - **Frange festonnée** (path en vagues) en bas de chaque rideau.
  - **Tringle dorée** en haut avec anneaux.
  - **Embrasses en cordon doré** avec pompons SVG.
- Animation : les rideaux s'écartent en 1,8s avec easing `cubic-bezier(.6,.05,.3,1)` (accélération puis décélération, comme un vrai tirage), légère rotation Y pour perspective, ombre qui s'étire sur les plis.
- Au centre, l'invitation apparaît en fondu + zoom léger derrière les rideaux (visible dès qu'ils commencent à s'écarter).
- Durée totale : 3,2s.

## Effets conservés tels quels
`grand-portal`, `falling-petals`, `book-open` — non concernés par les références utilisateur, gardés en l'état.

## Fichiers touchés
- `src/components/opening-effects/index.tsx` : réécriture des 3 fonctions `EnvelopeRoyal`, `EnvelopeFloral`, `CinemaCurtain` (~450 lignes remplacées). Signature publique et slugs inchangés → **aucune migration SQL, aucun changement d'API**, les invitations existantes basculent automatiquement sur les nouveaux visuels.
- Le sélecteur dans l'éditeur (`OpeningEffectSheet`) reste identique — les labels et l'ordre ne changent pas.

## Vérification
Playwright mobile 375×812 sur `/dashboard/preview` : ouvrir l'aperçu de chaque effet refondu, capturer 3 screenshots par effet (état initial / mi-animation / fin) et les inspecter.

## Hors périmètre
- Nouveaux slugs / nouvelle entrée dans le paywall.
- Bruits d'ambiance.
- Personnalisation fine des motifs floraux par l'utilisateur.
