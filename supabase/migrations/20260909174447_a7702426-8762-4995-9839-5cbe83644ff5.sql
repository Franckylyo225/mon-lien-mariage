-- Restreint l'exécution de public.email_exists à service_role uniquement
revoke execute on function public.email_exists(text) from public;
revoke execute on function public.email_exists(text) from anon;
revoke execute on function public.email_exists(text) from authenticated;

grant execute on function public.email_exists(text) to service_role;