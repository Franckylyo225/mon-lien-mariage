# Effets de particules sur /e/:slug

## Objectif
Le couple choisit un style de particules (paillettes, fleurs, cœurs, pétales, bulles, étoiles) depuis l'éditeur inline, avec réglages d'intensité, vitesse, taille, couleur et déclencheurs. Rendu 100% Canvas, aucune librairie externe.

## 1. Base de données
Migration `weddings` : 8 nouvelles colonnes (`particle_effect_slug`, `particle_intensity`, `particle_speed`, `particle_size`, `particle_color_mode`, `particle_trigger_open`, `particle_trigger_loop`, `particle_trigger_rsvp`) avec valeurs par défaut et contraintes CHECK. Aucun impact RLS (weddings existe déjà).

## 2. Moteur (Canvas, pur TS)
`src/lib/particles/` :
- `types.ts` — interfaces `Particle`, `ParticleStyle`, `ParticleConfig`
- `styles.ts` — les 6 fonctions `draw()` avec couleurs par défaut
- `engine.ts` — classe `ParticleEngine` : boucle `requestAnimationFrame`, spawn, physique (gravité, oscillation sway, rotation, fade in/out, direction inversée pour bulles), méthodes `startLoop()`, `stop()`, `burst(n)`, `burstRsvp()`, `destroy()`, `resize()`
- Respect `prefers-reduced-motion` (soft ou désactivation loop) et `navigator.deviceMemory < 4` (force soft)

## 3. Composants React
- `src/components/particles/ParticleCanvas.tsx` — canvas fixe plein écran, `pointer-events:none`, `z-index:10`, `aria-hidden`, gère resize et cleanup
- `src/components/particles/StyleThumbnail.tsx` — mini canvas 80×110 animé en continu pour chaque style
- `src/components/editor/ParticleSheet.tsx` — bottom sheet configurateur (grille 3×2 de vignettes animées, toggle "Aucun effet", chips intensité/taille, slider vitesse, 6 ronds couleur dont Auto en dégradé conic, chips multi-select déclencheurs, aperçu live 60px)

## 4. Intégration
- **Page publique** `src/routes/e.$slug.tsx` : monte `<ParticleCanvas />` avec la config du wedding. Déclenche `burst()` à l'ouverture si activé, `startLoop()` si continu.
- **RSVP** : après succès du form, appeler `engine.burstRsvp()` (30 cœurs explosant du centre) — fonctionne même si aucun style n'est configuré, via un canvas éphémère monté 3s.
- **Éditeur** `PreviewEditor.tsx` : nouveau bouton "Effet de particules" dans les contrôles globaux, ouvre `ParticleSheet`. Persistance via `persist({...})` avec debounce existant.
- **Store** `src/lib/wedding-store.tsx` : ajouter les 8 champs au type et au mapping snake_case ↔ camelCase.
- **Loader public** `src/lib/public-wedding.functions.ts` : ajouter les colonnes au SELECT.

## 5. Hors périmètre (confirmé par spec)
Roue chromatique libre, mélange de styles, effets liés au scroll, collisions, son.

## Détails techniques
- Les vignettes du sélecteur utilisent le vrai moteur avec canvas 80×110 (clamp interne des positions).
- L'aperçu live du bottom sheet utilise aussi le moteur, dans un rectangle arrondi ~60px.
- Sauvegarde debounced à 500ms via l'`autosave-context` existant.
- Fallback RSVP : si aucun `particle_effect_slug`, on monte un canvas éphémère dédié aux cœurs pendant 3s puis on le démonte.
