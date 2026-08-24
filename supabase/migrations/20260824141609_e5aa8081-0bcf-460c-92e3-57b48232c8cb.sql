ALTER TABLE public.weddings
  ADD COLUMN IF NOT EXISTS splash_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS splash_bg_mode text NOT NULL DEFAULT 'theme',
  ADD COLUMN IF NOT EXISTS splash_bg_color text,
  ADD COLUMN IF NOT EXISTS splash_bg_image_url text,
  ADD COLUMN IF NOT EXISTS splash_kicker text,
  ADD COLUMN IF NOT EXISTS splash_tap_label text,
  ADD COLUMN IF NOT EXISTS splash_show_date boolean NOT NULL DEFAULT true;