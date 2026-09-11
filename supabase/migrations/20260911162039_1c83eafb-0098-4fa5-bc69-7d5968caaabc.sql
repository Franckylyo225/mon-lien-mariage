ALTER TABLE public.weddings
  ADD COLUMN IF NOT EXISTS opening_page_model text NOT NULL DEFAULT 'classique',
  ADD COLUMN IF NOT EXISTS opening_page_effect text NOT NULL DEFAULT 'tap',
  ADD COLUMN IF NOT EXISTS opening_page_config jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.weddings SET opening_page_model = 'classique' WHERE opening_page_model IS NULL OR opening_page_model = '';
UPDATE public.weddings SET opening_page_effect = 'tap' WHERE opening_page_effect IS NULL OR opening_page_effect = '';

ALTER TABLE public.weddings
  ADD CONSTRAINT weddings_opening_page_model_check
  CHECK (opening_page_model IN ('classique','presse','olive','arche_floral','romantique','breaking_news'));

ALTER TABLE public.weddings
  ADD CONSTRAINT weddings_opening_page_effect_check
  CHECK (opening_page_effect IN ('tap','swipe_up','swipe_down'));