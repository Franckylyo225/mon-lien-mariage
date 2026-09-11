# Réorganiser « Mes invités »

## Résultat attendu
- Remplacer les deux blocs RSVP et WhatsApp par un seul bloc « Réglages de l’invitation ».
- Afficher ce bloc en mode guidé tant que le RSVP n’a jamais été activé, puis en résumé compact lors des visites suivantes.
- Ouvrir un seul tiroir d’édition contenant les réglages RSVP et le modèle WhatsApp.
- Conserver l’ordre : en-tête et compteurs, réglages, recherche, filtres, liste.
- Distinguer la liste réellement vide d’une recherche ou d’un filtre sans résultat.

## Interface
- Le résumé compact tient sur une à deux lignes et indique l’état du RSVP, son quota éventuel et le message WhatsApp, avec une icône d’édition.
- Le mode guidé explique les deux réglages et ouvre le même tiroir de configuration.
- L’état vide principal affiche « Vous n’avez pas encore d’invité » et « + Ajouter votre premier invité ».
- L’état filtré conserve « Aucun invité ne correspond à votre recherche ».

## Détails techniques
- Ajouter à chaque événement un indicateur persistant précisant que le RSVP a déjà été activé.
- Enregistrer cet indicateur lors de la première validation RSVP, sans l’effacer lors d’une désactivation ultérieure.
- Fusionner les deux composants actuels en un composant unique et conserver les règles existantes de quota, validation et message WhatsApp.
- Vérifier la page sur mobile, les interactions du tiroir et l’absence d’erreurs.
