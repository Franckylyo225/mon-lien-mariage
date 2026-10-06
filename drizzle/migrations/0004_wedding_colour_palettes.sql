ALTER TABLE public.weddings ADD COLUMN IF NOT EXISTS palette text;

ALTER TABLE public.weddings DROP CONSTRAINT IF EXISTS weddings_palette_check;
ALTER TABLE public.weddings
  ADD CONSTRAINT weddings_palette_check CHECK (
    palette IS NULL OR palette IN (
      'ivoire-or','rose-poudre','bordeaux-creme','sauge-lin',
      'terracotta-sable','bleu-nuit-laiton','indigo-wax','nuit-cuivre'
    )
  );

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

ALTER TABLE public.weddings DROP CONSTRAINT IF EXISTS weddings_background_base_check;
ALTER TABLE public.weddings
  ADD CONSTRAINT weddings_background_base_check CHECK (
    background_base IS NULL
    OR background_base IN ('ivoire','creme','blanc','gris')
    OR background_base ~ '^#[0-9A-Fa-f]{6}$'
  );