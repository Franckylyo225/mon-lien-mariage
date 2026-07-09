ALTER TABLE public.weddings
  ADD COLUMN IF NOT EXISTS practical_info_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS practical_parking text,
  ADD COLUMN IF NOT EXISTS practical_accommodation text,
  ADD COLUMN IF NOT EXISTS practical_contact_name text,
  ADD COLUMN IF NOT EXISTS practical_contact_phone text;