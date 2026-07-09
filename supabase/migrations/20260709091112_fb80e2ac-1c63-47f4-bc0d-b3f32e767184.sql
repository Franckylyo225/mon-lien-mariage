ALTER TABLE public.weddings
  ADD COLUMN IF NOT EXISTS story_enabled boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS story_title text,
  ADD COLUMN IF NOT EXISTS story_body text,
  ADD COLUMN IF NOT EXISTS story_images text[] DEFAULT '{}'::text[];