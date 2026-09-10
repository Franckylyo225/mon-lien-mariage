# Optimiser le dashboard et la PWA

## Objectif
Accélérer l’ouverture et la navigation de l’espace mariés, particulièrement sur mobile et réseau instable, sans modifier ses fonctionnalités.

## Changements prévus
- Réduire le JavaScript initial du dashboard en chargeant à la demande les fonctions lourdes et les interfaces secondaires.
- Éviter les lectures de session et de données en double au démarrage, puis garder les données utiles en cache pour les navigations suivantes.
- Ajouter un vrai cache PWA contrôlé pour les fichiers statiques, avec navigation prioritairement réseau et écran hors-ligne léger.
- Garantir que le service worker ne s’active jamais dans l’aperçu Lovable, ni sur les pages publiques d’invitation, et prévoir un arrêt via `?sw=off`.
- Optimiser le manifeste et le démarrage installé vers `/dashboard`, tout en conservant l’invite d’installation actuelle.
- Différer les éléments non essentiels du dashboard et stabiliser l’écran de chargement pour limiter les décalages visuels.

## Détails techniques
- Utiliser `vite-plugin-pwa` en mode `generateSW`, `injectRegister: null`, `devOptions.enabled: false`.
- Enregistrer `/sw.js` depuis un module unique avec les protections preview/dev/iframe requises.
- Utiliser `NetworkFirst` pour les navigations dashboard et `CacheFirst` uniquement pour les assets versionnés du même domaine; exclure OAuth et pages publiques.
- Charger dynamiquement `xlsx`, `jsPDF`, compression d’images et panneaux secondaires seulement au moment où ils servent.
- Mesurer les requêtes, erreurs console, tailles de bundles et rendu mobile après modification.

## Validation
- Vérifier installation, mode standalone, fallback hors-ligne et absence de service worker sur une invitation publique.
- Tester le dashboard sur mobile, contrôler les erreurs, le cache, la stabilité visuelle et la compilation finale.
