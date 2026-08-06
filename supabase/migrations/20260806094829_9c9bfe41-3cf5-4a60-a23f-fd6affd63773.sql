CREATE TABLE IF NOT EXISTS public.app_secrets (
  key text PRIMARY KEY,
  value_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.app_secrets ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.app_secrets FROM anon, authenticated;
GRANT ALL ON public.app_secrets TO service_role;

INSERT INTO public.app_secrets (key, value_hash)
VALUES ('payment_activation', '2da798cc154f959190f8e4f29f68fe8cb00922e391f58c076bb055b9049a2ebe')
ON CONFLICT (key) DO UPDATE SET value_hash = EXCLUDED.value_hash;

CREATE OR REPLACE FUNCTION public.activate_payment_secure(
  _token text,
  _reference text,
  _transaction_id text DEFAULT NULL,
  _channel text DEFAULT NULL,
  _metadata jsonb DEFAULT NULL
) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_hash text;
  v_payment public.payments%ROWTYPE;
  v_meta jsonb;
  v_type text;
  v_bride text; v_groom text; v_slug text; v_base text; v_candidate text;
  v_i int := 2;
  v_include_guestbook boolean := false;
BEGIN
  IF _token IS NULL OR length(_token) < 16 THEN RETURN 'unauthorized'; END IF;
  SELECT value_hash INTO v_hash FROM public.app_secrets WHERE key = 'payment_activation';
  IF v_hash IS NULL OR encode(sha256(_token::bytea), 'hex') <> v_hash THEN
    RETURN 'unauthorized';
  END IF;

  SELECT * INTO v_payment FROM public.payments WHERE paystack_reference = _reference;
  IF NOT FOUND THEN RETURN 'not_found'; END IF;
  IF v_payment.status = 'success' THEN RETURN 'already'; END IF;

  UPDATE public.payments
     SET status = 'success',
         paystack_transaction_id = COALESCE(_transaction_id, paystack_transaction_id),
         payment_method = COALESCE(_channel, payment_method)
   WHERE paystack_reference = _reference;

  v_meta := COALESCE(_metadata, v_payment.metadata, '{}'::jsonb);
  v_type := COALESCE(v_meta->>'payment_type', v_payment.payment_type);

  IF v_type = 'publication' AND v_payment.wedding_id IS NOT NULL THEN
    SELECT bride_name, groom_name, slug INTO v_bride, v_groom, v_slug
      FROM public.weddings WHERE id = v_payment.wedding_id;

    v_base := COALESCE(NULLIF(v_meta->>'slug', ''), NULLIF(v_slug, ''),
                       lower(COALESCE(v_bride,'') || '-et-' || COALESCE(v_groom,'')));
    v_base := regexp_replace(lower(unaccent_fallback(v_base)), '[^a-z0-9]+', '-', 'g');
    v_base := trim(both '-' from v_base);
    IF v_base = '' THEN v_base := 'invitation-' || extract(epoch from now())::bigint; END IF;

    v_candidate := v_base;
    WHILE EXISTS (SELECT 1 FROM public.weddings WHERE slug = v_candidate AND id <> v_payment.wedding_id) AND v_i < 50 LOOP
      v_candidate := v_base || '-' || v_i;
      v_i := v_i + 1;
    END LOOP;

    v_include_guestbook := COALESCE((v_meta->>'include_guestbook')::boolean, false);

    UPDATE public.weddings
       SET is_published = true,
           is_locked = true,
           published_at = now(),
           has_envelope_animation = false,
           slug = v_candidate,
           has_guestbook = CASE WHEN v_include_guestbook THEN true ELSE has_guestbook END
     WHERE id = v_payment.wedding_id;

    IF v_payment.user_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, wedding_id, type, title, body, data)
      VALUES (v_payment.user_id, v_payment.wedding_id, 'publication_activated',
        'Votre invitation est publiée',
        CASE WHEN v_include_guestbook
          THEN 'Le paiement est confirmé : votre page est en ligne et le livre d''or est activé.'
          ELSE 'Le paiement est confirmé : votre page est désormais en ligne.' END,
        jsonb_build_object('slug', v_candidate, 'reference', _reference, 'include_guestbook', v_include_guestbook));
    END IF;

  ELSIF v_type = 'addon_guestbook' AND v_payment.wedding_id IS NOT NULL THEN
    UPDATE public.weddings SET has_guestbook = true WHERE id = v_payment.wedding_id;
    IF v_payment.user_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, wedding_id, type, title, body, data)
      VALUES (v_payment.user_id, v_payment.wedding_id, 'guestbook_activated',
        'Livre d''or activé',
        'Le paiement est confirmé : vos invités peuvent maintenant vous laisser un message.',
        jsonb_build_object('reference', _reference));
    END IF;
  END IF;

  RETURN 'activated';
END;
$$;

CREATE OR REPLACE FUNCTION public.unaccent_fallback(_t text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path TO '' AS $$
  SELECT translate(COALESCE(_t,''),
    'àáâãäåçèéêëìíîïñòóôõöùúûüýÿÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝ',
    'aaaaaaceeeeiiiinooooouuuuyyAAAAAACEEEEIIIINOOOOOUUUUY');
$$;

REVOKE ALL ON FUNCTION public.activate_payment_secure(text, text, text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.activate_payment_secure(text, text, text, text, jsonb) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.unaccent_fallback(text) TO anon, authenticated, service_role;