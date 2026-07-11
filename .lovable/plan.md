# Architecture multi-événements

## Écart schéma à noter

Le prompt parle d'une table `couples` avec `active_wedding_id`. Elle n'existe pas dans ce projet — on a `profiles` (1 ligne par user) et `weddings.owner_id → auth.users`. J'utilise donc `profiles.active_wedding_id` (équivalent fonctionnel). Aucune table `couples` créée.

## 1. Migration

- `ALTER TABLE weddings DROP CONSTRAINT weddings_owner_id_key` (retire l'unicité owner_id → autorise N mariages / compte)
- `ALTER TABLE profiles ADD COLUMN active_wedding_id uuid REFERENCES weddings(id) ON DELETE SET NULL`
- Backfill : pour chaque profile sans `active_wedding_id`, prendre le wedding le plus récent du user
- RLS `ceremonies` / `guests` / `rsvps` : déjà scopés via `weddings.owner_id`, rien à changer

## 2. Store (`wedding-store.tsx`)

- Charger `profiles.active_wedding_id` au boot ; charger la liste des weddings du user
- Exposer : `weddings[]`, `activeWeddingId`, `switchActiveWedding(id)`, `createNewWedding()` (insert vide + set active + retourne id)
- Toutes les mutations existantes ciblent déjà "le wedding du user" → passer à "le wedding = activeWeddingId"
- Ceremonies / guests filtrés par `wedding_id === activeWeddingId`

## 3. Nouvelle route `/dashboard/events` (l'app est routée sur `/dashboard`, pas `/app` — je garde `/dashboard/events` pour cohérence)

- Layout minimal (pas dans le shell dashboard) : header avec retour + titre "Mes événements" + bouton `+`
- Sections "En cours" / "Passés" / carte "Nouvel événement" comme spécifié
- Tap carte → `switchActiveWedding(id)` puis `navigate /dashboard`
- Tap `+` ou carte "Nouvel événement" → modale de confirmation → `createNewWedding()` → `navigate /onboarding/prenoms`

## 4. Redirection au login

Dans `login.tsx` / après signIn : compter weddings du user :
- 0 → `/onboarding/prenoms` (créer wedding vide d'abord)
- 1 → `/dashboard` + set active_wedding_id
- ≥2 → `/dashboard/events`

## 5. Dashboard `/dashboard` (index)

- Ajouter sous le bloc prénoms le lien discret "← Mes événements" (icône `IconLayoutList`, 10px gris) **uniquement si `weddings.length > 1`**
- Aucun autre changement visuel

## 6. Drawer (`SideDrawer.tsx`)

- Ajouter en 1er item "Mes événements" (icône `IconCalendarHeart`) → `/dashboard/events`
- Visible uniquement si `weddings.length > 1` (passé en prop depuis `dashboard.tsx`)

## 7. Paiement

`/publish` inchangé, opère sur `activeWeddingId`. Chaque publication = nouveau paiement lié au wedding actif. (Table payments hors scope actuel — pas de changement si elle n'existe pas encore.)

## Fichiers touchés

- Migration Supabase (via outil)
- `src/lib/wedding-store.tsx` — liste weddings + active + switch + create
- `src/routes/dashboard.events.tsx` — nouveau
- `src/routes/login.tsx` — logique de redirection post-login
- `src/routes/dashboard.tsx` — passe `weddingsCount` au drawer
- `src/routes/dashboard.index.tsx` — lien "Mes événements" conditionnel
- `src/components/mobile-shell/SideDrawer.tsx` — item conditionnel
- `src/integrations/supabase/types.ts` — régénéré après migration

## Hors scope (confirmé par le prompt)

Wizard onboarding, paywall, onglets programme/invités/ma page, page publique `/e/:slug`, shell app.
