-- Sécurise et expose la vérification d'email au formulaire d'inscription (client anonyme).
-- La fonction est SECURITY DEFINER avec search_path vide pour éviter les attaques par injection,
-- et ne retourne qu'un booléen (pas de données sensibles).
create or replace function public.email_exists(_email text)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1 from auth.users where email = _email
  );
$$;

grant execute on function public.email_exists(text) to anon;
grant execute on function public.email_exists(text) to authenticated;
grant execute on function public.email_exists(text) to service_role;
