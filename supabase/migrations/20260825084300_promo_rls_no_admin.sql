-- Allow any authenticated user to READ promo codes (needed for validation at checkout).
-- Promo codes are non-sensitive reference data meant to be entered by users.
CREATE POLICY "users read promo_codes" ON public.promo_codes
  FOR SELECT TO authenticated
  USING (true);

-- Allow authenticated users to insert their own redemption records.
GRANT INSERT ON public.promo_code_redemptions TO authenticated;
CREATE POLICY "users insert own redemptions" ON public.promo_code_redemptions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- SECURITY DEFINER function: atomically increment a promo code's use count.
-- Regular users cannot UPDATE promo_codes directly; this function lets them
-- record a redemption without needing the service role key.
CREATE OR REPLACE FUNCTION public.increment_promo_uses(p_code_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.promo_codes SET uses = uses + 1 WHERE id = p_code_id;
$$;

GRANT EXECUTE ON public.increment_promo_uses TO authenticated;
