-- 5 new theme slugs (2 for the "Illustré" category, 3 for "Botanique"), added
-- so the theme catalogue reaches 30 (6 per category) as already announced on
-- the marketing homepage ("30 modèles"). They each reuse an existing
-- template component with a new color/font preset — no new component code.
-- Existing theme slugs are unchanged; only their app-side category label
-- (not stored in the database) moves, so no data migration is needed there.
ALTER TABLE public.weddings DROP CONSTRAINT IF EXISTS weddings_theme_check;

ALTER TABLE public.weddings
  ADD CONSTRAINT weddings_theme_check CHECK (
    theme IN (
      'rose-elegance','ivoire-epure','or-antique',
      'vert-sauge','jardin-sauvage','terracotta-boheme',
      'wax-dore','kente-royal','sahel-dore',
      'bleu-nuit','manuscrit','monochrome',
      'aquarelle','confetti','papier-kraft',
      'indigo-adinkra','kente-souverain','bogolan-bordeaux','wax-ivoire','nuit-ebene',
      'zellige-emeraude','mashrabiya-sable','arabesque-bordeaux','nacre-girih','calligraphie-nuit',
      'mangrove-emeraude','frangipanier-blush','bougainvillier',
      'encre-aquarelle','carnaval-dore'
    )
  );
