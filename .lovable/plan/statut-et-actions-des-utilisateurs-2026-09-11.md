# Statut et actions des utilisateurs

## Objectif
Améliorer la page admin « Utilisateurs » pour suivre la confirmation des comptes et alléger la colonne des actions.

## Modifications
- Ajouter une colonne « Statut » avec un badge « Confirmé » ou « Non confirmé » fondé sur la confirmation réelle de l’adresse email.
- Remplacer les boutons visibles par un menu à trois points par utilisateur.
- Regrouper dans ce menu : lien de réinitialisation, définition du mot de passe, désactivation/réactivation et suppression.
- Conserver la gestion du rôle administrateur dans ce même menu.
- Ajouter les actions serveur sécurisées manquantes pour désactiver, réactiver ou supprimer un compte, avec confirmations avant les opérations sensibles.

## Vérification
- Vérifier l’affichage des deux statuts et l’ouverture/fermeture du menu.
- Vérifier chaque action, le rafraîchissement de la liste et les messages de réussite ou d’erreur.
- Contrôler la compilation et les erreurs de la page.

## Détails techniques
Les opérations restent réservées aux administrateurs et sont exécutées côté serveur. La suppression est définitive et demandera une confirmation explicite.
