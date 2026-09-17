ALTER TABLE public.weddings
  ADD COLUMN IF NOT EXISTS custom_font_title text,
  ADD COLUMN IF NOT EXISTS custom_font_body text;

ALTER TABLE public.weddings
  ADD CONSTRAINT weddings_custom_font_title_allowed
  CHECK (custom_font_title IS NULL OR custom_font_title IN ('cormorant', 'playfair', 'marcellus', 'eb-garamond', 'cinzel', 'prata', 'amiri')) NOT VALID,
  ADD CONSTRAINT weddings_custom_font_body_allowed
  CHECK (custom_font_body IS NULL OR custom_font_body IN ('nunito', 'quicksand', 'inter', 'work-sans', 'jost', 'lato')) NOT VALID;