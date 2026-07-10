ALTER TABLE public.weddings
  ADD COLUMN IF NOT EXISTS particle_effect_slug text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS particle_intensity text DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS particle_speed real DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS particle_size text DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS particle_color_mode text DEFAULT 'auto',
  ADD COLUMN IF NOT EXISTS particle_trigger_open boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS particle_trigger_loop boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS particle_trigger_rsvp boolean DEFAULT true;

ALTER TABLE public.weddings
  DROP CONSTRAINT IF EXISTS weddings_particle_effect_slug_check,
  DROP CONSTRAINT IF EXISTS weddings_particle_intensity_check,
  DROP CONSTRAINT IF EXISTS weddings_particle_size_check,
  DROP CONSTRAINT IF EXISTS weddings_particle_color_mode_check;

ALTER TABLE public.weddings
  ADD CONSTRAINT weddings_particle_effect_slug_check
    CHECK (particle_effect_slug IS NULL OR particle_effect_slug IN ('glitter','flowers','hearts','petals','bubbles','stars')),
  ADD CONSTRAINT weddings_particle_intensity_check
    CHECK (particle_intensity IN ('soft','normal','festive')),
  ADD CONSTRAINT weddings_particle_size_check
    CHECK (particle_size IN ('small','normal','large')),
  ADD CONSTRAINT weddings_particle_color_mode_check
    CHECK (particle_color_mode IN ('auto','bordeaux','gold','blush','sage','white'));