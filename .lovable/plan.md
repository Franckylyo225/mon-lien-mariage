# Emails automatiques pilotés par le parcours utilisateur

Objectif : envoyer automatiquement les bons emails selon l'avancement de chaque couple (inscription → création de page → publication), avec délai, objet et texte modifiables depuis l'espace admin, sans nouvelle mise en ligne.

## Ce que vous pourrez faire

- Voir les 12 relances regroupées par étape (Acquisition, Création, Publication, Urgence, Fidélisation) sur la page Emails de l'admin.
- Activer / désactiver chaque relance d'un clic.
- Modifier le délai, l'objet, le texte, le libellé et le lien du bouton, puis enregistrer — l'effet est immédiat.
- Envoyer un email de test à votre propre adresse.
- Voir, pour chaque relance, le nombre d'envois et la date du dernier envoi.

## Les 12 relances

Acquisition : Bienvenue · Compte jamais activé (48 h)
Création : Page abandonnée 24 h · Page abandonnée 72 h
Publication : Page prête à publier · Relance J+3 · Paiement abandonné · Félicitations page en ligne
Urgence : 30 jours avant le mariage · 7 jours avant
Fidélisation : Peu de confirmations (J+5) · Suggestion livre d'or (J+2)

Chaque personne ne reçoit une relance donnée qu'une seule fois par page d'invitation.

## Adaptations nécessaires

La demande décrit un moteur écrit pour une autre technologie (fonctions Deno + Resend). L'implémentation reprendra les mêmes règles, mais avec l'infrastructure déjà en place ici :

- Envoi via l'infrastructure email déjà configurée sur notify.moninvit.com (pas de nouveau prestataire).
- Moteur exécuté par une route interne protégée, appelée toutes les heures par la planification de la base.
- Les colonnes déjà existantes sont réutilisées : l'avancement de création (`onboarding_step`) sert d'équivalent au « wizard_step », `published_at` existe déjà. Seuls `paywall_reached_at` (weddings) et `welcome_email_sent_at` (profiles) sont ajoutés.
- Le journal d'envoi actuel (`email_send_log`) est conservé tel quel ; un nouveau journal dédié aux automatisations (`email_automation_log`) gère l'anti-doublon, pour ne rien casser dans les pages existantes.
- Les ouvertures/clics ne sont pas mesurables avec l'envoi actuel : les statistiques affichées seront « envoyés » et « dernier envoi ».

## Détail technique

1. Migration : tables `email_automations` (config + textes) et `email_automation_log` (anti-doublon, contrainte unique user/trigger/wedding), GRANTs, RLS admin-only, seed des 12 lignes avec objets et corps HTML à la charte (Framboise #E82050, Champagne #C6A15B, Encre #201A1C, fond #FAF8F5, Cormorant Garamond / Nunito Sans). Ajout de `weddings.paywall_reached_at` et `profiles.welcome_email_sent_at`.
2. `src/lib/email-automation.server.ts` : sélection des candidats par `trigger_key` (requêtes SQL équivalentes aux conditions décrites), rendu du gabarit HTML commun avec substitution `{first_name}`, `{bride_name}`, `{groom_name}`, `{slug}`, `{cta_url}`, envoi via `sendTemplateEmail`/`sendLovableEmail`, écriture du log.
3. `src/routes/api/public/hooks/email-automations.ts` : route protégée par le service-role, exécute le moteur ; planification horaire via `cron.schedule` + `net.http_post`.
4. `paywall_reached_at` renseigné au moment où la page devient prête à publier ; appel direct de `published_success` dans le webhook Paystack après passage à publié.
5. `src/lib/admin.functions.ts` : `listEmailAutomations`, `updateEmailAutomation`, `sendAutomationTest`, `runAutomationsNow` (tous réservés admin).
6. `src/routes/admin.emails.tsx` : nouvel onglet « Automatisations » à côté du journal existant, liste groupée par phase + panneau d'édition (délai, objet, corps, bouton, lien, actif) et bouton de test.

Ne sont pas modifiés : le parcours de création lui-même, le système de paiement, la logique du webhook Paystack existante (seul un appel email est ajouté à la fin).
