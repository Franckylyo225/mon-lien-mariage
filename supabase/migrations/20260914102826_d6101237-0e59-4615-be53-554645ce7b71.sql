ALTER TABLE public.support_tickets
  ADD COLUMN IF NOT EXISTS user_read_at timestamptz,
  ADD COLUMN IF NOT EXISTS admin_read_at timestamptz;