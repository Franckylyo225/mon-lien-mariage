# Harmoniser tous les sélecteurs de couleur

## Résultat attendu
- Remplacer les anciens réglages avec curseurs et code hexadécimal par la même grille tactile que le Dress code.
- Appliquer cette grille aux couleurs du thème, du texte, du modèle d’ouverture et de son arrière-plan.
- Conserver les actions existantes « Retirer » et « Terminé » selon chaque outil.

## Interface
- Réutiliser les 24 teintes nommées, en grille de 5 colonnes avec des cibles tactiles d’au moins 44 px.
- Afficher un anneau, un liseré interne et une coche contrastée sur la couleur active.
- Ajouter en dernière position le bouton « + » ouvrant le sélecteur natif pour une teinte hors palette.
- Garder de vrais boutons avec `aria-label` et `aria-pressed`, utilisables au clavier et par lecteur d’écran.

## Vérification
- Tester les réglages de couleur concernés sur mobile.
- Vérifier la sélection d’une teinte prédéfinie, d’une teinte personnalisée, puis les actions « Retirer » et « Terminé ».
- Contrôler la compilation et l’absence d’erreurs dans l’aperçu.
