ALTER TABLE public.weddings
  DROP CONSTRAINT IF EXISTS weddings_opening_page_model_check;

ALTER TABLE public.weddings
  ADD CONSTRAINT weddings_opening_page_model_check
  CHECK (opening_page_model IN ('classique','presse','olive','arche_floral','romantique','breaking_news','editorial_date'));