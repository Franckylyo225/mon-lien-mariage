CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text,
  content text,
  cover_image_url text,
  category text NOT NULL CHECK (category IN ('traditions','organisation','style','reception','histoires')),
  author_name text NOT NULL DEFAULT 'L''équipe MonInvit',
  author_avatar_url text,
  reading_time_minutes int NOT NULL DEFAULT 5,
  is_featured boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  seo_title text,
  seo_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.blog_posts TO anon;
GRANT SELECT ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published posts are readable by everyone"
ON public.blog_posts FOR SELECT
USING (is_published = true);

CREATE POLICY "Admins can manage blog posts"
ON public.blog_posts FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'));

CREATE INDEX idx_blog_category ON public.blog_posts(category, published_at DESC);
CREATE INDEX idx_blog_featured ON public.blog_posts(is_featured, is_published);

CREATE TRIGGER blog_posts_touch_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

INSERT INTO public.blog_posts (slug, title, excerpt, content, category, author_name, reading_time_minutes, is_featured, is_published, published_at, seo_title, seo_description) VALUES
('checklist-mariage-6-mois','La checklist ultime des 6 derniers mois avant le mariage','De la liste d''invités au choix du traiteur, un plan clair mois par mois pour ne rien oublier lors de la dernière ligne droite.','## J-6 mois : poser les fondations

Verrouillez la date, le lieu et le budget global. C''est le trio qui conditionne tout le reste. À Abidjan, les salles les plus demandées se réservent souvent 8 à 10 mois à l''avance : si vous visez un samedi de décembre, ne tardez pas.

Commencez aussi la liste d''invités. Pas la version définitive — une première estimation suffit pour cadrer le traiteur et la salle.

## J-5 mois : les prestataires clés

Traiteur, photographe, DJ, décorateur. Demandez trois devis par poste, comparez ce qui est réellement inclus (déplacement, heures supplémentaires, matériel) et signez.

## J-4 mois : les tenues

Essayages, retouches, tenues traditionnelles pour la dot et le coutumier. Prévoyez deux essayages minimum et gardez une marge de trois semaines avant le jour J.

## J-3 mois : les invitations

C''est le moment d''envoyer. Une page d''invitation en ligne vous évite l''impression, la distribution et les relances : vous partagez un lien sur WhatsApp et les confirmations arrivent seules.

## J-2 mois : le plan de table

Avec les RSVP déjà rentrés, placez vos tables par affinités familiales. Gardez 5 % de marge pour les arrivées de dernière minute — en Côte d''Ivoire, elles existent toujours.

## J-1 mois : les détails

Confirmez chaque prestataire par écrit. Préparez les enveloppes de règlement. Désignez deux personnes de confiance comme référents le jour J.

## La dernière semaine

Ne prenez plus aucune décision structurante. Reposez-vous, hydratez-vous, et déléguez. Le plus dur est fait.',
'organisation','L''équipe MonInvit',7,true,true,'2026-06-12 09:00+00','Checklist mariage : les 6 derniers mois, étape par étape','Un rétroplanning complet des 6 derniers mois avant votre mariage en Côte d''Ivoire : prestataires, tenues, invitations, plan de table.'),

('reussir-sa-dot-abidjan','Réussir sa dot à Abidjan : le guide des familles','Symboles, présents, prises de parole : comment honorer la tradition tout en gardant une cérémonie fluide et chaleureuse.','## La dot, un dialogue entre deux familles

La dot n''est pas une transaction. C''est la reconnaissance officielle de l''alliance entre deux lignées. Sa réussite tient moins au montant des présents qu''à la qualité des échanges.

## Préparer la liste

Chaque ethnie a ses usages. Demandez la liste à la famille de la mariée plusieurs semaines à l''avance, par l''intermédiaire du porte-parole. Les postes classiques : pagnes, boissons, noix de cola, valise, enveloppe symbolique pour les oncles et les tantes.

## Choisir un bon porte-parole

C''est la pièce maîtresse. Un porte-parole expérimenté connaît le rythme des joutes verbales, sait faire rire et débloque les moments de tension. Ne l''improvisez pas la veille.

## Le déroulé type

1. Accueil et présentation des délégations
2. Annonce de la demande
3. Présentation des présents, poste par poste
4. Acceptation et bénédictions
5. Repas partagé

## Combien de temps prévoir

Trois heures en moyenne. Prévoyez de quoi occuper les enfants et de l''eau fraîche pour tout le monde.

## Les invitations

La dot réunit souvent 60 à 120 personnes. Une page d''invitation dédiée, avec plan d''accès et code vestimentaire, évite les appels incessants la veille.',
'traditions','L''équipe MonInvit',6,false,true,'2026-05-28 09:00+00','Réussir sa dot à Abidjan : guide complet pour les familles','Liste des présents, rôle du porte-parole, déroulé et budget : le guide pratique de la dot en Côte d''Ivoire.'),

('tenues-mariage-civil','10 idées de tenues pour un mariage civil moderne','Tailleurs, robes courtes, ensembles pantalon : notre sélection pour un look chic à la mairie sans écraser la robe du grand jour.','## Le civil mérite mieux qu''une robe de secours

À la mairie, la lumière est crue et les photos sont serrées. Misez sur des matières mates et des coupes nettes.

## Pour la mariée

1. La robe midi en crêpe ivoire, ceinturée
2. L''ensemble pantalon blanc à veste longue
3. La robe courte en dentelle, manches trois-quarts
4. Le tailleur pastel avec broche dorée
5. La robe chemise en soie lavée

## Pour le marié

6. Le costume bleu nuit sans cravate
7. Le trois-pièces beige, chemise blanche
8. La veste wax structurée sur pantalon uni
9. Le costume gris perle, pochette bordeaux
10. Le boubou brodé revisité, coupe ajustée

## Les accessoires qui changent tout

Une paire de chaussures impeccable, un bijou unique, et rien d''autre. Le civil se joue dans la sobriété.',
'style','L''équipe MonInvit',4,false,true,'2026-05-10 09:00+00','10 tenues de mariage civil modernes et élégantes','Nos idées de tenues pour la mairie : robes midi, ensembles pantalon, costumes et boubous revisités.'),

('playlist-reception','La playlist parfaite pour faire danser toute la salle','Coupé-décalé, afrobeats, slows romantiques : notre recette pour un dancefloor jamais vide, de l''entrée des mariés à la dernière heure.','## Pensez la soirée en cinq actes

Une réception réussie a une courbe. Elle monte, redescend, remonte.

## Acte 1 — L''arrivée des invités

Ambiance lounge : afro-soul, rumba douce, jazz ivoirien. Volume bas, on doit pouvoir se parler.

## Acte 2 — L''entrée des mariés

Un seul morceau, puissant, choisi ensemble. C''est le moment le plus filmé de la soirée.

## Acte 3 — Le repas

Instrumental et classiques intergénérationnels. Personne ne danse pendant le repas, et c''est très bien.

## Acte 4 — L''ouverture du bal

Slow, puis bascule immédiate en afrobeats pour embarquer la salle avant que l''élan retombe.

## Acte 5 — Le dancefloor

Coupé-décalé, zouglou, amapiano, dancehall. Alternez les tempos toutes les quatre chansons et gardez trois morceaux imparables pour la dernière demi-heure.

## Le brief au DJ

Donnez-lui une liste de 15 incontournables et surtout une liste noire. La liste noire compte plus que la playlist.',
'reception','L''équipe MonInvit',5,false,true,'2026-04-22 09:00+00','Playlist de mariage : la structure qui remplit le dancefloor','Comment construire la playlist de votre réception en Côte d''Ivoire, acte par acte, du cocktail à la dernière danse.'),

('gerer-plan-de-table','Gérer son plan de table sans se prendre la tête','La méthode simple pour placer 200 invités sans froisser personne, à partir des confirmations reçues en ligne.','## Attendez les confirmations

Un plan de table construit avant les RSVP est un plan de table à refaire. Fixez une date limite de réponse à trois semaines du mariage.

## La méthode des blocs

Regroupez d''abord par blocs : famille mariée, famille marié, amis, collègues, voisins, prestataires. Placez ensuite les blocs dans la salle, puis seulement les individus.

## Les règles d''or

- Les aînés près de la table d''honneur, loin des enceintes
- Les enfants sur une même zone, avec une animation
- Ne jamais isoler quelqu''un dans un bloc qu''il ne connaît pas
- Une table de secours vide, toujours

## Les cas sensibles

Familles recomposées, désaccords anciens : traitez-les en premier, à deux, sans négocier avec des tiers. Puis n''y revenez plus.

## Le jour J

Imprimez trois exemplaires du plan et confiez-les à vos référents. Affichez un plan lisible à l''entrée.',
'organisation','L''équipe MonInvit',5,false,true,'2026-04-05 09:00+00','Plan de table de mariage : la méthode simple pour 200 invités','Une méthode par blocs pour construire votre plan de table à partir des confirmations RSVP, sans stress ni impair.'),

('photos-mariage-conseils','5 conseils pour des photos de mariage inoubliables','Briefer votre photographe, penser la lumière, prévoir les moments clés : nos astuces essentielles pour un album qui traverse le temps.','## 1. Choisissez la lumière avant le lieu

À Abidjan, la lumière de 16h à 18h est la plus flatteuse. Calez vos photos de couple dans ce créneau, quitte à décaler le programme.

## 2. Faites une liste de plans

Vingt photos maximum, nommées. Le photographe ne devinera jamais que la grand-tante venue de Korhogo est incontournable.

## 3. Prévoyez un référent famille

Une personne qui connaît tout le monde et rassemble les groupes. Vous gagnerez quarante minutes.

## 4. Ne négligez pas les préparatifs

Les meilleures images viennent souvent du matin : les mains, les regards, les rires. Réservez le photographe deux heures plus tôt que prévu.

## 5. Négociez les délais de livraison

Mettez par écrit le nombre de photos retouchées et la date de remise. Trois mois d''attente sans clause, c''est fréquent.',
'style','L''équipe MonInvit',4,false,true,'2026-03-18 09:00+00','Photos de mariage : 5 conseils pour un album réussi','Lumière, liste de plans, référent famille, préparatifs, délais : nos conseils pour des photos de mariage inoubliables.'),

('budget-mariage-cote-divoire','Budget mariage en Côte d''Ivoire : à quoi s''attendre vraiment','Une répartition réaliste poste par poste, et les trois économies qui ne se voient pas le jour J.','## La règle des trois tiers

Un tiers pour la réception (salle, traiteur, boissons), un tiers pour l''image (tenues, photo, déco), un tiers pour tout le reste — dont l''imprévu.

## Les postes qui dérapent

Les boissons et le nombre d''invités. Un invité supplémentaire coûte rarement moins de 15 000 FCFA une fois tout additionné.

## Trois économies invisibles

1. Les invitations papier, remplaçables par une page en ligne
2. Les fleurs fraîches importées, remplaçables par des espèces locales
3. Le nombre de plats au menu : trois choix valent mieux que six

## Gardez 10 % de réserve

Elle sera dépensée. Toujours.',
'organisation','L''équipe MonInvit',5,false,true,'2026-03-02 09:00+00','Budget mariage en Côte d''Ivoire : répartition réaliste','Comment répartir votre budget mariage poste par poste et où faire des économies qui ne se voient pas.'),

('mariage-coutumier-deroule','Mariage coutumier : comprendre chaque étape','Ce qui se passe vraiment le jour du coutumier, et comment préparer les familles à un déroulé fluide.','## Ce que le coutumier n''est pas

Ce n''est pas une répétition du civil. C''est la cérémonie qui, aux yeux des familles, scelle l''union.

## Le déroulé

1. Installation des délégations
2. Salutations et présentation des porte-parole
3. Rappel de la demande et de la dot
4. Remise des présents restants
5. Bénédictions des aînés
6. Présentation officielle du couple
7. Partage du repas

## Les erreurs fréquentes

Sous-estimer la durée, oublier l''eau et les chaises pour les aînés, et ne pas prévoir de sonorisation : dans une cour, les paroles se perdent.

## Le code vestimentaire

Annoncez-le clairement sur l''invitation. Un pagne commun pour la famille crée des photos magnifiques et évite les hésitations.',
'traditions','L''équipe MonInvit',6,false,true,'2026-02-14 09:00+00','Mariage coutumier en Côte d''Ivoire : déroulé étape par étape','Comprendre le déroulé du mariage coutumier, les rôles de chacun et les erreurs à éviter.'),

('deco-salle-reception','Décorer sa salle sans exploser le budget','Trois partis pris de décoration simples qui transforment une salle nue en lieu de fête mémorable.','## Travaillez la lumière avant la déco

Des guirlandes chaudes et quelques projecteurs changent une salle plus efficacement que cent centres de table.

## Un seul geste fort

Un mur floral, une arche, un plafond de tissus. Un seul, bien fait, plutôt que trois à moitié.

## La table d''honneur d''abord

C''est le fond de 80 % de vos photos. Concentrez-y le budget.

## Les espèces locales

Feuillages tropicaux, palmes, hibiscus : disponibles, résistants à la chaleur, et bien plus photogéniques que des roses importées fatiguées.',
'reception','L''équipe MonInvit',4,false,true,'2026-01-28 09:00+00','Décoration de salle de mariage : 4 partis pris efficaces','Lumière, geste fort, table d''honneur et végétaux locaux : décorez votre salle de réception sans exploser le budget.'),

('histoire-awa-kofi','Awa & Kofi : « On a envoyé notre invitation un dimanche soir, tout était confirmé le mardi »','Mariés à Grand-Bassam en février, Awa et Kofi racontent comment ils ont géré 240 invités depuis leurs téléphones.','## Le point de départ

« On avait commencé avec des cartons. On en a imprimé 80, et on s''est rendu compte qu''on n''arriverait jamais à les distribuer. Les gens sont à Bouaké, à Paris, à Montréal. »

## Le basculement

Awa crée la page un dimanche soir. « J''ai mis nos prénoms, la date, les trois cérémonies, et une photo de nous à Bassam. Trente minutes. »

Le lien part sur trois groupes WhatsApp familiaux. « Le lundi matin, on avait 60 réponses. Le mardi soir, 190. »

## Ce qui a changé

« Le plus fou, c''est le plan de table. On savait exactement qui venait, qui venait avec qui, et qui avait des contraintes alimentaires. On l''a fait en une soirée au lieu de trois week-ends. »

## Leur conseil

« Mettez le code vestimentaire et le plan d''accès directement sur la page. On a reçu zéro appel pour demander où c''était. Zéro. »',
'histoires','Awa & Kofi',5,false,true,'2026-02-26 09:00+00','Awa & Kofi : 240 invités confirmés en 48 heures','Le témoignage d''un couple marié à Grand-Bassam qui a géré ses invitations et ses confirmations entièrement en ligne.'),

('histoire-marie-jean','Marie & Jean-Baptiste : « La diaspora a enfin pu suivre le mariage »','Entre Abidjan, Bruxelles et Toronto, ce couple raconte comment une page d''invitation a réuni trois continents.','## Une famille éclatée

« La moitié de la famille de Jean vit en Belgique. La mienne est entre Abidjan et Toronto. Envoyer des cartons, c''était impossible. »

## Une seule page, trois fuseaux

« On a mis les horaires de chaque cérémonie, et les gens à l''étranger savaient exactement quand se connecter pour les vidéos. »

## Le livre d''or

« C''est ce qui nous a le plus touchés. Ceux qui ne pouvaient pas venir ont laissé des messages. On les a imprimés et reliés. C''est le seul objet du mariage qu''on relit encore. »

## Leur conseil

« Ouvrez le livre d''or deux semaines avant, pas le jour J. Les gens ont le temps d''écrire quelque chose de vrai. »',
'histoires','Marie & Jean-Baptiste',4,false,true,'2026-01-15 09:00+00','Marie & Jean-Baptiste : réunir la diaspora autour du mariage','Comment un couple partagé entre Abidjan, Bruxelles et Toronto a réuni ses proches avec une invitation en ligne.'),

('histoire-fatou-ibrahim','Fatou & Ibrahim : « Le coutumier, le civil et la réception sur une seule page »','Trois cérémonies, trois listes d''invités différentes, un seul lien. Le récit d''une organisation sans fausse note.','## Le casse-tête des trois listes

« Au coutumier, on voulait 90 personnes, uniquement les familles. Au civil, 40. À la réception, 300. Trois listes, et surtout trois messages différents à faire passer. »

## La solution

« On a créé les trois cérémonies sur la même page, et chaque invité voyait seulement celles qui le concernaient. Plus personne ne s''est présenté au mauvais endroit. »

## Le jour J

« Les confirmations tombaient en direct sur le téléphone de ma sœur, qui gérait l''accueil. On savait combien de couverts commander à 48 heures près. »

## Leur conseil

« Fermez les confirmations dix jours avant. Sinon vous ne finalisez jamais rien avec le traiteur. »',
'histoires','Fatou & Ibrahim',5,false,true,'2025-12-08 09:00+00','Fatou & Ibrahim : gérer trois cérémonies sur une seule invitation','Coutumier, civil et réception : comment un couple ivoirien a géré trois listes d''invités depuis une seule page.');
