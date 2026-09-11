ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS invite_token text;
UPDATE public.guests SET invite_token = encode(gen_random_bytes(8), 'hex') WHERE invite_token IS NULL;
ALTER TABLE public.guests ALTER COLUMN invite_token SET DEFAULT encode(gen_random_bytes(8), 'hex');
ALTER TABLE public.guests ALTER COLUMN invite_token SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS guests_invite_token_key ON public.guests (invite_token);

ALTER TABLE public.rsvps ADD COLUMN IF NOT EXISTS guest_id uuid REFERENCES public.guests(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION public.guest_by_invite_token(_slug text, _token text)
RETURNS TABLE (id uuid, name text, phone text, guest_type text, ceremony_ids text[], allowed_plus_ones integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT g.id, g.name, g.phone, g.guest_type, g.ceremony_ids, g.allowed_plus_ones
  FROM public.guests g
  JOIN public.weddings w ON w.id = g.wedding_id
  WHERE w.slug = _slug
    AND g.invite_token = _token
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.guest_by_invite_token(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.guest_by_invite_token(text, text) TO anon, authenticated, service_role;