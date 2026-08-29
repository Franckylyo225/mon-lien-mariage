DROP POLICY IF EXISTS "profiles admin read" ON public.profiles;
CREATE POLICY "profiles admin read"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'owner')
);

DROP POLICY IF EXISTS "weddings admin read" ON public.weddings;
CREATE POLICY "weddings admin read"
ON public.weddings
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'owner')
);

DROP POLICY IF EXISTS "rsvps admin read" ON public.rsvps;
CREATE POLICY "rsvps admin read"
ON public.rsvps
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'owner')
);

DROP POLICY IF EXISTS "guests admin read" ON public.guests;
CREATE POLICY "guests admin read"
ON public.guests
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'owner')
);