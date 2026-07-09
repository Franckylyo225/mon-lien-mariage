ALTER TABLE public.weddings
  ADD COLUMN IF NOT EXISTS share_title TEXT,
  ADD COLUMN IF NOT EXISTS share_description TEXT,
  ADD COLUMN IF NOT EXISTS share_image_url TEXT;