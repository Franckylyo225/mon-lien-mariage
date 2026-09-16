CREATE OR REPLACE FUNCTION public.rsvp_public_signup(_slug text, _name text, _phone text DEFAULT NULL::text, _guest_type text DEFAULT NULL::text, _companions integer DEFAULT 0)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_wedding public.weddings%ROWTYPE;
  v_guest_id uuid;
  v_plus integer := GREATEST(COALESCE(_companions, 0), 0);
  v_ids uuid[];
  c record;
BEGIN
  IF _name IS NULL OR length(trim(_name)) < 2 THEN RETURN 'invalid'; END IF;

  SELECT w.* INTO v_wedding FROM public.weddings w WHERE w.slug = _slug AND w.is_published IS TRUE;
  IF NOT FOUND THEN RETURN 'not_found'; END IF;
  IF v_wedding.rsvp_enabled IS NOT TRUE THEN RETURN 'closed'; END IF;

  SELECT ARRAY(SELECT c2.id FROM public.ceremonies c2
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
    COALESCE((SELECT jsonb_agg(jsonb_build_object('ceremonyId', cid::text, 'status', 'confirmé', 'plusOnes', v_plus))
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
$function$;

CREATE OR REPLACE FUNCTION public.rsvp_respond_by_token(_slug text, _token text, _attending boolean, _companions integer DEFAULT 0)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_guest public.guests%ROWTYPE;
  v_wedding public.weddings%ROWTYPE;
  v_status text;
  v_plus integer := GREATEST(COALESCE(_companions, 0), 0);
  v_ids uuid[];
  c record;
BEGIN
  SELECT w.* INTO v_wedding FROM public.weddings w WHERE w.slug = _slug AND w.is_published IS TRUE;
  IF NOT FOUND THEN RETURN 'not_found'; END IF;

  SELECT g.* INTO v_guest FROM public.guests g
   WHERE g.wedding_id = v_wedding.id AND g.invite_token = _token;
  IF NOT FOUND THEN RETURN 'not_found'; END IF;

  IF v_wedding.rsvp_enabled IS NOT TRUE THEN RETURN 'closed'; END IF;

  v_status := CASE WHEN _attending THEN 'confirmé' ELSE 'décliné' END;
  IF NOT _attending THEN v_plus := 0; END IF;

  SELECT COALESCE(NULLIF(v_guest.ceremony_ids, '{}'::uuid[]),
                  ARRAY(SELECT c2.id FROM public.ceremonies c2
                         WHERE c2.wedding_id = v_wedding.id AND c2.status = 'publiée'))
    INTO v_ids;

  UPDATE public.guests
     SET rsvps = COALESCE((
           SELECT jsonb_agg(jsonb_build_object(
                    'ceremonyId', cid::text,
                    'status', v_status,
                    'plusOnes', v_plus))
             FROM unnest(v_ids) AS cid
         ), '[]'::jsonb)
   WHERE id = v_guest.id;

  DELETE FROM public.rsvps WHERE guest_id = v_guest.id;

  IF _attending THEN
    FOR c IN
      SELECT c2.id FROM public.ceremonies c2
       WHERE c2.wedding_id = v_wedding.id
         AND c2.status = 'publiée'
         AND (v_guest.ceremony_ids = '{}'::uuid[] OR c2.id = ANY(v_guest.ceremony_ids))
    LOOP
      INSERT INTO public.rsvps (wedding_id, ceremony_id, guest_id, guest_name, guest_phone, guest_type, attending, companions)
      VALUES (v_wedding.id, c.id, v_guest.id, v_guest.name, v_guest.phone, v_guest.guest_type, true, v_plus);
    END LOOP;
  END IF;

  RETURN 'ok';
END;
$function$;

DROP FUNCTION IF EXISTS public.guest_by_invite_token(text, text);

CREATE FUNCTION public.guest_by_invite_token(_slug text, _token text)
 RETURNS TABLE(id uuid, name text, phone text, guest_type text, ceremony_ids uuid[], allowed_plus_ones integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT g.id, g.name, g.phone, g.guest_type, g.ceremony_ids, g.allowed_plus_ones
  FROM public.guests g
  JOIN public.weddings w ON w.id = g.wedding_id
  WHERE w.slug = _slug
    AND g.invite_token = _token
  LIMIT 1;
$function$;

REVOKE ALL ON FUNCTION public.guest_by_invite_token(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.guest_by_invite_token(text, text) TO anon, authenticated, service_role;