# Modèle d’ouverture « Date éditoriale »

## Objectif
Ajouter un septième modèle d’ouverture plein écran, centré sur une date monumentale superposée à la photo, sans modifier le rendu des six modèles existants.

## Expérience
- Ajouter **Date éditoriale** à la galerie, avec l’effet **Toucher pour ouvrir** présélectionné.
- Afficher la photo en plein écran, la date en chiffres sur deux caractères, les prénoms en majuscules espacées et l’indication d’ouverture en bas.
- Afficher « Hello {prénom} » uniquement pour un lien invité valide.
- Proposer un choix de texte **Clair**, **Foncé** ou **Automatique** ; le mode automatique analysera la photo dans le navigateur et conservera une ombre de sécurité.
- Ajouter une citation facultative, éditable depuis les réglages et affichée discrètement dans la composition.
- Conserver une mise en page stable pour les jours et mois à un chiffre, sur petits et grands mobiles.

## Stockage
- Étendre la valeur autorisée de `opening_page_model` avec `editorial_date`.
- Étendre `opening_page_config` avec `quote` et le mode de contraste du texte.
- Aucun changement pour les mariages existants, qui gardent leur modèle actuel.

## Détails techniques
- Créer un composant chargé à la demande uniquement lorsque ce modèle est choisi.
- Réutiliser la photo d’ouverture existante et le système commun des trois effets.
- Ajouter les réglages dédiés dans la feuille « Page d’ouverture » et les types associés.
- Vérifier la compilation et le rendu mobile dans l’aperçu.
