# Audit et fiabilisation de tous les emails avec Resend

## Constats actuels
- La connexion Resend liée au projet est valide pour l’envoi.
- Les sept premiers renvois ont échoué car l’ancien déploiement rejetait la signature du webhook (401). Après republication, les sept appels ont répondu 200.
- Les emails d’authentification envoyés via Resend ne sont pas enregistrés dans le journal interne : un statut 200 du webhook ne permet donc pas de retrouver l’identifiant Resend ni de distinguer acceptation et échec.
- Les automatisations enregistrent actuellement « envoyé » sans identifiant Resend, et les notifications transactionnelles jettent également cet identifiant.
- Les anciens événements de livraison Lovable Emails ne représentent plus le nouveau circuit Resend et rendent le suivi ambigu.

## Modifications
1. Centraliser l’envoi Resend dans un seul service robuste : validation des adresses, délai maximal, remontée fidèle des erreurs, identifiant Resend obligatoire et journalisation structurée sans exposer les adresses dans les logs serveur.
2. Faire passer tous les emails par ce service : confirmation, récupération, connexion, invitation, changement d’adresse, réauthentification, alertes administrateur, RSVP et automatisations.
3. Enregistrer chaque tentative dans le journal email avec le modèle, le statut, l’identifiant Resend, l’erreur utile et des métadonnées de source.
4. Corriger les appels qui déclarent un succès sans conserver la preuve Resend, et ne plus marquer une automatisation comme envoyée si Resend n’a pas retourné d’identifiant.
5. Désambiguïser l’ancien suivi Lovable Emails afin que l’administration présente uniquement les envois réellement acceptés par Resend.
6. Ajouter des tests ciblés du service d’envoi et du webhook d’authentification, puis vérifier la compilation et les journaux de production.

## Vérification
- Tester la connexion Resend et un envoi contrôlé.
- Vérifier que l’identifiant Resend apparaît dans le journal interne.
- Vérifier les parcours confirmation, mot de passe oublié et automatisation.
- Contrôler qu’aucune ancienne voie d’envoi Lovable Emails ne subsiste dans les parcours actifs.

## Limite Resend constatée
La clé liée est volontairement limitée à l’envoi. Elle permet d’envoyer, mais pas de consulter l’historique Resend par API ; le nouveau journal interne fournira donc la preuve d’acceptation et l’identifiant de chaque envoi.
