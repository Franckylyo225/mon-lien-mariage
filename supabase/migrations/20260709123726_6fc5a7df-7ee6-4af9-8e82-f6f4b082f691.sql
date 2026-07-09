-- Extend the allowed set of themes for weddings to the 15 curated themes.
-- Drop any pre-existing check constraint on `theme` to avoid collision.
ALTER TABLE public.weddings DROP CONSTRAINT IF EXISTS weddings_theme_check;

ALTER TABLE public.weddings
  ADD CONSTRAINT weddings_theme_check CHECK (
    theme IN (
      'rose-elegance','ivoire-epure','or-antique',
      'vert-sauge','jardin-sauvage','terracotta-boheme',
      'wax-dore','kente-royal','sahel-dore',
      'bleu-nuit','manuscrit','monochrome',
      'aquarelle','confetti','papier-kraft'
    )
  );