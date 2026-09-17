# Personnaliser la typographie des invitations

## Résultat attendu
- Ajouter deux réglages facultatifs par invitation : police des titres et police du texte.
- Conserver les polices propres à chaque thème tant qu’aucune personnalisation n’est choisie.
- Permettre de revenir aux deux polices du thème en une action.

## Interface
- Ajouter sous la sélection du thème un panneau « Personnaliser la typographie » dans l’étape « Ton modèle ».
- Proposer uniquement les 7 polices de titres et les 6 polices de texte fournies, avec un aperçu réel de chaque police et un état sélectionné clair.
- Réutiliser le même panneau dans l’outil « Thème & couleurs » de l’éditeur afin que le réglage reste modifiable après l’onboarding.
- Répercuter chaque choix immédiatement dans l’aperçu complet de l’invitation et dans la page publique.

## Données et performance
- Ajouter `custom_font_title` et `custom_font_body` à chaque invitation ; une valeur vide conserve la typographie du thème.
- Étendre la résolution centrale du thème afin que tous les modèles et pages d’ouverture héritent des polices choisies.
- Charger à la demande uniquement les familles personnalisées réellement utilisées par l’invitation affichée, avec `display=swap` ; ne jamais créer une requête contenant toute la liste.
- Valider les identifiants enregistrés contre la liste curatée avant de les appliquer.

## Vérification
- Tester sur mobile le choix des deux polices, leur aperçu instantané et la réinitialisation.
- Vérifier la page publique et confirmer que sa requête Google Fonts ne contient que les familles sélectionnées.
- Contrôler la compilation et l’absence d’erreurs dans l’aperçu.
