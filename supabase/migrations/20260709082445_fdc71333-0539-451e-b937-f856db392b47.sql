ALTER TABLE public.weddings
  ADD COLUMN IF NOT EXISTS countdown_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS countdown_units text[] NOT NULL DEFAULT ARRAY['days','hours','minutes','seconds']::text[];