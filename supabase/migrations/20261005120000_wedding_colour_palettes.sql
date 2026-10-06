-- Colour palettes, split away from the themes.
--
-- Until now each of the 30 theme slugs carried its own colours, so picking a
-- layout also picked a palette. `palette` now holds colour on its own, and the
-- theme keeps the layout, the typography and the ornaments. Existing rows stay
-- NULL and keep rendering from their theme's defaults, so no published page
-- changes appearance.
ALTER TABLE public.weddings ADD COLUMN IF NOT EXISTS palette text;

ALTER TABLE public.weddings DROP CONSTRAINT IF EXISTS weddings_palette_check;
ALTER TABLE public.weddings
  ADD CONSTRAINT weddings_palette_check CHECK (
    palette IS NULL OR palette IN (
      'ivoire-or','rose-poudre','bordeaux-creme','sauge-lin',
      'terracotta-sable','bleu-nuit-laiton','indigo-wax','nuit-cuivre'
    )
  );

-- Two colour roles the couple could not reach before: the secondary (bands,
-- photo veils, footer) was theme-only, and the ornament metal did not exist.
ALTER TABLE public.weddings ADD COLUMN IF NOT EXISTS secondary_color text;
ALTER TABLE public.weddings ADD COLUMN IF NOT EXISTS ornament_color text;

ALTER TABLE public.weddings DROP CONSTRAINT IF EXISTS weddings_secondary_color_check;
ALTER TABLE public.weddings
  ADD CONSTRAINT weddings_secondary_color_check CHECK (
    secondary_color IS NULL OR secondary_color ~ '^#[0-9A-Fa-f]{6}$'
  );

ALTER TABLE public.weddings DROP CONSTRAINT IF EXISTS weddings_ornament_color_check;
ALTER TABLE public.weddings
  ADD CONSTRAINT weddings_ornament_color_check CHECK (
    ornament_color IS NULL OR ornament_color ~ '^#[0-9A-Fa-f]{6}$'
  );

-- Fix: the editor has been offering a custom hex background since the colour
-- tab shipped, but this constraint only ever allowed the four preset slugs, so
-- every custom background was rejected by the database. Accept both forms.
ALTER TABLE public.weddings DROP CONSTRAINT IF EXISTS weddings_background_base_check;
ALTER TABLE public.weddings
  ADD CONSTRAINT weddings_background_base_check CHECK (
    background_base IS NULL
    OR background_base IN ('ivoire','creme','blanc','gris')
    OR background_base ~ '^#[0-9A-Fa-f]{6}$'
  );
