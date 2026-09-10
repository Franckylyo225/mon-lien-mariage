# Optimiser les performances de la page publique

## Objectif
Améliorer le score Lighthouse mobile de la page d’accueil, avec une priorité sur un LCP inférieur à 2,5 s, un affichage initial plus rapide et l’absence de décalages visuels.

## Travaux prévus

1. **Accélérer le premier écran**
   - Retirer le compteur de pages publiées du chemin critique afin que le rendu initial ne soit plus bloqué par une requête.
   - Identifier l’image LCP, la charger en priorité et ne laisser en lazy loading que les images réellement sous la ligne de flottaison.
   - Réserver les dimensions et ratios des deux aperçus du premier écran.

2. **Alléger et optimiser les images**
   - Générer des variantes WebP/AVIF adaptées aux tailles réellement affichées sur mobile et desktop.
   - Utiliser `picture`, `srcset` et `sizes` avec fallback JPEG/PNG.
   - Ajouter dimensions explicites et lazy loading aux images hors premier écran.
   - Éviter le chargement anticipé des aperçus lourds et des iframes situés plus bas dans la page.

3. **Réduire les ressources bloquantes**
   - Limiter les polices chargées sur la page publique aux graisses réellement utilisées.
   - Héberger/précharger uniquement les polices nécessaires au premier écran avec `font-display: swap`.
   - Retarder les scripts de mesure et pixels jusqu’au consentement et après le rendu prioritaire, sans perdre le suivi.

4. **Stabiliser la mise en page**
   - Réserver l’espace des images, témoignages et contenus dynamiques.
   - Vérifier que la bannière de consentement est fixe et ne pousse jamais la page.
   - Neutraliser les animations initiales susceptibles de masquer ou retarder le contenu LCP.

5. **Configurer le cache statique**
   - Ajouter des en-têtes longue durée et `immutable` pour les fichiers buildés avec hash.
   - Définir une stratégie sûre pour les images/fontes versionnées, tout en laissant HTML et données dynamiques revalidables.

6. **Valider les résultats**
   - Vérifier la page sur viewport mobile et desktop, les erreurs console et les ressources réseau.
   - Contrôler le build final et mesurer les métriques Lighthouse avant/après lorsque l’environnement local le permet.

## Détails techniques
- Les optimisations resteront limitées à la page publique, aux ressources partagées nécessaires et à la configuration de livraison statique.
- Les pages d’invitation publiques et le dashboard ne seront pas fonctionnellement modifiés.
- Le CSS critique sera obtenu par réduction du chemin critique et chargement ciblé, plutôt que par une duplication fragile de styles générés.
