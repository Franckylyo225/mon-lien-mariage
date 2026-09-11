# Envoi WhatsApp personnalisé depuis « Mes invités »

## Objectif
Permettre aux mariés de personnaliser un message WhatsApp commun et de l’envoyer individuellement à chaque invité avec ses informations réelles.

## Mise en œuvre
- Ajouter un réglage compact sur « Mes invités » pour modifier et enregistrer le modèle de message, avec les variables `{prenom}`, `{noms_maries}`, `{date}` et `{lien_rsvp}`.
- Conserver un modèle par défaut pour les événements existants et limiter sa longueur afin d’éviter les contenus invalides.
- Générer le message de chaque invité en remplaçant toutes les variables, puis ouvrir WhatsApp avec le texte encodé.
- Normaliser les numéros internationaux et utiliser `+225` comme indicatif par défaut lorsqu’aucun indicatif n’est fourni.
- Afficher une action WhatsApp sur chaque ligne; si le numéro manque ou est invalide, la désactiver avec l’aide « Ajoutez un numéro pour activer l’envoi WhatsApp ».
- Conserver le téléphone obligatoire et validé lors de l’ajout manuel d’un invité.

## Détails techniques
- Persister le modèle dans l’événement existant, protégé par les règles d’accès du propriétaire.
- Centraliser l’interpolation, le formatage de date, la normalisation du numéro et la création de l’URL dans un utilitaire testable.
- Utiliser les composants de bouton, info-bulle et panneau déjà présents dans l’application.
- Vérifier le rendu et l’ouverture du lien sur la page « Mes invités », puis contrôler la compilation.
