CREATE OR REPLACE FUNCTION public.rsvp_respond_by_token(
  _slug text,
  _token text,
  _attending boolean,
  _companions integer DEFAULT 0
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_guest public.guests%ROWTYPE;
  v_wedding public.weddings%ROWTYPE;
  v_status text;
  v_plus integer := GREATEST(COALESCE(_companions, 0), 0);
  v_ids text[];
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

  -- Cérémonies concernées : celles de l'invité, sinon toutes les publiées
  SELECT COALESCE(NULLIF(v_guest.ceremony_ids, '{}'),
                  ARRAY(SELECT c2.id::text FROM public.ceremonies c2
                         WHERE c2.wedding_id = v_wedding.id AND c2.status = 'publiée'))
    INTO v_ids;

  UPDATE public.guests
     SET rsvps = COALESCE((
           SELECT jsonb_agg(jsonb_build_object(
                    'ceremonyId', cid,
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
         AND (v_guest.ceremony_ids = '{}' OR c2.id::text = ANY(v_guest.ceremony_ids))
    LOOP
      INSERT INTO public.rsvps (wedding_id, ceremony_id, guest_id, guest_name, guest_phone, guest_type, attending, companions)
      VALUES (v_wedding.id, c.id, v_guest.id, v_guest.name, v_guest.phone, v_guest.guest_type, true, v_plus);
    END LOOP;
  END IF;

  RETURN 'ok';
END;
$$;

REVOKE ALL ON FUNCTION public.rsvp_respond_by_token(text, text, boolean, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rsvp_respond_by_token(text, text, boolean, integer) TO anon, authenticated, service_role;