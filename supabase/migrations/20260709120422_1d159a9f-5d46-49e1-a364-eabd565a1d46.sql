ALTER TABLE public.weddings
  ADD COLUMN IF NOT EXISTS registry_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS registry_title text,
  ADD COLUMN IF NOT EXISTS registry_note text,
  ADD COLUMN IF NOT EXISTS registry_stores jsonb NOT NULL DEFAULT '[]'::jsonb;