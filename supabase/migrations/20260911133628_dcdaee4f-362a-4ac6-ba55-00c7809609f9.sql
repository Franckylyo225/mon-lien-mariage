ALTER TABLE public.weddings
ADD COLUMN IF NOT EXISTS rsvp_ever_enabled boolean NOT NULL DEFAULT false;

UPDATE public.weddings
SET rsvp_ever_enabled = true
WHERE rsvp_enabled = true;