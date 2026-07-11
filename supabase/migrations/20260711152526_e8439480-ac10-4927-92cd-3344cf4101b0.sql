
ALTER TABLE public.weddings DROP CONSTRAINT IF EXISTS weddings_owner_id_key;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS active_wedding_id uuid REFERENCES public.weddings(id) ON DELETE SET NULL;

-- Backfill: pick most recent wedding for each profile without active
UPDATE public.profiles p
SET active_wedding_id = w.id
FROM (
  SELECT DISTINCT ON (owner_id) id, owner_id
  FROM public.weddings
  ORDER BY owner_id, created_at DESC
) w
WHERE w.owner_id = p.id AND p.active_wedding_id IS NULL;
