-- Vérifie si une adresse email est déjà utilisée (formulaire d'inscription)
create or replace function public.email_exists(_email text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from auth.users where email = _email
  );
$$;

grant execute on function public.email_exists(text) to service_role;