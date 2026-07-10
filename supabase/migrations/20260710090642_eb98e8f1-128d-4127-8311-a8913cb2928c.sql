ALTER TABLE public.weddings
  ADD COLUMN IF NOT EXISTS dress_code_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS dress_code_title text,
  ADD COLUMN IF NOT EXISTS dress_code_images jsonb DEFAULT '[]'::jsonb;