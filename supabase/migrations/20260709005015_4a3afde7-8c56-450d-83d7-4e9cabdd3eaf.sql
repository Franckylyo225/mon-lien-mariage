ALTER TABLE public.weddings
  ADD COLUMN IF NOT EXISTS contact_name text,
  ADD COLUMN IF NOT EXISTS contact_phone text,
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS dress_code_note text,
  ADD COLUMN IF NOT EXISTS custom_info_title text,
  ADD COLUMN IF NOT EXISTS custom_info_body text;