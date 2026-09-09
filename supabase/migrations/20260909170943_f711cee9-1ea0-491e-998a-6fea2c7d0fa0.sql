CREATE OR REPLACE FUNCTION public.verify_email_automation_token(_token text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE v_hash text;
BEGIN
  IF _token IS NULL OR length(_token) < 16 THEN RETURN false; END IF;
  SELECT value_hash INTO v_hash FROM public.app_secrets WHERE key = 'email_automation';
  IF v_hash IS NULL THEN RETURN false; END IF;
  RETURN encode(sha256(_token::bytea), 'hex') = v_hash;
END;
$$;

REVOKE ALL ON FUNCTION public.verify_email_automation_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_email_automation_token(text) TO anon, authenticated, service_role;