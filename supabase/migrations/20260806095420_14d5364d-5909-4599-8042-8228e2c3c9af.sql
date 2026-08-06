CREATE OR REPLACE FUNCTION public.mark_payment_failed_secure(
  _token text,
  _reference text,
  _status text
) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE v_hash text;
BEGIN
  IF _token IS NULL OR length(_token) < 16 THEN RETURN 'unauthorized'; END IF;
  SELECT value_hash INTO v_hash FROM public.app_secrets WHERE key = 'payment_activation';
  IF v_hash IS NULL OR encode(sha256(_token::bytea), 'hex') <> v_hash THEN
    RETURN 'unauthorized';
  END IF;
  IF _status NOT IN ('failed', 'abandoned') THEN RETURN 'invalid'; END IF;

  UPDATE public.payments
     SET status = _status
   WHERE paystack_reference = _reference AND status = 'pending';

  RETURN 'ok';
END;
$$;

REVOKE ALL ON FUNCTION public.mark_payment_failed_secure(text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.mark_payment_failed_secure(text, text, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.mark_payment_failed_secure(text, text, text) TO anon, service_role;