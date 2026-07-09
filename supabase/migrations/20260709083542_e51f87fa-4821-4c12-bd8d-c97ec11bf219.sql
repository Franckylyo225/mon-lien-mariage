ALTER TABLE public.weddings
  ADD COLUMN IF NOT EXISTS countdown_style jsonb NOT NULL DEFAULT '{}'::jsonb;