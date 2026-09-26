-- Protect the paid flags (publication, guestbook) and the promo codes.
--
-- Before this migration a wedding owner could, with their own JWT, run
--   update weddings set is_published = true, has_guestbook = true ...
-- straight from the browser (policy "weddings owner all" allows every column),
-- read every promo code (policy "users read promo_codes" is USING (true)),
-- exhaust any code (increment_promo_uses) and insert fake "success" payments.
--
-- After it, paid flags only change through the payment activation function
-- (activate_payment_secure) or through publish_with_promo() below.

-- 1) Payments: a client can only create a *pending* payment. Status changes go
--    through activate_payment_secure / mark_payment_failed_secure (token-protected).
DROP POLICY IF EXISTS "Users can create their own payments" ON public.payments;
CREATE POLICY "Users can create their own payments"
  ON public.payments FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'
    AND paystack_transaction_id IS NULL
  );

-- 2) Promo codes: no more listing. A user can only look up a code they typed.
DROP POLICY IF EXISTS "users read promo_codes" ON public.promo_codes;

CREATE OR REPLACE FUNCTION public.validate_promo(_code text)
RETURNS TABLE (
  id uuid,
  code text,
  discount_percent integer,
  max_uses integer,
  uses integer,
  valid_from timestamptz,
  valid_until timestamptz,
  is_active boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT p.id, p.code, p.discount_percent, p.max_uses, p.uses, p.valid_from, p.valid_until, p.is_active
  FROM public.promo_codes p
  WHERE auth.uid() IS NOT NULL
    AND p.code = upper(trim(_code))
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.validate_promo(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.validate_promo(text) TO authenticated, service_role;

-- Redemptions are now written by publish_with_promo() only.
DROP POLICY IF EXISTS "users insert own redemptions" ON public.promo_code_redemptions;
REVOKE INSERT ON public.promo_code_redemptions FROM authenticated;

-- The usage counter is no longer callable by clients.
REVOKE EXECUTE ON FUNCTION public.increment_promo_uses(uuid) FROM PUBLIC, anon, authenticated;

-- 3) Free publication with a 100 % code: validates, records the redemption and
--    publishes atomically, as the wedding owner only.
CREATE OR REPLACE FUNCTION public.publish_with_promo(
  _wedding_id uuid,
  _slug text,
  _code text,
  _include_guestbook boolean DEFAULT false
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_promo public.promo_codes%ROWTYPE;
  v_slug text := lower(trim(COALESCE(_slug, '')));
BEGIN
  IF v_uid IS NULL THEN RETURN 'unauthorized'; END IF;

  IF NOT EXISTS (SELECT 1 FROM public.weddings w WHERE w.id = _wedding_id AND w.owner_id = v_uid) THEN
    RETURN 'not_found';
  END IF;

  IF v_slug !~ '^[a-z0-9][a-z0-9-]{1,59}$' THEN RETURN 'invalid_slug'; END IF;
  IF EXISTS (SELECT 1 FROM public.weddings w WHERE w.slug = v_slug AND w.id <> _wedding_id) THEN
    RETURN 'slug_taken';
  END IF;

  -- Row lock so two simultaneous redemptions can't both take the last use.
  SELECT * INTO v_promo FROM public.promo_codes p WHERE p.code = upper(trim(COALESCE(_code, ''))) FOR UPDATE;
  IF NOT FOUND THEN RETURN 'invalid_code'; END IF;
  IF NOT v_promo.is_active THEN RETURN 'inactive'; END IF;
  IF v_promo.valid_from IS NOT NULL AND v_promo.valid_from > now() THEN RETURN 'not_started'; END IF;
  IF v_promo.valid_until IS NOT NULL AND v_promo.valid_until < now() THEN RETURN 'expired'; END IF;
  IF v_promo.max_uses IS NOT NULL AND v_promo.uses >= v_promo.max_uses THEN RETURN 'exhausted'; END IF;
  IF v_promo.discount_percent < 100 THEN RETURN 'not_free'; END IF;

  INSERT INTO public.promo_code_redemptions (promo_code_id, code, wedding_id, user_id)
  VALUES (v_promo.id, v_promo.code, _wedding_id, v_uid);

  UPDATE public.promo_codes SET uses = uses + 1 WHERE id = v_promo.id;

  UPDATE public.weddings
     SET is_published = true,
         is_locked = true,
         published_at = now(),
         slug = v_slug,
         has_envelope_animation = false,
         has_guestbook = has_guestbook OR COALESCE(_include_guestbook, false)
   WHERE id = _wedding_id;

  RETURN 'ok';
END;
$$;

REVOKE ALL ON FUNCTION public.publish_with_promo(uuid, text, text, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.publish_with_promo(uuid, text, text, boolean) TO authenticated, service_role;

-- 4) Guard: end users (PostgREST roles "authenticated" / "anon") can no longer flip the paid flags.
--    SECURITY DEFINER functions run as their owner, so activate_payment_secure and
--    publish_with_promo are not affected.
CREATE OR REPLACE FUNCTION public.guard_wedding_paid_flags()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_old_guestbook boolean := false;
  v_old_published boolean := false;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    v_old_guestbook := COALESCE(OLD.has_guestbook, false);
    v_old_published := COALESCE(OLD.is_published, false);
  END IF;

  IF current_user IN ('authenticated', 'anon') THEN
    -- The guestbook add-on is only granted by a payment or a promo publication.
    IF COALESCE(NEW.has_guestbook, false) AND NOT v_old_guestbook THEN
      RAISE EXCEPTION 'guestbook_requires_payment' USING ERRCODE = '42501';
    END IF;

    -- Publishing needs a successful publication payment or a promo redemption on this wedding
    -- (so an unpublished wedding that was already paid for can be republished).
    IF COALESCE(NEW.is_published, false) AND NOT v_old_published THEN
      IF TG_OP = 'INSERT'
         OR (
           NOT EXISTS (
             SELECT 1 FROM public.payments p
             WHERE p.wedding_id = NEW.id AND p.status = 'success' AND p.payment_type = 'publication'
           )
           AND NOT EXISTS (
             SELECT 1 FROM public.promo_code_redemptions r WHERE r.wedding_id = NEW.id
           )
         )
      THEN
        RAISE EXCEPTION 'publication_requires_payment' USING ERRCODE = '42501';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS weddings_guard_paid_flags ON public.weddings;
CREATE TRIGGER weddings_guard_paid_flags
  BEFORE INSERT OR UPDATE ON public.weddings
  FOR EACH ROW EXECUTE FUNCTION public.guard_wedding_paid_flags();
