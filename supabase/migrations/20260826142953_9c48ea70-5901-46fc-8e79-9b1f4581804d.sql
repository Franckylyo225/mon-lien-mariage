-- Notify platform admins when a new user signs up.
CREATE OR REPLACE FUNCTION public.on_profile_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_service_key text;
  v_email text;
BEGIN
  BEGIN
    v_email := COALESCE(NEW.email, (SELECT u.email FROM auth.users u WHERE u.id = NEW.id));

    SELECT decrypted_secret INTO v_service_key
      FROM vault.decrypted_secrets WHERE name = 'email_queue_service_role_key';

    IF v_email IS NOT NULL AND v_service_key IS NOT NULL THEN
      PERFORM net.http_post(
        url := 'https://project--e93d96ce-2e56-46da-9063-996fb84fe947.lovable.app/api/public/hooks/new-user',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || v_service_key
        ),
        body := jsonb_build_object(
          'user_id', NEW.id,
          'user_email', v_email,
          'first_name', NEW.user_first_name,
          'last_name', NEW.user_last_name,
          'display_name', NEW.display_name
        )
      );
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'on_profile_created: admin notification failed: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.on_profile_created() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_on_profile_created ON public.profiles;
CREATE TRIGGER trg_on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.on_profile_created();