ALTER TABLE public.weddings
ADD COLUMN IF NOT EXISTS whatsapp_invite_template text NOT NULL
DEFAULT 'Bonjour {prenom} 👋, vous êtes convié(e) au mariage de {noms_maries} le {date} ! Confirmez votre présence ici : {lien_rsvp}';

ALTER TABLE public.weddings
ADD CONSTRAINT weddings_whatsapp_invite_template_length
CHECK (char_length(whatsapp_invite_template) BETWEEN 1 AND 1000);