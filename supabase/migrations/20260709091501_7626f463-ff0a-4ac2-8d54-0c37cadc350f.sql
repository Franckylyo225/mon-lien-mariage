ALTER TABLE public.weddings
  ADD COLUMN IF NOT EXISTS gallery_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS gallery_title text,
  ADD COLUMN IF NOT EXISTS gallery_images text[] DEFAULT '{}'::text[];