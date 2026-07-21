ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_last_name text;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, user_first_name, user_last_name, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    NULLIF(NEW.raw_user_meta_data->>'first_name',''),
    NULLIF(NEW.raw_user_meta_data->>'last_name',''),
    NULLIF(TRIM(CONCAT_WS(' ', NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'last_name')), '')
  )
  ON CONFLICT (id) DO UPDATE
    SET user_first_name = COALESCE(EXCLUDED.user_first_name, public.profiles.user_first_name),
        user_last_name  = COALESCE(EXCLUDED.user_last_name, public.profiles.user_last_name),
        display_name    = COALESCE(EXCLUDED.display_name, public.profiles.display_name);
  RETURN NEW;
END;
$function$;