-- Google OAuth sign-in: Supabase stores the provider claims in
-- raw_user_meta_data under Google's own keys (given_name / family_name /
-- full_name / name), never the first_name / last_name pair our email sign-up
-- form sends. Without this, a Google account lands with an empty profile name.
--
-- Resolution order, per field:
--   first name → first_name, then given_name, then the first token of the full name
--   last name  → last_name,  then family_name, then the remaining tokens
-- Email sign-up behaviour is unchanged: its keys still win.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  meta         jsonb := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  v_full_name  text;
  v_first_name text;
  v_last_name  text;
BEGIN
  v_full_name := NULLIF(TRIM(COALESCE(meta->>'full_name', meta->>'name', '')), '');

  v_first_name := COALESCE(
    NULLIF(TRIM(meta->>'first_name'), ''),
    NULLIF(TRIM(meta->>'given_name'), ''),
    NULLIF(SPLIT_PART(COALESCE(v_full_name, ''), ' ', 1), '')
  );

  v_last_name := COALESCE(
    NULLIF(TRIM(meta->>'last_name'), ''),
    NULLIF(TRIM(meta->>'family_name'), ''),
    -- everything after the first token of the full name
    NULLIF(TRIM(SUBSTRING(COALESCE(v_full_name, '') FROM POSITION(' ' IN COALESCE(v_full_name, '') || ' '))), '')
  );

  INSERT INTO public.profiles (id, email, user_first_name, user_last_name, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    v_first_name,
    v_last_name,
    COALESCE(
      NULLIF(TRIM(CONCAT_WS(' ', v_first_name, v_last_name)), ''),
      v_full_name
    )
  )
  ON CONFLICT (id) DO UPDATE
    SET user_first_name = COALESCE(EXCLUDED.user_first_name, public.profiles.user_first_name),
        user_last_name  = COALESCE(EXCLUDED.user_last_name, public.profiles.user_last_name),
        display_name    = COALESCE(EXCLUDED.display_name, public.profiles.display_name);
  RETURN NEW;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
