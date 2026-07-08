
# Refonte MonMariage.ci — v2

Direction produit : passer d'un site "démo unique" à une vraie plateforme SaaS de création d'invitations de cérémonie, avec catalogue de templates, éditeur simple, et dashboard invités par cérémonie. Tout reste front-only (données en localStorage via `wedding-store`), donc les "pages publiques" sont des routes locales partageables en démo.

## 1. Nouvelle homepage `/`

Objectif : convertir. Structure repensée, plus "produit" et moins "carte de visite".

Sections dans l'ordre :
1. **Hero produit** — headline orienté bénéfice + aperçu visuel d'une invitation (mockup mobile flottant avec une des templates), 2 CTA : "Créer mon invitation" / "Voir les modèles".
2. **Bandeau confiance** — logos/citations courtes + compteurs (couples, RSVP, cérémonies).
3. **Galerie des templates** — grille de 5+ vignettes cliquables qui ouvrent la démo `/invitation/:template`.
4. **Types de cérémonies couverts** — 6 pictos (dot, civil, religieux, traditionnel, dîner, anniversaire de mariage) avec 1 phrase chacun.
5. **Comment ça marche** — 3 étapes (choisir un modèle → personnaliser → partager le lien/QR), avec une capture du dashboard.
6. **Fonctionnalités clés** — RSVP par cérémonie, +1, QR, WhatsApp, programme, plan d'accès.
7. **Témoignages** (garder les 2 actuels, remonter l'image `churchCouple`).
8. **Tarifs** — garder Gratuit / Le Grand Jour, ajouter une 3e offre "Sur-mesure" pour agences/wedding planners.
9. **FAQ** — 6 questions (est-ce que ça marche sans internet chez l'invité, puis-je changer après envoi, etc.).
10. **CTA final** + footer.

Direction visuelle : conserver la palette Terracotta lumière douce + typo serif italique déjà en place (cohérence avec ce qui a été validé), mais densifier la page (plus de preuves visuelles de produit, moins de "brochure").

## 2. Catalogue de templates d'invitation (5)

Chaque template = un composant React qui reçoit les mêmes données (`useWedding()`), rendu sur `/invitation/:template`.

Templates prévus :
- `terracotta` — la version actuelle, chaleureuse ivoirienne (défaut).
- `noir-minimal` — noir/ivoire, typo grotesque, très éditorial.
- `botanique-dore` — feuillages, filets dorés, ambiance classique.
- `tropical` — palmes, vert profond + corail, esprit lagunaire Abidjan.
- `art-deco` — géométrie or/bordeaux, style années 20.

Sélecteur de template : petit switcher en haut de `/invitation` (chip par style) — permet aussi à l'utilisateur de tester avant de choisir depuis le dashboard.

## 3. Éditeur landing `/dashboard/landing`

Ajouts à l'existant :
- Choix du template (radio visuel avec vignette de chaque style).
- Aperçu live du template sélectionné à droite (desktop) / dessous (mobile).
- Champs : prénoms, date, lieu principal, hashtag, mot des mariés, photo de couverture (URL), couleur d'accent (préréglages).
- Bouton "Copier le lien" + "Télécharger le QR" (QR généré côté client).

## 4. Cérémonies — passage à 6 types

Étendre le type `Ceremony` dans `src/lib/wedding-store.tsx` :
`dot | civil | religieux | traditionnel | diner | anniversaire`

- Chaque type a une icône, une couleur d'accent, un libellé FR.
- `dashboard.ceremonies` : sélecteur du type à la création, filtre par type.
- `dashboard.invites` : filtre "par cérémonie" déjà présent, s'étend automatiquement.
- Page invitation : afficher les cérémonies sous forme de timeline avec RSVP indépendant par cérémonie.

## 5. Dashboard — simplification

Garder la structure actuelle mais :
- **Overview (`/dashboard`)** : 4 KPI (invités totaux, confirmés, en attente, refus) + prochain événement + raccourcis (Partager le lien, Ajouter un invité, Ajouter une cérémonie).
- **Invités** : ajout d'un mini import "coller une liste" (une ligne = un invité), export CSV (blob local), recherche.
- **Cérémonies** : cartes par type avec compteur RSVP, action "Voir les invités de cette cérémonie".
- **Ma page** : voir §3.

## 6. Plan SaaS proposé

À afficher dans la section Tarifs :

| Offre | Prix | Cible | Limites |
|---|---|---|---|
| Découverte | Gratuit | Essayer | 1 cérémonie, 30 invités, 1 template, branding MonMariage.ci |
| Le Grand Jour | 25 000 FCFA (paiement unique) | Couple standard | Cérémonies & invités illimités, 5 templates, QR HD, WhatsApp, import CSV |
| Prestige | 75 000 FCFA | Grand mariage / wedding planner | Tout Grand Jour + sous-domaine perso, retrait du branding, plusieurs mariages gérés, support prioritaire |

## Détails techniques

- **Front-only strict** : aucune activation Cloud, tout dans `wedding-store` (localStorage). Les "pages publiques" sont juste des routes locales, on assume que la démo montre le concept.
- **Nouvelles routes** :
  - `src/routes/invitation.$template.tsx` (params `terracotta|noir-minimal|…`), et `src/routes/invitation.tsx` redirige vers le template choisi par défaut.
  - Chaque template dans `src/components/invitation-templates/<name>.tsx`, tous typés avec la même prop `WeddingData`.
- **QR code** : `bun add qrcode` (pure JS, compatible edge), génération côté client à partir de `window.location.origin + /invitation/:template`.
- **Icônes cérémonies** : mapping `type → LucideIcon` centralisé dans `src/lib/ceremony-meta.ts`.
- **Store** : étendre l'enum `type` de `Ceremony`, ajouter `templateId` sur `couple`, ajouter `accentColor` optionnel. Migration douce (fallback si absent en localStorage existant).
- **Responsive** : conserver les patterns déjà appliqués (grid + min-w-0 + shrink-0 pour headers).
- **SEO/head** : chaque nouvelle route reçoit son propre `head()` avec title + description FR spécifiques (pas de duplication).
- Aucun backend, aucune migration DB, aucune edge function.

## Ce qui ne change pas

- Palette et typographie actuelles (Terracotta), pour rester cohérent avec la direction déjà validée.
- Auth : aucune (front-only).
- Le store `wedding-store` reste la seule source de vérité côté démo.

## Livraison

Prêt à implémenter en une passe une fois validé : nouvelle homepage, 5 templates, éditeur enrichi, dashboard mis à jour, 6 types de cérémonies, QR client.
