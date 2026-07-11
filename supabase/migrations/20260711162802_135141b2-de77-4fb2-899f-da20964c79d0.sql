ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS user_first_name text,
  ADD COLUMN IF NOT EXISTS email_notifications boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS deletion_requested_at timestamptz;