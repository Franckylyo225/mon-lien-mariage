# Galerie visuelle des pages d’ouverture

## Objectif
Remplacer les cartes textuelles par une galerie de miniatures verticales fidèles aux sept modèles, alimentées par les données actuelles du mariage et des photos de démonstration élégantes lorsque aucune photo personnelle n’est encore disponible.

## Expérience
- Conserver une grille compacte de deux colonnes sur mobile.
- Afficher chaque modèle dans un cadre 9:16, avec son vrai rendu réduit, puis son nom sous l’image.
- Retirer les descriptions longues.
- Marquer clairement le modèle sélectionné avec la couleur principale et une coche.
- Un premier appui sélectionne le modèle et ouvre immédiatement son aperçu plein écran.
- L’aperçu utilise le même composant et l’effet d’ouverture réellement choisi ; sa fermeture ramène aux réglages.
- Le bouton « Voir l’aperçu » existant reste disponible pour retester le modèle actif après personnalisation.

## Photos de démonstration
- Constituer un jeu local de quatre visuels déjà hébergés dans les assets MonInvit : portraits de couples, détail d’alliance et ambiance florale/décoration.
- Attribuer un visuel adapté à chaque modèle afin que la galerie soit immédiatement parlante.
- Utiliser en priorité la photo de page d’ouverture du marié, puis sa photo principale ; basculer automatiquement vers celle-ci dès qu’elle existe.
- Les images de démonstration restent uniquement des aperçus : elles ne sont pas enregistrées comme photo du mariage.

## Réalisation technique
- Créer un composant de miniature commun qui rend le vrai modèle dans une scène au format téléphone, mise à l’échelle et non interactive.
- Centraliser la résolution de la photo de prévisualisation et les données compactes partagées : prénoms, date, ville, couleur et texte.
- Réutiliser les composants de modèles existants ; ajouter un mode miniature au modèle Classique pour éviter son comportement plein écran lors de l’affichage en carte.
- Isoler les dimensions et styles de la galerie dans les styles globaux afin d’éviter les débordements et conserver une taille stable.
- Vérifier la sélection, l’aperçu plein écran et la mise à jour après ajout d’une photo sur l’écran mobile 393 × 833.

## Hors périmètre
- Aucun changement de prix, publication, données de mariage ou comportement de la page publique.
- Aucun nouveau réglage de modèle au-delà de ceux déjà disponibles.
