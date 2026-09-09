ALTER TABLE public.weddings
  ADD COLUMN IF NOT EXISTS rsvp_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS rsvp_quota integer,
  ADD COLUMN IF NOT EXISTS rsvp_quota_behavior text NOT NULL DEFAULT 'message';

ALTER TABLE public.weddings DROP CONSTRAINT IF EXISTS weddings_rsvp_quota_behavior_check;
ALTER TABLE public.weddings ADD CONSTRAINT weddings_rsvp_quota_behavior_check
  CHECK (rsvp_quota_behavior IN ('message','hide'));

-- Existing published weddings keep their RSVP button visible
UPDATE public.weddings SET rsvp_enabled = true WHERE is_published = true;

CREATE OR REPLACE FUNCTION public.rsvp_confirmed_count(_wedding_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(SUM(1 + GREATEST(COALESCE(r.companions,0),0)), 0)::int
  FROM public.rsvps r
  JOIN public.weddings w ON w.id = r.wedding_id
  WHERE r.wedding_id = _wedding_id
    AND r.attending IS TRUE
    AND w.is_published IS TRUE;
$$;

REVOKE ALL ON FUNCTION public.rsvp_confirmed_count(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rsvp_confirmed_count(uuid) TO anon, authenticated, service_role;