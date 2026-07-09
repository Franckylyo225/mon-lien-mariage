ALTER TABLE public.weddings
  ADD COLUMN IF NOT EXISTS has_opening_effect boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS opening_effect_slug text;

ALTER TABLE public.weddings
  DROP CONSTRAINT IF EXISTS weddings_opening_effect_slug_check;

ALTER TABLE public.weddings
  ADD CONSTRAINT weddings_opening_effect_slug_check
  CHECK (
    opening_effect_slug IS NULL OR opening_effect_slug IN (
      'envelope-royal', 'envelope-floral', 'grand-portal',
      'cinema-curtain', 'falling-petals', 'book-open'
    )
  );