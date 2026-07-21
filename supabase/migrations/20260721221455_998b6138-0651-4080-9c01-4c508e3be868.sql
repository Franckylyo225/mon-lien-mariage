
REVOKE ALL ON FUNCTION public.on_rsvp_confirmed() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.on_rsvp_confirmed() TO service_role;
