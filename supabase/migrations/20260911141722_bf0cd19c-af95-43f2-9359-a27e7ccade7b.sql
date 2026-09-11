CREATE OR REPLACE FUNCTION public.rsvp_public_signup(
  _slug text,
  _name text,
  _phone text DEFAULT NULL,
  _guest_type text DEFAULT NULL,
  _companions integer DEFAULT 0
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_wedding public.weddings%ROWTYPE;
  v_guest_id uuid;
  v_plus integer := GREATEST(COALESCE(_companions, 0), 0);
  v_ids text[];
  c record;
BEGIN
  IF _name IS NULL OR length(trim(_name)) < 2 THEN RETURN 'invalid'; END IF;

  SELECT w.* INTO v_wedding FROM public.weddings w WHERE w.slug = _slug AND w.is_published IS TRUE;
  IF NOT FOUND THEN RETURN 'not_found'; END IF;
  IF v_wedding.rsvp_enabled IS NOT TRUE THEN RETURN 'closed'; END IF;

  SELECT ARRAY(SELECT c2.id::text FROM public.ceremonies c2
                WHERE c2.wedding_id = v_wedding.id AND c2.status = 'publiée')
    INTO v_ids;

  INSERT INTO public.guests (wedding_id, name, phone, guest_type, source, ceremony_ids, allowed_plus_ones, rsvps)
  VALUES (
    v_wedding.id,
    trim(_name),
    NULLIF(trim(COALESCE(_phone, '')), ''),
    COALESCE(NULLIF(_guest_type, ''), 'autre'),
    'qr_signup',
    v_ids,
    v_plus,
    COALESCE((SELECT jsonb_agg(jsonb_build_object('ceremonyId', cid, 'status', 'confirmé', 'plusOnes', v_plus))
                FROM unnest(v_ids) AS cid), '[]'::jsonb)
  )
  RETURNING id INTO v_guest_id;

  FOR c IN SELECT c2.id FROM public.ceremonies c2
            WHERE c2.wedding_id = v_wedding.id AND c2.status = 'publiée'
  LOOP
    INSERT INTO public.rsvps (wedding_id, ceremony_id, guest_id, guest_name, guest_phone, guest_type, attending, companions)
    VALUES (v_wedding.id, c.id, v_guest_id, trim(_name), NULLIF(trim(COALESCE(_phone, '')), ''),
            COALESCE(NULLIF(_guest_type, ''), 'autre'), true, v_plus);
  END LOOP;

  RETURN 'ok';
END;
$$;

REVOKE ALL ON FUNCTION public.rsvp_public_signup(text, text, text, text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rsvp_public_signup(text, text, text, text, integer) TO anon, authenticated, service_role;