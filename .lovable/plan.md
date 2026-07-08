
# Refonte MonMariage.ci — Étape 1 (front-only, mocks)

Livraison par étapes comme convenu. **Cette PR = étapes 1-3 du brief** : landing, auth (mockée), wizard 4 étapes, dashboard avec progression. Pas de Supabase, pas de CinetPay. Les écrans suivants (aperçu, paywall + animation enveloppe, publication, page publique `/e/:slug`) sont scopés pour l'étape 2.

## Ce qui change dans l'existant

- **Store** : `wedding-store` reste la source de vérité côté démo, mais je le fais évoluer pour matcher le modèle du brief.
  - Ajout d'un objet `account` (email mocké, `isAuthenticated`, `onboardingStep`).
  - Ajout sur `couple` : `isPublished`, `isLocked`, `publishedAt`, `slug`, `coupleStory`, `coupleyPhotoUrl` (déjà partiellement là).
  - Ajout sur `Guest` : `guestType` (`parent_mariee | parent_marie | ami_mariee | ami_marie | collegue | autre`) + `maxCompanions` (existe déjà en `allowedPlusOnes`, je renomme conceptuellement).
  - Persistance localStorage (aujourd'hui non persistée → j'ajoute pour que le wizard survive un refresh).
- **Thèmes** : je passe des 5 templates actuels aux **3 thèmes du brief** (`rose-elegance` / `ivoire-epure` / `wax-dore`). Les 5 templates existants deviennent des variantes internes non-exposées pour l'instant — je garde le code mais je masque les entrées UI. Ça évite de tout jeter.
- **Homepage `/`** : remplacée par la landing marketing du brief (héro romantique serif, 3 bénéfices, un seul CTA "Commencer gratuitement"). L'ancienne homepage "produit" est supprimée.

## Nouvelles routes (Étape 1)

```
/                            landing (refonte)
/signup                      inscription mockée (email + mdp, pas de vraie auth)
/login                       connexion mockée
/onboarding/couple           wizard 1/4 — prénoms + date
/onboarding/ceremonies       wizard 2/4 — types de cérémonies (multi)
/onboarding/theme            wizard 3/4 — 3 thèmes
/onboarding/guests           wizard 4/4 — premiers invités (skippable)
/dashboard                   refonte : prénoms serif, compte à rebours, progression %, checklist
/dashboard/ceremonies        déjà là, adapté au nouveau modèle
/dashboard/ceremonies/$id    nouvel écran d'édition détaillée (dress code, capacité, notes, maps URL)
/dashboard/guests            renommage de dashboard.invites, avec chips de type d'invité
/dashboard/guests/new        écran d'ajout dédié (obligatoire par le brief)
```

## Étape 2 (pas dans cette PR)

- `/dashboard/preview` avec bandeau sticky "Aperçu privé"
- `/publish` paywall + add-on animation enveloppe (modale SVG 3s)
- `/publish/success` avec verrouillage `isLocked`
- `/e/$slug` page publique (404 si non publié)
- Activation Lovable Cloud + migration des tables Supabase
- Intégration CinetPay sandbox

## Design system

- Palette **Rose Élégance** par défaut (bordeaux `#993556`, rose poudré `#FBEAF0`, fond `#FAFAF9`, texte `#1A1A1A`). Les 3 thèmes sont définis en CSS vars et switchables via `data-theme` sur `<html>`.
- Typos déjà chargées : **Playfair Display** (serif italique, titres et prénoms) + **Inter** (UI). OK.
- Radii 8-12px, pas d'ombres lourdes, beaucoup de blanc.
- **Mobile-first strict** : chaque écran testé à 375px avant de scaler.

## Règles métier appliquées dès l'étape 1

- **Wizard resume** : au login, si `account.onboardingStep < 4`, redirection vers l'étape correspondante (détectée depuis l'état du wedding en store).
- **Progression dashboard** (formule du brief, 6 items pondérés) : prénoms 15%, date 10%, ≥1 cérémonie avec date+lieu 20%, toutes cérémonies date+lieu 15%, ≥5 invités 15%, photo 10%, thème 15%. Calculée à partir du store.
- **isLocked** existe déjà en modèle mais reste `false` en étape 1 (verrouillage sera testable à l'étape 2 après le paywall). Le bouton "Supprimer cérémonie" et les inputs prénoms reçoivent déjà la logique conditionnelle.

## Détails techniques

- Auth mockée : `signup`/`login` écrivent juste `{ email, isAuthenticated: true }` dans le store + localStorage. Aucune vérification. Une bannière discrète "Mode démo — auth simulée" est affichée sur `/signup` et `/login`.
- Persistance : `wedding-store` gagne un `useEffect` de sync localStorage (clé `mmci_state_v1`). Migration silencieuse si version différente.
- Chips de type d'invité : dictionnaire de couleurs douces (rose poudré / bleu poudré / lavande / menthe / sable / gris) centralisé dans `src/lib/guest-meta.ts`.
- Sélecteurs date/heure : `<input type="date">` / `<input type="time">` natifs (mobile-friendly), pas de dépendance externe.
- Aucun package ajouté à cette étape (pas de `qrcode`, pas de CinetPay SDK, pas de Supabase client).

## Livraison

Une seule passe pour livrer cette étape 1. À la fin je te propose de tester le parcours signup → wizard → dashboard, puis on enchaîne sur l'étape 2 (aperçu + paywall + animation enveloppe) dans un prompt séparé.
