CREATE TABLE public.email_automations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_key text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  phase text NOT NULL DEFAULT 'acquisition',
  delay_value int NOT NULL DEFAULT 0,
  delay_unit text NOT NULL DEFAULT 'hours' CHECK (delay_unit IN ('minutes','hours','days')),
  subject text NOT NULL,
  body_html text NOT NULL,
  cta_label text,
  cta_url_pattern text,
  is_active boolean NOT NULL DEFAULT true,
  max_sends_per_user int NOT NULL DEFAULT 1,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_automations TO authenticated;
GRANT ALL ON public.email_automations TO service_role;
ALTER TABLE public.email_automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage email automations"
  ON public.email_automations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER email_automations_touch_updated_at
  BEFORE UPDATE ON public.email_automations
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

CREATE TABLE public.email_automation_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  wedding_id uuid REFERENCES public.weddings(id) ON DELETE CASCADE,
  trigger_key text NOT NULL,
  recipient_email text,
  status text NOT NULL DEFAULT 'sent',
  sent_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_email_automation_log_unique
  ON public.email_automation_log (user_id, trigger_key, COALESCE(wedding_id, '00000000-0000-0000-0000-000000000000'::uuid));
CREATE INDEX idx_email_automation_log_trigger ON public.email_automation_log (trigger_key);
CREATE INDEX idx_email_automation_log_user ON public.email_automation_log (user_id);

GRANT SELECT ON public.email_automation_log TO authenticated;
GRANT ALL ON public.email_automation_log TO service_role;
ALTER TABLE public.email_automation_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read email automation log"
  ON public.email_automation_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.weddings ADD COLUMN IF NOT EXISTS paywall_reached_at timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS welcome_email_sent_at timestamptz;

INSERT INTO public.email_automations
  (trigger_key, name, description, phase, sort_order, delay_value, delay_unit, subject, body_html, cta_label, cta_url_pattern, is_active)
VALUES
('welcome','Bienvenue','Envoyé dès la confirmation de l''email, à la création du compte.','acquisition',1,0,'minutes',
 'Bienvenue sur moninvit.com 💌',
 '<h1>L''aventure commence maintenant.</h1><p>Bonjour {first_name},</p><p>Votre compte est activé. En quelques minutes, vous pouvez avoir votre propre page d''invitation — élégante, prête à partager sur WhatsApp avec toute votre famille.</p>{cta}<p class="note">Moins de 10 minutes. Gratuit jusqu''à la publication.</p>',
 'Créer ma première page →','/onboarding', true),

('account_inactive_48h','Compte jamais activé','Compte créé mais aucune page créée après 48h.','acquisition',2,48,'hours',
 'Votre invitation vous attend 💌',
 '<h1>On vous a gardé une place.</h1><p>Bonjour {first_name},</p><p>Vous vous êtes inscrit(e) il y a deux jours mais vous n''avez pas encore commencé votre invitation. Pas de souci — ça prend moins de temps qu''un café.</p>{cta}',
 'Commencer maintenant →','/onboarding', true),

('wizard_abandoned_24h','Page abandonnée — relance 1','Une page existe, création non terminée, aucune activité depuis 24h.','wizard',3,24,'hours',
 'Il vous reste 2 minutes pour finir 🎉',
 '<h1>Presque là !</h1><p>Bonjour {first_name},</p><p>Vous avez déjà commencé votre invitation pour {bride_name} &amp; {groom_name}. Il ne reste que quelques informations à remplir avant de pouvoir la publier.</p>{cta}<p class="note">Tout ce que vous avez déjà rempli est sauvegardé.</p>',
 'Reprendre là où j''en étais →','/dashboard', true),

('wizard_abandoned_72h','Page abandonnée — relance 2','Création toujours non terminée 72h après la création de la page.','wizard',4,72,'hours',
 'Votre page vous attend toujours',
 '<h1>Votre page vous attend.</h1><p>Bonjour {first_name},</p><p>Votre invitation pour {bride_name} &amp; {groom_name} est encore en brouillon. Cinq minutes suffisent pour la terminer.</p>{cta}',
 'Finir en 5 minutes →','/dashboard', true),

('paywall_reached','Page prête, publiez-la','Création terminée, page non publiée.','publication',5,1,'hours',
 'Félicitations, votre invitation est prête ! 🎉',
 '<h1>Elle est magnifique.</h1><p>Bonjour {first_name},</p><p>Votre page pour {bride_name} &amp; {groom_name} est prête à être découverte par vos invités. Il ne reste qu''une étape : la publier.</p>{cta}<div class="box">24 900 XOF · paiement unique · Wave, Orange Money, MTN, carte</div>',
 'Publier mon invitation →','/publish', true),

('publish_reminder_j3','Relance publication J+3','Toujours non publiée 3 jours après avoir été prête.','publication',6,72,'hours',
 'Vos invités attendent de vos nouvelles',
 '<h1>Vos invités attendent.</h1><p>Bonjour {first_name},</p><p>Votre page est prête depuis trois jours mais elle n''est pas encore en ligne. Vos invités ne peuvent pas encore confirmer leur présence.</p>{cta}',
 'Publier maintenant →','/publish', true),

('payment_abandoned','Paiement abandonné','Un paiement a été initié mais non complété après 1h.','publication',7,1,'hours',
 'Votre paiement n''a pas abouti',
 '<h1>Votre paiement n''a pas abouti.</h1><p>Bonjour {first_name},</p><p>Vous avez commencé le paiement de votre publication mais il n''a pas été finalisé. Aucun montant n''a été débité — vous pouvez reprendre quand vous voulez.</p>{cta}',
 'Reprendre le paiement →','/publish', true),

('published_success','Félicitations, page publiée','Déclenché dès la confirmation du paiement de publication.','publication',8,0,'minutes',
 'Votre invitation est en ligne ! 🎉',
 '<h1>C''est officiel.</h1><p>Bonjour {first_name},</p><p>Votre page est maintenant visible par tout le monde : <a href="https://moninvit.com/e/{slug}">moninvit.com/e/{slug}</a></p><p>Il est temps de la partager avec vos invités.</p>{cta}',
 'Voir ma page →','/e/{slug}', true),

('urgency_30d','Urgence — 30 jours avant le mariage','Page non publiée et mariage dans 30 jours ou moins.','urgence',9,0,'minutes',
 'Plus que 30 jours avant votre mariage',
 '<h1>Plus que 30 jours.</h1><p>Bonjour {first_name},</p><p>Votre mariage approche et votre page n''est pas encore publiée. C''est le bon moment pour envoyer votre invitation.</p>{cta}',
 'Publier maintenant →','/publish', true),

('urgency_7d','Urgence — 7 jours avant le mariage','Page non publiée et mariage dans 7 jours ou moins.','urgence',10,0,'minutes',
 'Il ne reste que 7 jours ⏱',
 '<h1 style="color:#D33A3A">Le compte à rebours est lancé.</h1><p>Bonjour {first_name},</p><p>Votre mariage approche et votre page n''est pas encore publiée. Vos invités ont besoin du programme, de l''adresse et du lien de confirmation.</p>{cta}',
 'Publier maintenant →','/publish', true),

('low_rsvp_j5','Peu de confirmations','Page publiée depuis 5 jours avec moins de 5 confirmations.','retention',11,120,'hours',
 'Avez-vous partagé votre lien à tout le monde ?',
 '<h1>Encore peu de réponses.</h1><p>Bonjour {first_name},</p><p>Votre page est en ligne depuis quelques jours mais peu d''invités ont confirmé leur présence. Un petit rappel sur WhatsApp fait souvent toute la différence.</p>{cta}',
 'Repartager mon lien →','/dashboard/share', false),

('upsell_guestbook_j2','Suggestion livre d''or','Page publiée depuis 2 jours, livre d''or non activé.','retention',12,48,'hours',
 'Un souvenir en plus de votre mariage',
 '<h1>Un souvenir qui reste.</h1><p>Bonjour {first_name},</p><p>Avec le livre d''or, vos invités laissent un mot depuis votre page d''invitation. Vous récupérez ensuite tous leurs messages dans un joli PDF souvenir.</p>{cta}<div class="box">1 990 XOF · option à ajouter à tout moment</div>',
 'Activer le livre d''or →','/dashboard', true);